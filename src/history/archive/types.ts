import type { DiscoveryResult, TermCategory } from '@/history/types';

export type DiscoverySource = 'CROSSWORD' | 'BACKGROUND' | 'EVENT';

export type ArchiveEntry = {
  termId: string;
  stageId: string;
  source: DiscoverySource;
  discoveredAt: number;
  /** クロスワード由来の場合の学習結果（将来の復習頻度の決定に使う） */
  result?: DiscoveryResult;
};

export type LinkRecord = {
  stageId: string;
  foundAt: number;
};

export type ArchiveState = {
  version: 1;
  entries: Record<string, ArchiveEntry>;
  /** 解放済み LINK。キーは 2 つの termId をソートして "|" で連結したもの */
  links: Record<string, LinkRecord>;
};

/** ARCHIVE 画面の分類 */
export type ArchiveSection =
  | 'PEOPLE'
  | 'PLACES'
  | 'STATES'
  | 'EVENTS'
  | 'IDEAS'
  | 'RELIGION'
  | 'TECHNOLOGY'
  | 'CULTURE'
  | 'WRITING';

export const SECTION_OF: Record<TermCategory, ArchiveSection> = {
  PERSON: 'PEOPLE',
  PLACE: 'PLACES',
  STATE: 'STATES',
  EVENT: 'EVENTS',
  IDEA: 'IDEAS',
  RELIGION: 'RELIGION',
  TECHNOLOGY: 'TECHNOLOGY',
  CULTURE: 'CULTURE',
  WRITING: 'WRITING',
};

export const ARCHIVE_SECTIONS: ArchiveSection[] = [
  'PEOPLE',
  'PLACES',
  'STATES',
  'EVENTS',
  'IDEAS',
  'RELIGION',
  'TECHNOLOGY',
  'CULTURE',
  'WRITING',
];
