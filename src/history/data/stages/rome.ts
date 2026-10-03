import type { StageDefinition } from '@/history/stage/types';

/**
 * STAGE 07 ROME。
 *
 * 舞台はハドリアヌス帝の時代のローマ（c. AD 120,「ローマの平和」の時代）。
 * コロッセオ（80年完成）、水道橋、建て直し中のパンテオン、トラヤヌス帝の浴場（109年）。
 */
export const ROME_STAGE: StageDefinition = {
  id: 'rome',
  number: 7,
  title: 'ROME',
  place: 'ROME',
  eraLabel: 'c. AD 120',
  timelineYear: -27,
  timelineLabel: 'BC 27',
  artKey: 'rome',
  crossword: {
    // 中学（高校受験）レベルの語から、1 枚の盤面に収まる組み合わせを総当たりで選定（9×7, 交差 7）
    termIds: ['rome', 'republic', 'colosseum', 'aqueduct', 'roman_law', 'pantheon', 'empire', 'roman_road'],
    seed: 120,
    firstTermId: 'rome',
  },
  backgroundHotspots: [{ termId: 'bath', label: 'BATHS', x: 0.2, y: 0.56 }],
  openingLine: {
    speaker: 'roman_engineer',
    text: 'この水は、山から何日もかけて流れてくる。\n……旅の人、のどは渇いていないか？',
  },
  firstSolveLine: { speaker: 'roman_engineer', text: 'ラテン語も読めるのか。たいしたものだ。' },
  midEvent: {
    id: 'hadrian_arrival',
    threshold: 0.5,
    character: 'hadrian',
    titleCard: { title: 'HADRIAN', subtitle: 'EMPEROR OF ROME' },
    reactionLine: { speaker: 'roman_engineer', text: '皇帝陛下が、視察においでだ。' },
    line: { speaker: 'hadrian', text: '帝国は広い。\nわたしは自分の足で、その端まで歩いた。' },
    unlockTermId: 'hadrian',
  },
  completion: {
    line: { speaker: 'hadrian', text: '東の属州から、\n新しい神の教えが広まっているそうだ。' },
    unlockTermId: 'christianity',
    farewell: 'あなたは、この時代を離れます。',
  },
  nextStage: { id: 'arabia', title: 'ARABIA', timelineLabel: 'AD 610' },
};
