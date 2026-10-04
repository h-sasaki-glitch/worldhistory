import type { Civilization, UpcomingStage } from '@/history/stage/chronology';

/**
 * 文明の一覧。ステージは civilizationId でここを参照する。
 * startYear は中学・高校の教科書で示される目安（「〜ごろ」）。
 */
export const CIVILIZATIONS: Record<string, Civilization> = {
  mesopotamia: {
    id: 'mesopotamia',
    name: 'MESOPOTAMIA',
    nameJa: 'メソポタミア文明',
    startYear: -3500,
    startBasis: 'シュメール人の都市が生まれたころ',
  },
  egypt: {
    id: 'egypt',
    name: 'EGYPT',
    nameJa: 'エジプト文明',
    startYear: -3000,
    startBasis: 'ナイル川流域が一つの王国にまとまったころ',
  },
  indus: {
    id: 'indus',
    name: 'INDUS',
    nameJa: 'インダス文明',
    startYear: -2600,
    startBasis: 'モヘンジョ・ダロなどの都市が栄えはじめたころ',
  },
  china: {
    id: 'china',
    name: 'CHINA',
    nameJa: '中国文明',
    startYear: -1600,
    startBasis: '確認できる最も古い王朝、殷がおこったころ',
  },
  greece: {
    id: 'greece',
    name: 'GREECE',
    nameJa: 'ギリシア文明',
    startYear: -800,
    startBasis: 'ポリス（都市国家）が生まれたころ',
  },
  rome: {
    id: 'rome',
    name: 'ROME',
    nameJa: 'ローマ文明',
    startYear: -753,
    startBasis: '伝説上のローマ建国の年',
  },
};

/** 予告だけの目的地（遊べるステージの後ろに COMING NEXT として出す） */
export const UPCOMING_STAGES: UpcomingStage[] = [
  { id: 'arabia', title: 'ARABIA', visitYear: 610, timelineLabel: 'AD 610' },
];
