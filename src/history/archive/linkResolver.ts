import type { HistoryTerm } from '@/history/types';

import type { ArchiveState } from './types';

export function linkKey(a: string, b: string): string {
  return a < b ? `${a}|${b}` : `${b}|${a}`;
}

/**
 * 関連語（双方向）。A.relatedTermIds に B がある、または B.relatedTermIds に A があれば関連。
 * 用語データに存在しない ID は無視する。
 */
export function relatedIds(termId: string, termsById: Record<string, HistoryTerm>): string[] {
  const out = new Set<string>();
  for (const id of termsById[termId]?.relatedTermIds ?? []) if (termsById[id] && id !== termId) out.add(id);
  for (const t of Object.values(termsById)) {
    if (t.id !== termId && t.relatedTermIds.includes(termId)) out.add(t.id);
  }
  return [...out];
}

/** termId が発見されたとき、新たに解放される LINK のキー */
export function linksUnlockedBy(
  termId: string,
  archive: ArchiveState,
  termsById: Record<string, HistoryTerm>,
): string[] {
  return relatedIds(termId, termsById)
    .filter((id) => archive.entries[id])
    .map((id) => linkKey(termId, id))
    .filter((key) => !archive.links[key]);
}

export type Connection = { termId: string; found: boolean };

/**
 * ARCHIVE カード用の CONNECTED 一覧。
 * 表示順は「用語自身の relatedTermIds の順」→「逆参照」。発見済みを先に並べる。
 */
export function connectionsOf(
  termId: string,
  archive: ArchiveState,
  termsById: Record<string, HistoryTerm>,
): { connections: Connection[]; found: number; total: number } {
  const own = (termsById[termId]?.relatedTermIds ?? []).filter((id) => termsById[id]);
  const ordered = [...new Set([...own, ...relatedIds(termId, termsById)])];
  const connections = ordered.map((id) => ({ termId: id, found: !!archive.links[linkKey(termId, id)] }));
  connections.sort((a, b) => Number(b.found) - Number(a.found));
  const found = connections.filter((c) => c.found).length;
  return { connections, found, total: connections.length };
}

/** 2 つの用語が同一概念（TIME LINK）でつながっているか */
export function sharesConcept(a: HistoryTerm, b: HistoryTerm): boolean {
  return !!a.conceptId && a.conceptId === b.conceptId;
}
