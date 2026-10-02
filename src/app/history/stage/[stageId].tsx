import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { CluePanel } from '@/components/history/CluePanel';
import { CrosswordBoard } from '@/components/history/CrosswordBoard';
import { DiscoveryCard } from '@/components/history/DiscoveryCard';
import { HistoryWorld } from '@/components/history/HistoryWorld';
import { Screen } from '@/components/history/Screen';
import { StageComplete } from '@/components/history/StageComplete';
import { C, F, caps } from '@/components/history/theme';
import { TimeShift } from '@/components/history/TimeShift';
import { useDiscoverySound } from '@/components/history/useDiscoverySound';
import { summarizeStage } from '@/history/archive/archiveStore';
import { nextUnresolved, selectAt, selectPlacement, type WordSelection } from '@/history/crossword/selection';
import { STAGES_BY_ID, TERMS_BY_ID } from '@/history/data';
import { checkAnswer, type AnswerInputMode } from '@/history/input/answerInput';
import { pushUserBeat } from '@/history/stage/beats';
import { buildStageBoards } from '@/history/stage/stageBoards';
import {
  hasFired,
  isCrosswordComplete,
  isResolved,
  knownLetters,
  resolvedCount,
  shouldFireMidEvent,
} from '@/history/stage/stageState';
import type { StageLine } from '@/history/stage/types';
import { useHistory, type DiscoveryOutcome } from '@/history/store/HistoryProvider';

/**
 * 演出の進行（ビート）。先頭から 1 つずつ処理する。
 * line: 台詞（タップ or 時間で次へ） / title: タイトル表示 / set: 演出状態の切替
 * discovery: 発見カード / run: 処理を実行 / complete: ステージ終了画面
 */
type Beat =
  | { kind: 'line'; line: StageLine; autoMs: number; skippable?: boolean }
  | { kind: 'title'; title: string; subtitle: string; ms: number }
  | { kind: 'set'; patch: Partial<Scene> }
  | { kind: 'discovery'; outcome: DiscoveryOutcome; heading: string; autoCloseMs: number }
  | { kind: 'run'; fn: () => Beat[] }
  | { kind: 'complete' };

type Scene = {
  worldDim: boolean;
  boardDim: boolean;
  scribeBowed: boolean;
  hammurabi: boolean;
};

const FIRST_SOLVE_EVENT = 'first_solve';

export default function StageScreen() {
  const { stageId = 'mesopotamia' } = useLocalSearchParams<{ stageId: string }>();
  const { hydrated } = useHistory();
  if (!STAGES_BY_ID[stageId]) {
    return (
      <Screen>
        <Text style={styles.missing}>この時代はまだ記録されていない。</Text>
      </Screen>
    );
  }
  // 保存データの復元が終わるまでは暗転のまま待つ
  if (!hydrated) return <Screen>{null}</Screen>;
  return <StageView stageId={stageId} />;
}

function StageView({ stageId }: { stageId: string }) {
  const api = useHistory();
  const baseStage = STAGES_BY_ID[stageId];
  const stage = useMemo(() => api.playableStage(stageId), [api, stageId]);
  const sb = useMemo(() => buildStageBoards(baseStage, TERMS_BY_ID), [baseStage]);
  const progress = api.progressOf(stageId);
  const playSound = useDiscoverySound();

  const [shifting, setShifting] = useState(true);
  const [boardIndex, setBoardIndex] = useState(0);
  const board = sb.boards[boardIndex];
  const [selection, setSelection] = useState<WordSelection | null>(null);
  const [inputMode, setInputMode] = useState<AnswerInputMode>('keyboard');
  const [glow, setGlow] = useState<Record<string, number>>({});
  const [beats, setBeats] = useState<Beat[]>([]);
  const [scene, setScene] = useState<Scene>(() => ({
    worldDim: false,
    boardDim: progress.completed,
    scribeBowed: false,
    hammurabi: hasFired(progress, stage.midEvent.id) || progress.completed,
  }));
  const completionQueued = useRef(progress.completed);
  const enqueue = useCallback((...b: Beat[]) => setBeats((q) => [...q, ...b]), []);
  const enqueueUserBeat = useCallback((b: Beat) => setBeats((q) => pushUserBeat(q, b)), []);
  const advance = useCallback(() => setBeats((q) => q.slice(1)), []);
  const beat = beats[0];

  const resolvedFn = useCallback((id: string) => isResolved(progress, id), [progress]);

  // 初期選択: 最初の未解答語
  useEffect(() => {
    if (selection || !board) return;
    const first = board.placements.find((x) => x.id === stage.crossword.firstTermId && !resolvedFn(x.id));
    const p = first ?? nextUnresolved(board, null, resolvedFn) ?? board.placements[0];
    if (p) setSelection(selectPlacement(p));
  }, [board, selection, resolvedFn, stage.crossword.firstTermId]);

  // 到着時の台詞
  const onShiftDone = useCallback(() => {
    setShifting(false);
    if (!progress.completed) enqueue({ kind: 'line', line: stage.openingLine, autoMs: 6000, skippable: true });
  }, []);

  // ビートの処理（自動で進むもの）
  useEffect(() => {
    if (!beat) return;
    if (beat.kind === 'set') {
      setScene((s) => ({ ...s, ...beat.patch }));
      advance();
    } else if (beat.kind === 'run') {
      const more = beat.fn();
      setBeats((q) => [...more, ...q.slice(1)]);
    } else if (beat.kind === 'title') {
      const t = setTimeout(advance, beat.ms);
      return () => clearTimeout(t);
    } else if (beat.kind === 'line' && beat.autoMs > 0) {
      const t = setTimeout(advance, beat.autoMs);
      return () => clearTimeout(t);
    }
  }, [beat, advance]);

  // 進捗に応じたイベント（初正解の反応・ハンムラビ登場・ステージ完了）
  useEffect(() => {
    if (!api.hydrated || shifting) return;
    if (stage.firstSolveLine && !hasFired(progress, FIRST_SOLVE_EVENT) && resolvedCount(progress, stage) >= 1) {
      api.markEvent(stageId, FIRST_SOLVE_EVENT);
      if (!shouldFireMidEvent(progress, stage)) enqueue({ kind: 'line', line: stage.firstSolveLine, autoMs: 3500, skippable: true });
    }
    if (shouldFireMidEvent(progress, stage)) {
      const ev = stage.midEvent;
      api.markEvent(stageId, ev.id);
      enqueue(
        { kind: 'set', patch: { worldDim: true } },
        { kind: 'line', line: ev.reactionLine, autoMs: 2600 },
        { kind: 'set', patch: { scribeBowed: true, worldDim: false, hammurabi: true } },
        { kind: 'title', ...ev.titleCard, ms: 2000 },
        { kind: 'line', line: ev.line, autoMs: 6000 },
        { kind: 'set', patch: { scribeBowed: false } },
      );
    }
    if (isCrosswordComplete(progress, stage) && !progress.completed && !completionQueued.current) {
      completionQueued.current = true;
      enqueue(
        { kind: 'set', patch: { boardDim: true, hammurabi: true } },
        { kind: 'line', line: stage.completion.line, autoMs: 0 },
        {
          kind: 'run',
          fn: () => {
            const outcome = api.completeStage(stageId);
            if (!outcome) return [{ kind: 'complete' }];
            playSound();
            return [
              { kind: 'discovery', outcome, heading: 'NEW DISCOVERY', autoCloseMs: 0 },
              { kind: 'complete' },
            ];
          },
        },
      );
    }
  }, [api, progress, stage, stageId, shifting, enqueue, playSound]);

  const selectedPlacement = selection ? board?.placements.find((p) => p.id === selection.placementId) : undefined;
  const selectedTerm = selectedPlacement ? TERMS_BY_ID[selectedPlacement.id] : undefined;

  const resolveSelected = (mode: 'solve' | 'reveal') => {
    if (!selectedPlacement) return;
    const id = selectedPlacement.id;
    const outcome = mode === 'solve' ? api.solve(stageId, id) : api.reveal(stageId, id);
    playSound();
    setGlow((g) => ({ ...g, [id]: Date.now() }));
    enqueueUserBeat({ kind: 'discovery', outcome, heading: 'DISCOVERED', autoCloseMs: 3400 });
    const next = nextUnresolved(board, id, (x) => x === id || isResolved(progress, x));
    if (next) setSelection(selectPlacement(next));
  };

  const onSubmit = (raw: string | string[]) => {
    const check = checkAnswer(raw, selectedPlacement!.cells);
    if (check.kind === 'correct') resolveSelected('solve');
    else if (check.kind !== 'invalid') api.attempt(stageId, selectedPlacement!.id);
    return check;
  };

  const onHotspot = (termId: string) => {
    if (progress.backgroundDiscoveries.includes(termId)) {
      router.push(`/history/term/${termId}`);
      return;
    }
    const outcome = api.discoverBackground(stageId, termId);
    playSound();
    enqueueUserBeat({ kind: 'discovery', outcome, heading: 'DISCOVERY', autoCloseMs: 3400 });
  };

  const caption = beat?.kind === 'line' ? beat.line : null;
  const titleCard = beat?.kind === 'title' ? { title: beat.title, subtitle: beat.subtitle } : null;
  const discovery = beat?.kind === 'discovery' ? beat : null;
  const showComplete = beat?.kind === 'complete';

  if (!board) {
    return (
      <Screen>
        <Text style={styles.missing}>この時代の盤面を作れなかった。</Text>
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.world}>
        <HistoryWorld
          stage={stage}
          backgroundDiscovered={progress.backgroundDiscoveries}
          showHammurabi={scene.hammurabi}
          scribeBowed={scene.scribeBowed}
          dimmed={scene.worldDim}
          caption={caption}
          onCaptionPress={advance}
          titleCard={titleCard}
          onHotspot={onHotspot}
          resolved={resolvedCount(progress, stage)}
          total={stage.crossword.termIds.length}
          archiveCount={Object.keys(api.archive.entries).length}
          onArchive={() => router.push('/history/archive')}
          onExit={() => (router.canGoBack() ? router.back() : router.replace('/history'))}
          overlay={
            discovery && (
              <DiscoveryCard
                key={`${discovery.heading}-${discovery.outcome.termId}`}
                term={TERMS_BY_ID[discovery.outcome.termId]}
                heading={discovery.heading}
                newLinks={discovery.outcome.newLinks.length}
                autoCloseMs={discovery.autoCloseMs}
                onClose={advance}
                onOpen={() => {
                  advance();
                  router.push(`/history/term/${discovery.outcome.termId}`);
                }}
              />
            )
          }
        />
      </View>

      <View style={styles.bottom}>
        {sb.boards.length > 1 && (
          <View style={styles.tabs}>
            {sb.boards.map((_, i) => (
              <Pressable
                key={i}
                onPress={() => {
                  setBoardIndex(i);
                  setSelection(null);
                }}
              >
                <Text style={[styles.tab, i === boardIndex && styles.tabOn]}>BOARD {String.fromCharCode(65 + i)}</Text>
              </Pressable>
            ))}
          </View>
        )}
        <View style={[styles.boardWrap, scene.boardDim && styles.boardDim]}>
          <CrosswordBoard
            board={board}
            boardIndex={boardIndex}
            cells={progress.cells}
            selection={selection}
            glow={glow}
            onSelect={(r, c) => setSelection((cur) => selectAt(board, r, c, cur, resolvedFn) ?? cur)}
          />
        </View>

        {progress.completed && !showComplete ? (
          <View style={styles.doneBar}>
            <Text style={styles.doneText}>この時代の言葉は、すべて記された。</Text>
            <View style={styles.doneActions}>
              <Pressable onPress={() => router.push('/history/timeline')} style={styles.doneBtn}>
                <Text style={styles.doneBtnText}>次の時代へ</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  api.resetStage(stageId);
                  completionQueued.current = false;
                  setScene({ worldDim: false, boardDim: false, scribeBowed: false, hammurabi: false });
                  setSelection(null);
                  setGlow({});
                }}
                hitSlop={8}
              >
                <Text style={styles.reset}>最初から旅をやり直す</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          selectedPlacement &&
          selectedTerm && (
            <CluePanel
              term={selectedTerm}
              placement={selectedPlacement}
              progress={progress.terms[selectedPlacement.id]}
              known={knownLetters(progress, boardIndex, board, selectedPlacement.id)}
              inputMode={inputMode}
              onToggleMode={() => setInputMode((m) => (m === 'keyboard' ? 'tiles' : 'keyboard'))}
              onSubmit={onSubmit}
              onDiscover={() => api.discover(stageId, selectedPlacement.id)}
              onReveal={() => resolveSelected('reveal')}
              onOpenTerm={() => router.push(`/history/term/${selectedPlacement.id}`)}
            />
          )
        )}
      </View>

      {showComplete && (
        <StageComplete
          stage={stage}
          summary={summarizeStage(api.archive, stageId, TERMS_BY_ID)}
          onNext={() => {
            advance();
            router.replace('/history/timeline');
          }}
          onArchive={() => router.push('/history/archive')}
        />
      )}

      {shifting && <TimeShift place={stage.place} era={stage.eraLabel} onDone={onShiftDone} />}
    </Screen>
  );
}

const styles = StyleSheet.create({
  missing: { color: C.sand, padding: 24, fontFamily: F.ja },
  world: { flex: 4 },
  bottom: { flex: 6, backgroundColor: C.ink },
  tabs: { flexDirection: 'row', gap: 18, paddingHorizontal: 16, paddingTop: 8 },
  tab: { ...caps, fontSize: 11, color: C.textFaint },
  tabOn: { color: C.gold },
  boardWrap: { flex: 1, padding: 10 },
  boardDim: { opacity: 0.45 },
  doneBar: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: C.panelEdge,
    backgroundColor: C.panel,
    gap: 12,
  },
  doneText: { fontFamily: F.ja, color: C.sand, fontSize: 14, textAlign: 'center' },
  doneActions: { alignItems: 'center', gap: 12 },
  doneBtn: { borderWidth: 1, borderColor: C.gold, paddingVertical: 10, paddingHorizontal: 36 },
  doneBtnText: { fontFamily: F.ja, color: '#f2dfb4', fontSize: 15, letterSpacing: 3 },
  reset: { fontFamily: F.ja, color: C.textFaint, fontSize: 11, textDecorationLine: 'underline' },
});
