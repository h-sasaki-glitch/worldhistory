import type { StageDefinition } from '@/history/stage/types';

export const MESOPOTAMIA_STAGE: StageDefinition = {
  id: 'mesopotamia',
  title: 'MESOPOTAMIA',
  place: 'BABYLON',
  civilizationId: 'mesopotamia',
  eraLabel: 'c. 1750 BCE',
  visitYear: -1750,
  timelineLabel: 'BC 1750',
  artKey: 'babylon',
  crossword: {
    // 中学（高校受験）レベルの語から、1 枚の盤面に収まる組み合わせを総当たりで選定（スマートフォン向け 12×8, 交差 7）
    termIds: [
      'mesopotamia',
      'sumer',
      'cuneiform',
      'lunar_calendar',
      'sexagesimal',
      'babylon',
      'hammurabi',
      'clay_tablet',
    ],
    seed: 1750,
    // 画面上部に BABYLON と出ている。最初の 1 語は「今いる場所」から始める
    firstTermId: 'babylon',
  },
  backgroundHotspots: [
    { termId: 'euphrates', label: 'EUPHRATES', x: 0.11, y: 0.8 },
    { termId: 'tigris', label: 'TIGRIS', x: 0.88, y: 0.65 },
    { termId: 'ziggurat', label: 'ZIGGURAT', x: 0.45, y: 0.6 },
  ],
  openingLine: {
    speaker: 'scribe',
    text: '見慣れない服だな。\nまあいい。文字は読めるか？',
  },
  firstSolveLine: {
    speaker: 'scribe',
    text: 'ほう……読めるのか。',
  },
  midEvent: {
    id: 'hammurabi_arrival',
    threshold: 0.5,
    character: 'hammurabi',
    titleCard: { title: 'HAMMURABI', subtitle: 'KING OF BABYLON' },
    reactionLine: { speaker: 'scribe', text: '……！ 王だ。頭を下げろ。' },
    line: { speaker: 'hammurabi', text: 'その文字をどこで覚えた？' },
  },
  completion: {
    line: { speaker: 'hammurabi', text: '言葉は消える。\n記されたものは残る。' },
    unlockTermId: 'hammurabi_code',
    farewell: 'あなたは、この時代を離れます。',
  },
};
