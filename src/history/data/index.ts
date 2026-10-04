import { sortByVisit } from '@/history/stage/chronology';
import type { StageDefinition } from '@/history/stage/types';
import type { HistoryTerm } from '@/history/types';

import { CIVILIZATIONS, UPCOMING_STAGES } from './civilizations';

import { CHINA_STAGE } from './stages/china';
import { EGYPT_STAGE } from './stages/egypt';
import { GREECE_STAGE } from './stages/greece';
import { INDUS_STAGE } from './stages/indus';
import { MESOPOTAMIA_STAGE } from './stages/mesopotamia';
import { QIN_STAGE } from './stages/qin';
import { ROME_STAGE } from './stages/rome';
import { CHINA_TERMS } from './terms/china';
import { EGYPT_TERMS } from './terms/egypt';
import { GREECE_TERMS } from './terms/greece';
import { INDUS_TERMS } from './terms/indus';
import { MESOPOTAMIA_TERMS } from './terms/mesopotamia';
import { QIN_TERMS } from './terms/qin';
import { ROME_TERMS } from './terms/rome';

/** 遊べるステージの語彙（ARCHIVE に並ぶ範囲） */
export const ALL_TERMS: HistoryTerm[] = [
  ...EGYPT_TERMS,
  ...INDUS_TERMS,
  ...MESOPOTAMIA_TERMS,
  ...CHINA_TERMS,
  ...GREECE_TERMS,
  ...QIN_TERMS,
  ...ROME_TERMS,
];

export const TERMS_BY_ID: Record<string, HistoryTerm> = Object.fromEntries(
  ALL_TERMS.map((t) => [t.id, t]),
);

/**
 * 遊べるステージ。並び順は visitYear（訪れる年）の昇順で決まる。
 * 文明の起点年ではないので、BC 3500 に始まるメソポタミア文明でも
 * ハンムラビ王の BC 1750 を訪れるステージは、BC 2570 のギザより後に来る。
 */
export const STAGES: StageDefinition[] = sortByVisit([
  EGYPT_STAGE,
  INDUS_STAGE,
  MESOPOTAMIA_STAGE,
  CHINA_STAGE,
  GREECE_STAGE,
  QIN_STAGE,
  ROME_STAGE,
]);

export { CIVILIZATIONS, UPCOMING_STAGES };
export { CONCEPT_LABELS, conceptLabel } from './concepts';
export { RELATIONS } from './relations';

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
  ...GREECE_TERMS.map((t) => [t.id, GREECE_STAGE.id] as const),
  ...QIN_TERMS.map((t) => [t.id, QIN_STAGE.id] as const),
  ...ROME_TERMS.map((t) => [t.id, ROME_STAGE.id] as const),
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
