import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View, type LayoutChangeEvent } from 'react-native';

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
import { STAGES, STAGES_BY_ID, TERMS_BY_ID, UPCOMING_STAGES } from '@/history/data';
import { checkAnswer, type AnswerInputMode } from '@/history/input/answerInput';
import { pushUserBeat } from '@/history/stage/beats';
import { nextStopAfter, nextStopLabel } from '@/history/stage/chronology';
import { stageLayout } from '@/history/stage/layout';
import { boardTabLabel, buildStageBoards, initialBoardIndex, nextTarget } from '@/history/stage/stageBoards';
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
  hostBowed: boolean;
  arrival: boolean;
};

const FIRST_SOLVE_EVENT = 'first_solve';

/** スマホなど指で操作する端末では、ソフトキーボードで盤面が隠れないよう文字盤入力を標準にする */
function defaultInputMode(): AnswerInputMode {
  if (Platform.OS !== 'web') return 'tiles';
  try {
    return window.matchMedia?.('(pointer: coarse)').matches ? 'tiles' : 'keyboard';
  } catch {
    return 'keyboard';
  }
}

export default function StageScreen() {
  const { stageId = STAGES[0].id } = useLocalSearchParams<{ stageId: string }>();
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
  const nextStop = useMemo(() => nextStopAfter(stageId, STAGES, UPCOMING_STAGES), [stageId]);
  const sb = useMemo(() => buildStageBoards(baseStage, TERMS_BY_ID), [baseStage]);
  const progress = api.progressOf(stageId);
  const playSound = useDiscoverySound();

  const [shifting, setShifting] = useState(true);
  // 最初の語がある盤面（途中から再開した場合は、未解答の残る盤面）から始める
  const [boardIndex, setBoardIndex] = useState(() =>
    initialBoardIndex(sb, baseStage.crossword.firstTermId, (id) => isResolved(progress, id)),
  );
  const board = sb.boards[boardIndex];
  const [selection, setSelection] = useState<WordSelection | null>(null);
  const [inputMode, setInputMode] = useState<AnswerInputMode>(defaultInputMode);
  const [pendingCells, setPendingCells] = useState<(string | null)[]>([]);
  const [screen, setScreen] = useState({ w: 0, h: 0 });
  const [clueHeight, setClueHeight] = useState(130);
  const [glow, setGlow] = useState<Record<string, number>>({});
  const [beats, setBeats] = useState<Beat[]>([]);
  const [scene, setScene] = useState<Scene>(() => ({
    worldDim: false,
    boardDim: progress.completed,
    hostBowed: false,
    arrival: hasFired(progress, stage.midEvent.id) || progress.completed,
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
      if (!shouldFireMidEvent(progress, stage))
        enqueue({ kind: 'line', line: stage.firstSolveLine, autoMs: 3500, skippable: true });
    }
    if (shouldFireMidEvent(progress, stage)) {
      const ev = stage.midEvent;
      api.markEvent(stageId, ev.id);
      enqueue(
        { kind: 'set', patch: { worldDim: true } },
        { kind: 'line', line: ev.reactionLine, autoMs: 2600 },
        { kind: 'set', patch: { hostBowed: true, worldDim: false, arrival: true } },
        { kind: 'title', ...ev.titleCard, ms: 2000 },
        { kind: 'line', line: ev.line, autoMs: 6000 },
        { kind: 'set', patch: { hostBowed: false } },
        {
          kind: 'run',
          fn: () => {
            if (!ev.unlockTermId) return [];
            const outcome = api.discoverByEvent(stageId, ev.unlockTermId);
            if (!outcome.added) return [];
            playSound();
            return [{ kind: 'discovery', outcome, heading: 'NEW DISCOVERY', autoCloseMs: 3400 }];
          },
        },
      );
    }
    if (isCrosswordComplete(progress, stage) && !progress.completed && !completionQueued.current) {
      completionQueued.current = true;
      enqueue(
        { kind: 'set', patch: { boardDim: true, arrival: true } },
        { kind: 'line', line: stage.completion.line, autoMs: 0 },
        {
          kind: 'run',
          fn: () => {
            const outcome = api.completeStage(stageId);
            if (!outcome) return [{ kind: 'complete' }];
            playSound();
            return [{ kind: 'discovery', outcome, heading: 'NEW DISCOVERY', autoCloseMs: 0 }, { kind: 'complete' }];
          },
        },
      );
    }
  }, [api, progress, stage, stageId, shifting, enqueue, playSound]);

  const selectedPlacement = selection ? board?.placements.find((p) => p.id === selection.placementId) : undefined;
  const selectedTerm = selectedPlacement ? TERMS_BY_ID[selectedPlacement.id] : undefined;

  // 入力中の文字を、選択中の語のマスに重ねて見せる
  const pendingMap = useMemo(() => {
    const out: Record<string, string> = {};
    if (!selectedPlacement || isResolved(progress, selectedPlacement.id)) return out;
    pendingCells.forEach((ch, i) => {
      if (!ch) return;
      const r = selectedPlacement.direction === 'down' ? selectedPlacement.row + i : selectedPlacement.row;
      const c = selectedPlacement.direction === 'across' ? selectedPlacement.col + i : selectedPlacement.col;
      out[`${r}:${c}`] = ch;
    });
    return out;
  }, [selectedPlacement, pendingCells, progress]);

  const layout =
    board && screen.h > 0
      ? stageLayout({
          width: screen.w,
          height: screen.h,
          cols: board.width,
          rows: board.height,
          clueHeight,
          tabs: sb.boards.length > 1,
        })
      : null;

  const resolveSelected = (mode: 'solve' | 'reveal') => {
    if (!selectedPlacement) return;
    const id = selectedPlacement.id;
    const outcome = mode === 'solve' ? api.solve(stageId, id) : api.reveal(stageId, id);
    playSound();
    setGlow((g) => ({ ...g, [id]: Date.now() }));
    enqueueUserBeat({ kind: 'discovery', outcome, heading: 'DISCOVERED', autoCloseMs: 3400 });
    // いまの盤面を解き終えたら、未解答の残る次の盤面へ自動で移る
    const next = nextTarget(sb, boardIndex, id, (x) => x === id || isResolved(progress, x));
    if (next) {
      if (next.boardIndex !== boardIndex) setBoardIndex(next.boardIndex);
      setSelection(selectPlacement(next.placement));
    }
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
  // 自動では進まない台詞（クリア時の王の言葉など）はタップを待つ
  const waitingForTap = beat?.kind === 'line' && beat.autoMs === 0;
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
      <View
        style={styles.root}
        onLayout={(e: LayoutChangeEvent) =>
          setScreen({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })
        }
      >
        <View style={layout ? { height: layout.worldHeight } : styles.world}>
          <HistoryWorld
            compact={layout?.compact ?? false}
            stage={stage}
            backgroundDiscovered={progress.backgroundDiscoveries}
            showArrival={scene.arrival}
            hostBowed={scene.hostBowed}
            dimmed={scene.worldDim}
            caption={caption}
            onCaptionPress={advance}
          captionWaiting={waitingForTap}
            titleCard={titleCard}
            onHotspot={onHotspot}
            resolved={resolvedCount(progress, stage)}
            total={stage.crossword.termIds.length}
            archiveCount={Object.keys(api.archive.entries).length}
            onArchive={() => router.push('/history/archive')}
            onExit={() => (router.canGoBack() ? router.back() : router.replace('/history'))}
          />
        </View>

        <View style={styles.bottom}>
          {sb.boards.length > 1 && (
            <View style={styles.tabs}>
              {sb.boards.map((b, i) => {
                const left = b.placements.filter((p) => !isResolved(progress, p.id)).length;
                return (
                  <Pressable
                    key={i}
                    onPress={() => {
                      setBoardIndex(i);
                      setSelection(null);
                    }}
                    hitSlop={{ top: 8, bottom: 8 }}
                    style={[styles.tabBtn, i === boardIndex && styles.tabBtnOn]}
                    accessibilityRole="tab"
                    accessibilityState={{ selected: i === boardIndex }}
                  >
                    <Text style={[styles.tab, i === boardIndex && styles.tabOn]} numberOfLines={1}>
                      {boardTabLabel(sb, i)}
                    </Text>
                    <Text style={[styles.tabCount, left === 0 && styles.tabDone]}>{left === 0 ? '✓' : left}</Text>
                  </Pressable>
                );
              })}
            </View>
          )}
          <View style={[styles.boardWrap, scene.boardDim && styles.boardDim]}>
            <CrosswordBoard
              board={board}
              boardIndex={boardIndex}
              cells={progress.cells}
              selection={selection}
              glow={glow}
              pending={pendingMap}
              onSelect={(r, c) => setSelection((cur) => selectAt(board, r, c, cur, resolvedFn) ?? cur)}
            />
          </View>

          <View onLayout={(e: LayoutChangeEvent) => setClueHeight(Math.round(e.nativeEvent.layout.height))}>
            {progress.completed && !showComplete ? (
              <View style={styles.doneBar}>
                <Text style={styles.doneText}>この時代の言葉は、すべて記された。</Text>
                <View style={styles.doneActions}>
                  <Pressable onPress={() => router.dismissTo('/history/timeline')} style={styles.doneBtn}>
                    <Text style={styles.doneBtnText}>次の時代へ</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => {
                      api.resetStage(stageId);
                      completionQueued.current = false;
                      setScene({ worldDim: false, boardDim: false, hostBowed: false, arrival: false });
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
                  onPendingChange={setPendingCells}
                  onDiscover={() => api.discover(stageId, selectedPlacement.id)}
                  onReveal={() => resolveSelected('reveal')}
                  onOpenTerm={() => router.push(`/history/term/${selectedPlacement.id}`)}
                />
              )
            )}
          </View>
        </View>

        {showComplete && (
          <StageComplete
            stage={stage}
            next={nextStop ? nextStopLabel(nextStop) : undefined}
            summary={summarizeStage(api.archive, stageId, TERMS_BY_ID)}
            onNext={() => {
              advance();
              router.dismissTo('/history/timeline');
            }}
            onArchive={() => router.push('/history/archive')}
          />
        )}
      </View>
      {waitingForTap && (
        // 画面のどこをタップしても先へ進める（台詞の▼と「タップして続ける」で合図する）
        <Pressable style={styles.tapCatcher} onPress={advance} accessibilityLabel="タップして続ける" />
      )}
      {discovery && (
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
      )}
      {shifting && <TimeShift place={stage.place} era={stage.eraLabel} onDone={onShiftDone} />}
    </Screen>
  );
}

const styles = StyleSheet.create({
  missing: { color: C.sand, padding: 24, fontFamily: F.ja },
  root: { flex: 1 },
  tapCatcher: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 20 },
  world: { flex: 4 },
  bottom: { flex: 1, backgroundColor: C.ink },
  tabs: { flexDirection: 'row', gap: 8, paddingHorizontal: 12, paddingTop: 6 },
  tabBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    height: 22,
    borderBottomWidth: 1,
    borderBottomColor: 'transparent',
  },
  tabBtnOn: { borderBottomColor: C.gold },
  tab: { fontFamily: F.ja, fontSize: 11, letterSpacing: 1, color: C.textFaint },
  tabOn: { color: C.gold },
  tabCount: { fontFamily: F.latin, fontSize: 10, color: C.textDim },
  tabDone: { color: C.gold },
  boardWrap: { flex: 1, padding: 6 },
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
