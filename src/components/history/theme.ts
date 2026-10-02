import { Platform } from 'react-native';

/** EPOCH の配色: 夜の青・日干しれんがの土色・粘土・ラピスラズリ・金 */
export const C = {
  night: '#0d0b10',
  ink: '#16120f',
  panel: '#1b1612',
  panelEdge: '#3a2f25',
  clay: '#d8c39a',
  clayDark: '#b89c6c',
  clayInk: '#2a1d12',
  sand: '#e9dcc0',
  text: '#e9dcc0',
  textDim: '#a8977b',
  textFaint: '#6f6252',
  gold: '#d6ae62',
  goldSoft: 'rgba(214,174,98,0.35)',
  lapis: '#3c5aa6',
  lapisSoft: 'rgba(60,90,166,0.35)',
  cellEmpty: '#2a221c',
  cellEdge: '#4d3f31',
  cellSelected: '#4b3b23',
  cellActive: '#6a5130',
  danger: '#c27a5a',
} as const;

const serifLatin = Platform.select({
  ios: 'Georgia',
  android: 'serif',
  default: '"Cormorant Garamond", "EB Garamond", Georgia, "Times New Roman", serif',
});

const serifJa = Platform.select({
  ios: 'Hiragino Mincho ProN',
  android: 'serif',
  default: '"Noto Serif JP", "Hiragino Mincho ProN", "Yu Mincho", "YuMincho", serif',
});

export const F = {
  latin: serifLatin,
  ja: serifJa,
  mono: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'ui-monospace, Menlo, monospace' }),
} as const;

/** 英字見出しの共通スタイル（博物館のキャプション風） */
export const caps = {
  fontFamily: serifLatin,
  letterSpacing: 3,
  color: C.gold,
} as const;

/** 画面の最大幅（Web でも縦長スマホ比率で表示する） */
export const MAX_APP_WIDTH = 480;
