import type { StageDefinition } from '@/history/stage/types';

/**
 * STAGE CHINA。
 *
 * 舞台は殷の後期の都（のちの殷墟, 現在の河南省安陽市）、武丁王の時代。
 * 版築（土をつき固めた基壇）の上の宮殿、青銅器、甲骨を焼く占いの火。
 * クリア時に「漢字」を解放し、日本の中学生が今使っている文字へとつなげる。
 */
export const CHINA_STAGE: StageDefinition = {
  id: 'china',
  title: 'CHINA',
  place: 'YIN',
  civilizationId: 'china',
  eraLabel: 'c. 1200 BCE',
  visitYear: -1200,
  timelineLabel: 'BC 1200',
  artKey: 'yinxu',
  crossword: {
    // 中学（高校受験）レベルの語から、1 枚の盤面に収まる組み合わせを総当たりで選定（スマートフォン向け 10×7, 交差 7）
    termIds: ['yin', 'oracle', 'bronze', 'yellow_river', 'yangtze', 'divination', 'rice', 'yinxu'],
    seed: 1200,
    firstTermId: 'yin',
  },
  backgroundHotspots: [{ termId: 'millet', label: 'MILLET', x: 0.86, y: 0.84 }],
  openingLine: {
    speaker: 'diviner',
    text: '亀の甲羅に、ひびが走った。\n……おまえのことも占ってやろうか？',
  },
  firstSolveLine: { speaker: 'diviner', text: '王と我ら占い師のほかに、字の読める者がいるとは。' },
  midEvent: {
    id: 'wu_ding_arrival',
    threshold: 0.5,
    character: 'wu_ding',
    titleCard: { title: 'WU DING', subtitle: 'KING OF SHANG' },
    reactionLine: { speaker: 'diviner', text: '……王がお見えだ。ひざまずけ。' },
    line: { speaker: 'wu_ding', text: '明日は雨か。骨に問え。\n答えは、刻んで残せ。' },
    unlockTermId: 'wu_ding',
  },
  completion: {
    line: { speaker: 'wu_ding', text: '刻んだ字は、王が死んでも残る。\n三千年の先までも。' },
    unlockTermId: 'kanji',
    farewell: 'あなたは、この時代を離れます。',
  },
};
