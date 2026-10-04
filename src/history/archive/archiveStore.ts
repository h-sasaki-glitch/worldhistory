import type { DiscoveryResult, HistoryTerm } from '@/history/types';

import { linksUnlockedBy } from './linkResolver';
import { SECTION_OF, type ArchiveEntry, type ArchiveState, type DiscoverySource } from './types';

export function createArchive(): ArchiveState {
  return { version: 1, entries: {}, links: {} };
}

export type AddResult = {
  archive: ArchiveState;
  /** 新規登録なら true（既に登録済みなら false で archive は変化しない） */
  added: boolean;
  newLinks: string[];
};

/** 発見語を ARCHIVE に登録し、関連語とのあいだの LINK を解放する。重複登録はしない。 */
export function addDiscovery(
  archive: ArchiveState,
  input: { termId: string; stageId: string; source: DiscoverySource; result?: DiscoveryResult },
  termsById: Record<string, HistoryTerm>,
  now: number,
): AddResult {
  if (archive.entries[input.termId]) {
    // 既存エントリの学習結果だけは後から補完する
    const existing = archive.entries[input.termId];
    if (input.result && !existing.result) {
      return {
        archive: { ...archive, entries: { ...archive.entries, [input.termId]: { ...existing, result: input.result } } },
        added: false,
        newLinks: [],
      };
    }
    return { archive, added: false, newLinks: [] };
  }
  const newLinks = linksUnlockedBy(input.termId, archive, termsById);
  const entry: ArchiveEntry = { ...input, discoveredAt: now };
  const links = { ...archive.links };
  for (const key of newLinks) links[key] = { stageId: input.stageId, foundAt: now };
  return {
    archive: { ...archive, entries: { ...archive.entries, [input.termId]: entry }, links },
    added: true,
    newLinks,
  };
}

/**
 * 保存データを現在の語彙に合わせる。
 * 語彙の見直しで廃止した語（例: 秦の「法律」→「法家」に差し替え）の記録と、それに触れる LINK を取り除く。
 * 残った語どうしの LINK は、現在の関連（relatedTermIds）に合うものだけ残す。
 */
export function sanitizeArchive(archive: ArchiveState, termsById: Record<string, HistoryTerm>): ArchiveState {
  const entries = Object.fromEntries(Object.entries(archive.entries).filter(([id]) => termsById[id]));
  const links = Object.fromEntries(
    Object.entries(archive.links).filter(([key]) => {
      const [a, b] = key.split('|');
      if (!entries[a] || !entries[b]) return false;
      return termsById[a].relatedTermIds.includes(b) || termsById[b].relatedTermIds.includes(a);
    }),
  );
  // 現在の関連で、両方とも発見済みなのに未解放の LINK があれば解放する（関連を追加した場合）
  for (const a of Object.keys(entries)) {
    for (const key of linksUnlockedBy(a, { ...archive, entries, links }, termsById)) {
      const [x, y] = key.split('|');
      if (entries[x] && entries[y] && !links[key]) {
        const later = entries[x].discoveredAt > entries[y].discoveredAt ? entries[x] : entries[y];
        links[key] = { stageId: later.stageId, foundAt: later.discoveredAt };
      }
    }
  }
  return { ...archive, entries, links };
}

export function isDiscovered(archive: ArchiveState, termId: string): boolean {
  return !!archive.entries[termId];
}

export type StageSummary = {
  discovered: number;
  groups: { label: string; count: number }[];
  newLinks: number;
};

const SUMMARY_GROUPS = ['PEOPLE', 'PLACES', 'STATES', 'WRITING', 'CULTURE'] as const;

/** ステージ終了画面の集計（スコアではなく、発見の記録） */
export function summarizeStage(
  archive: ArchiveState,
  stageId: string,
  termsById: Record<string, HistoryTerm>,
): StageSummary {
  const entries = Object.values(archive.entries).filter((e) => e.stageId === stageId);
  const counts = new Map<string, number>();
  for (const e of entries) {
    const term = termsById[e.termId];
    if (!term) continue;
    const section = SECTION_OF[term.category];
    const label = (SUMMARY_GROUPS as readonly string[]).includes(section) ? section : 'OTHER';
    counts.set(label, (counts.get(label) ?? 0) + 1);
  }
  const groups = [...SUMMARY_GROUPS, 'OTHER']
    .map((label) => ({ label, count: counts.get(label) ?? 0 }))
    .filter((g) => g.count > 0);
  const newLinks = Object.values(archive.links).filter((l) => l.stageId === stageId).length;
  return { discovered: entries.length, groups, newLinks };
}
