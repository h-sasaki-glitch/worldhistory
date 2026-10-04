import type { StageDefinition } from '@/history/stage/types';

/**
 * STAGE GREECE。
 *
 * 舞台はペリクレスの時代のアテネ（c. 440 BCE）。アクロポリスの丘では
 * パルテノン神殿の建設が進んでいる（完成は紀元前432年ごろ）。
 * 案内役は若いころのソクラテス。
 */
export const GREECE_STAGE: StageDefinition = {
  id: 'greece',
  title: 'GREECE',
  place: 'ATHENS',
  civilizationId: 'greece',
  eraLabel: 'c. 440 BCE',
  visitYear: -440,
  timelineLabel: 'BC 440',
  artKey: 'athens',
  crossword: {
    // 中学（高校受験）レベルの語から、1 枚の盤面に収まる組み合わせを総当たりで選定（スマートフォン向け 10×7, 交差 7）
    termIds: ['polis', 'athens', 'democracy', 'parthenon', 'sparta', 'philosophy', 'socrates', 'citizen'],
    seed: 440,
    firstTermId: 'athens',
  },
  backgroundHotspots: [{ termId: 'aegean', label: 'AEGEAN', x: 0.86, y: 0.6 }],
  openingLine: {
    speaker: 'socrates',
    text: 'きみは、自分が何を知らないか\n知っているかね？',
  },
  firstSolveLine: { speaker: 'socrates', text: 'ほう。では、その言葉の意味も説明できるかね？' },
  midEvent: {
    id: 'pericles_arrival',
    threshold: 0.5,
    character: 'pericles',
    titleCard: { title: 'PERICLES', subtitle: 'STRATEGOS OF ATHENS' },
    reactionLine: { speaker: 'socrates', text: 'ペリクレスだ。民会から戻ってきたらしい。' },
    line: { speaker: 'pericles', text: 'この国では、市民一人ひとりが政治を担う。\nきみも、この国の市民か？' },
    unlockTermId: 'pericles',
  },
  completion: {
    line: { speaker: 'pericles', text: '四年に一度、ポリスは争いをやめて\nオリンピアに集まる。' },
    unlockTermId: 'olympics',
    farewell: 'あなたは、この時代を離れます。',
  },
};
