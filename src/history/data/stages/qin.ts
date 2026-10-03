import type { StageDefinition } from '@/history/stage/types';

/**
 * STAGE 06 QIN。
 *
 * 舞台は始皇帝の晩年の秦の都・咸陽（c. 210 BCE）。
 * 秦は黒を尊んだため、役人や皇帝の衣は黒で描く。遠景には北の長城を望む。
 */
export const QIN_STAGE: StageDefinition = {
  id: 'qin',
  number: 6,
  title: 'QIN',
  place: 'XIANYANG',
  eraLabel: 'c. 210 BCE',
  timelineYear: -221,
  timelineLabel: 'BC 221',
  artKey: 'xianyang',
  crossword: {
    // 中学（高校受験）レベルの語から、1 枚の盤面に収まる組み合わせを総当たりで選定（7×10, 交差 7）
    termIds: ['qin', 'shihuang', 'wall', 'coin', 'measure', 'confucian', 'emperor', 'law'],
    seed: 210,
    firstTermId: 'qin',
  },
  backgroundHotspots: [{ termId: 'xianyang', label: 'XIANYANG', x: 0.5, y: 0.5 }],
  openingLine: {
    speaker: 'qin_official',
    text: 'このますで量れ。国じゅう、どこでも同じ量だ。\n……おまえの国では違うのか？',
  },
  firstSolveLine: { speaker: 'qin_official', text: '文字も、もう国じゅうで同じ形だ。読めて当然か。' },
  midEvent: {
    id: 'shi_huangdi_arrival',
    threshold: 0.5,
    character: 'shi_huangdi',
    titleCard: { title: 'SHI HUANGDI', subtitle: 'THE FIRST EMPEROR' },
    reactionLine: { speaker: 'qin_official', text: '……陛下だ。顔を上げるな。' },
    line: { speaker: 'shi_huangdi', text: '王では足りぬ。\nわたしは、最初の皇帝である。' },
  },
  completion: {
    line: { speaker: 'shi_huangdi', text: 'わたしが死んでも、\n土の兵がわたしを守りつづける。' },
    unlockTermId: 'terracotta',
    farewell: 'あなたは、この時代を離れます。',
  },
  nextStage: { id: 'rome', title: 'ROME', timelineLabel: 'BC 27' },
};
