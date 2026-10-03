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
    // 中学（高校受験）レベルの語から、1 枚の盤面に収まる組み合わせを総当たりで選定（10×10, 交差 7）。
    // 青銅器はこの時代のエジプトではまだ普及しておらず（主に銅器）、奴隷による建設説は現在否定されているため候補から外した。
    termIds: ['egypt', 'nile', 'pyramid', 'hieroglyph', 'solar_calendar', 'papyrus', 'decimal', 'farming'],
    seed: 2570,
    // 「ナイルのたまもの」から入る
    firstTermId: 'egypt',
  },
  backgroundHotspots: [{ termId: 'ra', label: 'RA', x: 0.8, y: 0.16 }],
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
    // クフ王はクロスワードに入らないため、登場と同時に ARCHIVE に記録する
    unlockTermId: 'khufu',
  },
  completion: {
    line: { speaker: 'khufu', text: '王は死なぬ。\n体が残るかぎり、魂は帰ってくる。' },
    unlockTermId: 'mummy',
    farewell: 'あなたは、この時代を離れます。',
  },
  nextStage: { id: 'indus', title: 'INDUS', timelineLabel: 'BC 2500' },
};
