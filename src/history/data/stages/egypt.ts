import type { StageDefinition } from '@/history/stage/types';

/**
 * STAGE 02 EGYPT。
 *
 * 舞台はクフ王の治世末、建設中の大ピラミッドを望むギザ。
 * スフィンクスは次王カフラーの時代とされ、オシリス信仰の記録は第5王朝以降のため、
 * どちらもこの場面には置かない（関連語としてのみ登録し、後の時代で出会う）。
 */
export const EGYPT_STAGE: StageDefinition = {
  id: 'egypt',
  number: 2,
  title: 'EGYPT',
  place: 'GIZA',
  eraLabel: 'c. 2570 BCE',
  timelineYear: -2600,
  timelineLabel: 'BC 2600',
  artKey: 'giza',
  crossword: {
    // 候補 18 語から 8 語の組み合わせを総当たりし、1 枚の盤面に収まるものを選定（8×11, 交差 7）。
    // ナイル・ミイラ・パピルスを入れる組み合わせではクフ（王の名）が入らないため、
    // 人物を優先し、ナイル川とパピルスは背景 DISCOVERY に回した。
    termIds: ['egypt', 'pharaoh', 'pyramid', 'hieroglyph', 'memphis', 'khufu', 'decimal', 'old_kingdom'],
    seed: 2570,
    // 「ナイルのたまもの」から入る
    firstTermId: 'egypt',
  },
  // メソポタミアの二つの川と同じく、ナイル川は背景から発見する
  backgroundHotspots: [
    { termId: 'nile', label: 'NILE', x: 0.12, y: 0.92 },
    { termId: 'papyrus', label: 'PAPYRUS', x: 0.06, y: 0.74 },
    { termId: 'ra', label: 'RA', x: 0.8, y: 0.16 },
  ],
  openingLine: {
    speaker: 'egyptian_scribe',
    text: '石を運ぶ者の数を記している。\n……おまえも数に入れておくか？',
  },
  firstSolveLine: {
    speaker: 'egyptian_scribe',
    text: '神の文字を知っているのか。',
  },
  midEvent: {
    id: 'khufu_arrival',
    threshold: 0.5,
    character: 'khufu',
    titleCard: { title: 'KHUFU', subtitle: 'KING OF UPPER AND LOWER EGYPT' },
    reactionLine: { speaker: 'egyptian_scribe', text: '……王の御前だ。ひざまずけ。' },
    line: { speaker: 'khufu', text: '石は千年を越える。\nおまえの言葉はどうだ？' },
  },
  completion: {
    line: { speaker: 'khufu', text: 'シリウスが昇れば、川があふれる。\n天が一年を教えてくれる。' },
    unlockTermId: 'solar_calendar',
    farewell: 'あなたは、この時代を離れます。',
  },
  nextStage: {
    id: 'greece',
    title: 'GREECE',
    timelineLabel: 'BC 800',
  },
};
