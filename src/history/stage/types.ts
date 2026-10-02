import type { DiscoverLevel, DiscoveryResult } from '@/history/types';

/** 背景に置く DISCOVERY のタップポイント（座標は HISTORY WORLD 領域に対する 0〜1 の比率） */
export type BackgroundHotspot = {
  termId: string;
  label: string;
  x: number;
  y: number;
};

export type StageCharacterId = 'scribe' | 'hammurabi';

export type StageLine = {
  speaker: StageCharacterId;
  text: string;
};

export type StageDefinition = {
  id: string;
  number: number;
  title: string;
  place: string;
  eraLabel: string;
  /** タイムライン上の位置（紀元前は負数） */
  timelineYear: number;
  timelineLabel: string;
  /** 背景アートのキー（art/registry で差し替え可能） */
  artKey: string;
  crossword: {
    termIds: string[];
    seed: number;
    /** 最初に選択しておく語（ルールを掴みやすい語を指定） */
    firstTermId?: string;
  };
  backgroundHotspots: BackgroundHotspot[];
  openingLine: StageLine;
  firstSolveLine?: StageLine;
  midEvent: {
    id: string;
    threshold: number;
    character: StageCharacterId;
    titleCard: { title: string; subtitle: string };
    reactionLine: StageLine;
    line: StageLine;
  };
  completion: {
    line: StageLine;
    unlockTermId: string;
    farewell: string;
  };
  nextStage?: {
    id: string;
    title: string;
    timelineLabel: string;
  };
};

export type TermProgress = {
  /** DISCOVER を何段階まで開いたか */
  discoverLevel: DiscoverLevel;
  /** 確定した学習結果（未解答は null） */
  result: DiscoveryResult | null;
  /** 不正解の入力回数（将来の復習用） */
  attempts: number;
  resolvedAt?: number;
};

export type StageProgress = {
  version: 1;
  stageId: string;
  /** 盤面の署名。生成ロジックが変わったら保存済みセル状態を破棄するために使う */
  boardSignature: string;
  terms: Record<string, TermProgress>;
  /** 解けたセルの文字。キーは "boardIndex:row:col" */
  cells: Record<string, string>;
  firedEvents: string[];
  backgroundDiscoveries: string[];
  completed: boolean;
  completedAt?: number;
};
