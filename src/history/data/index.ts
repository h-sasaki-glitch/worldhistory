import type { StageDefinition } from '@/history/stage/types';
import type { HistoryTerm } from '@/history/types';

import { CHINA_STAGE } from './stages/china';
import { EGYPT_STAGE } from './stages/egypt';
import { INDUS_STAGE } from './stages/indus';
import { MESOPOTAMIA_STAGE } from './stages/mesopotamia';
import { CHINA_TERMS } from './terms/china';
import { EGYPT_TERMS } from './terms/egypt';
import { INDUS_TERMS } from './terms/indus';
import { MESOPOTAMIA_TERMS } from './terms/mesopotamia';

/** 遊べるステージの語彙（ARCHIVE に並ぶ範囲） */
export const ALL_TERMS: HistoryTerm[] = [...MESOPOTAMIA_TERMS, ...EGYPT_TERMS, ...INDUS_TERMS, ...CHINA_TERMS];

export const TERMS_BY_ID: Record<string, HistoryTerm> = Object.fromEntries(
  ALL_TERMS.map((t) => [t.id, t]),
);

/** 遊べるステージ（時代順） */
export const STAGES: StageDefinition[] = [MESOPOTAMIA_STAGE, EGYPT_STAGE, INDUS_STAGE, CHINA_STAGE];

export const STAGES_BY_ID: Record<string, StageDefinition> = Object.fromEntries(
  STAGES.map((s) => [s.id, s]),
);

/**
 * 制作中（アート未整備）のステージ。データ検証と TIME LINK の確認に使い、画面には出さない。
 */
export const DRAFT_STAGES: StageDefinition[] = [];

/** 作成済みのすべての語彙（遊べるステージ＋制作中のステージ） */
export const LIBRARY_TERMS: HistoryTerm[] = ALL_TERMS;

export const LIBRARY_BY_ID: Record<string, HistoryTerm> = Object.fromEntries(
  LIBRARY_TERMS.map((t) => [t.id, t]),
);

/** 語彙の所属ステージ（語彙ファイル単位） */
export const HOME_STAGE_OF: Record<string, string> = Object.fromEntries([
  ...MESOPOTAMIA_TERMS.map((t) => [t.id, MESOPOTAMIA_STAGE.id] as const),
  ...EGYPT_TERMS.map((t) => [t.id, EGYPT_STAGE.id] as const),
  ...INDUS_TERMS.map((t) => [t.id, INDUS_STAGE.id] as const),
  ...CHINA_TERMS.map((t) => [t.id, CHINA_STAGE.id] as const),
]);

export function getTerm(id: string): HistoryTerm {
  const t = TERMS_BY_ID[id];
  if (!t) throw new Error(`Unknown term: ${id}`);
  return t;
}

/** 日本語版 Wikipedia の URL を記事タイトルから生成する */
export function wikipediaUrl(title: string): string {
  return `https://ja.wikipedia.org/wiki/${encodeURIComponent(title.replace(/ /g, '_'))}`;
}
