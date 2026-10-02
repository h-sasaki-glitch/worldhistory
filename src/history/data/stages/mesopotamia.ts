import type { StageDefinition } from '@/history/stage/types';

export const MESOPOTAMIA_STAGE: StageDefinition = {
  id: 'mesopotamia',
  number: 1,
  title: 'MESOPOTAMIA',
  place: 'BABYLON',
  eraLabel: 'c. 1750 BCE',
  timelineYear: -3500,
  timelineLabel: 'BC 3500',
  artKey: 'babylon',
  crossword: {
    termIds: [
      'mesopotamia',
      'sumer',
      'cuneiform',
      'city_state',
      'ziggurat',
      'babylon',
      'hammurabi',
      'akkad',
    ],
    seed: 1750,
    // 画面上部に BABYLON と出ている。最初の 1 語は「今いる場所」から始める
    firstTermId: 'babylon',
  },
  backgroundHotspots: [
    { termId: 'euphrates', label: 'EUPHRATES', x: 0.11, y: 0.86 },
    { termId: 'tigris', label: 'TIGRIS', x: 0.88, y: 0.65 },
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
  nextStage: {
    id: 'egypt',
    title: 'EGYPT',
    timelineLabel: 'BC 2600',
  },
};
