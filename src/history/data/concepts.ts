/**
 * conceptId（分類）の表示名。conceptId は「同じ分類」を表すだけで、影響関係は表さない。
 * 影響・発展などの関係は data/relations.ts に、根拠のあるものだけを置く。
 */
export const CONCEPT_LABELS: Record<string, string> = {
  RIVER_CIVILIZATION: '大河のほとりの文明',
  GREAT_RIVER: '文明を育てた大河',
  WRITING_SYSTEM: '文字',
  WRITING_MEDIUM: '文字を書く材料',
  CALENDAR: '暦',
  NUMERAL_SYSTEM: '数の数え方',
  MONUMENTAL_ARCHITECTURE: '巨大な建造物',
  SUN_GOD: '太陽の神',
  AGRICULTURE: '農耕',
  TEMPLE: '神殿',
  IMPERIAL_RULE: '皇帝による統治',
  LEGAL_SYSTEM: '法のしくみ',
  THOUGHT: '思想',
  DEFENSIVE_WALL: '国を守る城壁',
  CITY_STATE: '都市国家',
  DEMOCRACY: '民主政',
  SACRED_KINGSHIP: '神とされた王',
  AFTERLIFE: '死後の世界',
  BRONZE_WARE: '青銅器',
  WORLD_RELIGION: '世界宗教',
};

export function conceptLabel(conceptId: string): string {
  return CONCEPT_LABELS[conceptId] ?? conceptId;
}
