import type { StageDefinition } from '@/history/stage/types';
import type { HistoryTerm } from '@/history/types';

import { MESOPOTAMIA_STAGE } from './stages/mesopotamia';
import { MESOPOTAMIA_TERMS } from './terms/mesopotamia';

export const ALL_TERMS: HistoryTerm[] = [...MESOPOTAMIA_TERMS];

export const TERMS_BY_ID: Record<string, HistoryTerm> = Object.fromEntries(
  ALL_TERMS.map((t) => [t.id, t]),
);

export const STAGES: StageDefinition[] = [MESOPOTAMIA_STAGE];

export const STAGES_BY_ID: Record<string, StageDefinition> = Object.fromEntries(
  STAGES.map((s) => [s.id, s]),
);

export function getTerm(id: string): HistoryTerm {
  const t = TERMS_BY_ID[id];
  if (!t) throw new Error(`Unknown term: ${id}`);
  return t;
}

/** 日本語版 Wikipedia の URL を記事タイトルから生成する */
export function wikipediaUrl(title: string): string {
  return `https://ja.wikipedia.org/wiki/${encodeURIComponent(title.replace(/ /g, '_'))}`;
}
