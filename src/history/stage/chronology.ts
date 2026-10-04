import type { StageDefinition } from './types';

/**
 * 時間軸のモデル（純粋関数）。
 *
 * PROJECT EPOCH では「文明がいつ始まったか」と「プレイヤーがいつを訪れるか」を区別する。
 * - civilizationStartYear: 文明の起点（例: メソポタミア文明 BC 3500 ごろ）
 * - visitYear: そのステージで訪れる年（例: ハンムラビ王のバビロン BC 1750 ごろ）
 * ステージの並び・番号・「次の時代」はすべて visitYear から決まる。
 * 同じ文明を別の年に再訪するステージ（例: SUMER/URUK BC 3000 と BABYLON BC 1750）も
 * civilizationId を共有するだけで表現できる。
 */

export type Civilization = {
  id: string;
  /** 表示名（英字） */
  name: string;
  nameJa: string;
  /** 文明の起点（紀元前は負数）。教科書で一般的に示される目安 */
  startYear: number;
  /** 起点の根拠（何をもって始まりとしたか） */
  startBasis: string;
};

/** まだ遊べない、予告だけの目的地 */
export type UpcomingStage = {
  id: string;
  title: string;
  visitYear: number;
  timelineLabel: string;
};

export type NextStop =
  | { kind: 'stage'; stage: StageDefinition }
  | { kind: 'upcoming'; upcoming: UpcomingStage };

/** -1750 → 'BC 1750'、120 → 'AD 120'（西暦 0 年は存在しない） */
export function formatYear(year: number): string {
  if (year === 0) throw new Error('year 0 does not exist');
  return year < 0 ? `BC ${-year}` : `AD ${year}`;
}

/** visitYear の昇順に並べる（同年はステージ ID で安定化） */
export function sortByVisit<T extends { visitYear: number; id: string }>(items: readonly T[]): T[] {
  return [...items].sort((a, b) => a.visitYear - b.visitYear || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
}

/** ステージ番号（1 始まり）。データに番号を持たせず、visitYear の並びから決める */
export function stageNumberOf(stages: readonly StageDefinition[], stageId: string): number {
  const i = sortByVisit(stages).findIndex((s) => s.id === stageId);
  if (i < 0) throw new Error(`Unknown stage: ${stageId}`);
  return i + 1;
}

/**
 * stageId の次に訪れる目的地。
 * 遊べるステージを優先し、尽きたら予告（UPCOMING）のうち最も近い未来を返す。
 * どちらも visitYear が現在より後のものだけを対象にするので、過去へ戻ることはない。
 */
export function nextStopAfter(
  stageId: string,
  stages: readonly StageDefinition[],
  upcoming: readonly UpcomingStage[] = [],
): NextStop | undefined {
  const ordered = sortByVisit(stages);
  const i = ordered.findIndex((s) => s.id === stageId);
  if (i < 0) return undefined;
  const here = ordered[i];
  const next = ordered.slice(i + 1).find((s) => s.visitYear > here.visitYear);
  if (next) return { kind: 'stage', stage: next };
  const teaser = sortByVisit(upcoming.filter((u) => !stages.some((s) => s.id === u.id))).find(
    (u) => u.visitYear > here.visitYear,
  );
  return teaser ? { kind: 'upcoming', upcoming: teaser } : undefined;
}

export function nextStopLabel(stop: NextStop): { id: string; title: string; timelineLabel: string } {
  return stop.kind === 'stage'
    ? { id: stop.stage.id, title: stop.stage.title, timelineLabel: stop.stage.timelineLabel }
    : { id: stop.upcoming.id, title: stop.upcoming.title, timelineLabel: stop.upcoming.timelineLabel };
}
