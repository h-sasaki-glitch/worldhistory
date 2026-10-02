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
