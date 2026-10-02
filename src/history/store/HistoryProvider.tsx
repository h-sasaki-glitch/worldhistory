import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import { addDiscovery, createArchive } from '@/history/archive/archiveStore';
import type { ArchiveState, DiscoverySource } from '@/history/archive/types';
import { STAGES, STAGES_BY_ID, TERMS_BY_ID } from '@/history/data';
import { buildStageBoards, playableTermIds } from '@/history/stage/stageBoards';
import {
  addBackgroundDiscovery,
  applyDiscover,
  applyReveal,
  applySolve,
  markCompleted,
  markEventFired,
  recordAttempt,
  reconcileProgress,
  createStageProgress,
} from '@/history/stage/stageState';
import type { StageDefinition, StageProgress } from '@/history/stage/types';

import { loadJson, saveJson, STORAGE_KEYS } from './storage';

type State = {
  hydrated: boolean;
  archive: ArchiveState;
  stages: Record<string, StageProgress>;
};

export type DiscoveryOutcome = {
  termId: string;
  added: boolean;
  newLinks: string[];
};

type Api = State & {
  /** 盤面に入らなかった語を除いた、実際に遊ぶステージ定義 */
  playableStage: (stageId: string) => StageDefinition;
  progressOf: (stageId: string) => StageProgress;
  discover: (stageId: string, termId: string) => void;
  attempt: (stageId: string, termId: string) => void;
  solve: (stageId: string, termId: string) => DiscoveryOutcome;
  reveal: (stageId: string, termId: string) => DiscoveryOutcome;
  discoverBackground: (stageId: string, termId: string) => DiscoveryOutcome;
  markEvent: (stageId: string, eventId: string) => void;
  completeStage: (stageId: string) => DiscoveryOutcome | null;
  resetStage: (stageId: string) => void;
};

const Ctx = createContext<Api | null>(null);

function playable(stageId: string): StageDefinition {
  const stage = STAGES_BY_ID[stageId];
  const sb = buildStageBoards(stage, TERMS_BY_ID);
  return { ...stage, crossword: { ...stage.crossword, termIds: playableTermIds(stage, sb) } };
}

function freshStage(stageId: string): StageProgress {
  const sb = buildStageBoards(STAGES_BY_ID[stageId], TERMS_BY_ID);
  return createStageProgress(playable(stageId), sb.signature);
}

export function HistoryProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(() => ({
    hydrated: false,
    archive: createArchive(),
    stages: Object.fromEntries(STAGES.map((s) => [s.id, freshStage(s.id)])),
  }));
  // アクションは同期的に次状態を計算して結果を返すため、最新状態を ref でも保持する
  const ref = useRef(state);
  ref.current = state;
  const dirty = useRef(new Set<string>());

  useEffect(() => {
    let alive = true;
    (async () => {
      const archive = (await loadJson<ArchiveState>(STORAGE_KEYS.archive)) ?? createArchive();
      const stages: Record<string, StageProgress> = {};
      for (const s of STAGES) {
        const saved = await loadJson<StageProgress>(STORAGE_KEYS.stage(s.id));
        const sb = buildStageBoards(s, TERMS_BY_ID);
        stages[s.id] = reconcileProgress(saved, playable(s.id), sb.boards, sb.signature);
      }
      if (alive) setState({ hydrated: true, archive: archive.version === 1 ? archive : createArchive(), stages });
    })();
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (!state.hydrated || dirty.current.size === 0) return;
    const keys = [...dirty.current];
    dirty.current.clear();
    for (const k of keys) {
      if (k === 'archive') saveJson(STORAGE_KEYS.archive, state.archive);
      else saveJson(STORAGE_KEYS.stage(k), state.stages[k]);
    }
  }, [state]);

  const commit = useCallback((next: State, changed: string[]) => {
    changed.forEach((k) => dirty.current.add(k));
    ref.current = next;
    setState(next);
  }, []);

  const updateStage = useCallback(
    (stageId: string, fn: (p: StageProgress) => StageProgress) => {
      const cur = ref.current;
      const next = fn(cur.stages[stageId]);
      if (next === cur.stages[stageId]) return;
      commit({ ...cur, stages: { ...cur.stages, [stageId]: next } }, [stageId]);
    },
    [commit],
  );

  const archiveTerm = useCallback(
    (
      stageId: string,
      termId: string,
      source: DiscoverySource,
      stageFn: (p: StageProgress) => StageProgress,
    ): DiscoveryOutcome => {
      const cur = ref.current;
      const progress = stageFn(cur.stages[stageId]);
      const result = progress.terms[termId]?.result ?? undefined;
      const r = addDiscovery(cur.archive, { termId, stageId, source, result }, TERMS_BY_ID, Date.now());
      commit({ ...cur, archive: r.archive, stages: { ...cur.stages, [stageId]: progress } }, ['archive', stageId]);
      return { termId, added: r.added, newLinks: r.newLinks };
    },
    [commit],
  );

  const api = useMemo<Api>(() => {
    const boardsOf = (stageId: string) => buildStageBoards(STAGES_BY_ID[stageId], TERMS_BY_ID).boards;
    return {
      ...state,
      playableStage: playable,
      progressOf: (stageId) => state.stages[stageId],
      discover: (stageId, termId) => updateStage(stageId, (p) => applyDiscover(p, termId)),
      attempt: (stageId, termId) => updateStage(stageId, (p) => recordAttempt(p, termId)),
      solve: (stageId, termId) =>
        archiveTerm(stageId, termId, 'CROSSWORD', (p) => applySolve(p, boardsOf(stageId), termId, Date.now())),
      reveal: (stageId, termId) =>
        archiveTerm(stageId, termId, 'CROSSWORD', (p) => applyReveal(p, boardsOf(stageId), termId, Date.now())),
      discoverBackground: (stageId, termId) =>
        archiveTerm(stageId, termId, 'BACKGROUND', (p) => addBackgroundDiscovery(p, termId)),
      markEvent: (stageId, eventId) => updateStage(stageId, (p) => markEventFired(p, eventId)),
      completeStage: (stageId) => {
        const stage = playable(stageId);
        const before = ref.current.stages[stageId];
        const after = markCompleted(before, stage, Date.now());
        if (after === before) return null;
        return archiveTerm(stageId, stage.completion.unlockTermId, 'EVENT', () => after);
      },
      resetStage: (stageId) => {
        const cur = ref.current;
        const entries = Object.fromEntries(Object.entries(cur.archive.entries).filter(([, e]) => e.stageId !== stageId));
        const links = Object.fromEntries(Object.entries(cur.archive.links).filter(([, l]) => l.stageId !== stageId));
        commit(
          { ...cur, archive: { ...cur.archive, entries, links }, stages: { ...cur.stages, [stageId]: freshStage(stageId) } },
          ['archive', stageId],
        );
      },
    };
  }, [state, updateStage, archiveTerm, commit]);

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useHistory(): Api {
  const v = useContext(Ctx);
  if (!v) throw new Error('useHistory must be used inside HistoryProvider');
  return v;
}
