import type { StageDefinition, StageProgress } from './types';

/**
 * 時代の旅の進み具合（純粋関数）。
 * stages は visitYear 昇順（data の STAGES）を前提とし、前の時代を終えると次の時代へ旅立てる。
 * すでに記録のある時代は、並び順が変わっても到達済みとして開いたままにする
 * （ステージ順の見直しで、遊んだ時代が閉じてしまわないように）。
 */
export type StageStatus = 'COMPLETE' | 'ARRIVED' | 'NEXT DESTINATION' | 'LOCKED';

export type JourneyStop = {
  stage: StageDefinition;
  status: StageStatus;
  unlocked: boolean;
};

export function journey(stages: StageDefinition[], progress: Record<string, StageProgress | undefined>): JourneyStop[] {
  return stages.map((stage, i) => {
    const p = progress[stage.id];
    const started = !!p && Object.values(p.terms).some((t) => t.result !== null);
    const unlocked = i === 0 || !!progress[stages[i - 1].id]?.completed || started || !!p?.completed;
    const status: StageStatus = p?.completed
      ? 'COMPLETE'
      : !unlocked
        ? 'LOCKED'
        : started
          ? 'ARRIVED'
          : 'NEXT DESTINATION';
    return { stage, status, unlocked };
  });
}

/** タイトル画面で案内する時代: 旅の途中の時代、なければ最後に開いた時代 */
export function currentStop(stops: JourneyStop[]): JourneyStop {
  return (
    stops.find((s) => s.status === 'ARRIVED') ??
    stops.find((s) => s.status === 'NEXT DESTINATION') ??
    [...stops].reverse().find((s) => s.unlocked) ??
    stops[0]
  );
}
