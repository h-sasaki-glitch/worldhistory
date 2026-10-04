import type { StageDefinition } from '@/history/stage/types';

/**
 * STAGE INDUS。
 *
 * 舞台は最盛期のモヘンジョ・ダロ。焼きれんがの家並み、まっすぐな道路と下水道、高台の大浴場。
 * インダス文字は未解読で、王や人物の名は伝わっていない。中心人物は後世の研究者が
 * 「神官王」とよんだ石像の人物とし、「名の残らなかった人」として描く。
 */
export const INDUS_STAGE: StageDefinition = {
  id: 'indus',
  title: 'INDUS',
  place: 'MOHENJO-DARO',
  civilizationId: 'indus',
  eraLabel: 'c. 2300 BCE',
  visitYear: -2300,
  timelineLabel: 'BC 2300',
  artKey: 'mohenjodaro',
  crossword: {
    // 中学（高校受験）レベルの語から、1 枚の盤面に収まる組み合わせを総当たりで選定（スマートフォン向け 10×8, 交差 7）
    termIds: ['indus_civ', 'mohenjo', 'indus_script', 'brick', 'sewer', 'great_bath', 'seal', 'road'],
    seed: 2300,
    // 画面上部に MOHENJO-DARO と出ている。最初の 1 語は「今いる場所」から
    firstTermId: 'mohenjo',
  },
  backgroundHotspots: [{ termId: 'indus_river', label: 'INDUS', x: 0.12, y: 0.5 }],
  openingLine: {
    speaker: 'indus_merchant',
    text: 'この印を押せば、メソポタミアの商人にも話が通じる。\n……おまえは何を売りに来た？',
  },
  firstSolveLine: { speaker: 'indus_merchant', text: 'ほう、文字がわかるのか。' },
  midEvent: {
    id: 'priest_king_arrival',
    threshold: 0.5,
    character: 'priest_king',
    titleCard: { title: 'PRIEST-KING', subtitle: 'A NAME NO ONE REMEMBERS' },
    reactionLine: { speaker: 'indus_merchant', text: '……高台の方だ。頭を下げろ。' },
    line: { speaker: 'priest_king', text: 'わたしの名は残らない。\nだが、この町のかたちは残る。' },
    // 名前の伝わらない人物。登場と同時に、その像の記録を ARCHIVE に残す
    unlockTermId: 'priest_king',
  },
  completion: {
    line: { speaker: 'priest_king', text: '同じ町が、北の川沿いにもある。\nれんがの大きさまで、同じだ。' },
    unlockTermId: 'harappa',
    farewell: 'あなたは、この時代を離れます。',
  },
};
