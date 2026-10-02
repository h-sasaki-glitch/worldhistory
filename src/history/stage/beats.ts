/**
 * 演出キューの操作（純粋関数）。
 * プレイヤー自身の行動で起きた発見は、飛ばしてよい台詞（到着時のひと言など）より優先して表示する。
 * 物語上の演出（ハンムラビ登場・完了）の台詞は飛ばさない。
 */
export type QueueItem = { kind: string; skippable?: boolean };

export function pushUserBeat<T extends QueueItem>(queue: readonly T[], beat: T): T[] {
  const head = queue[0];
  if (head && head.kind === 'line' && head.skippable) return [beat, ...queue.slice(1)];
  return [...queue, beat];
}
