import type { DiscoverLevel, DiscoveryResult } from '@/history/types';

/** 背景に置く DISCOVERY のタップポイント（座標は HISTORY WORLD 領域に対する 0〜1 の比率） */
export type BackgroundHotspot = {
  termId: string;
  label: string;
  x: number;
  y: number;
};

/** 人物 ID。描画は components/history/art/registry.ts の CHARACTERS で解決する */
export type StageCharacterId = string;

export type StageLine = {
  speaker: StageCharacterId;
  text: string;
};

export type StageDefinition = {
  id: string;
  title: string;
  place: string;
  /** どの文明を訪れるか（data/civilizations.ts）。文明の起点年はそちらに持つ */
  civilizationId: string;
  /**
   * プレイヤーが訪れる年（紀元前は負数）。ステージの並び・番号・次の時代はこの値で決まる。
   * 文明の起点年（civilizationStartYear）とは別物。
   */
  visitYear: number;
  /** 舞台の年代表示（例: c. 1750 BCE） */
  eraLabel: string;
  /** タイムライン上の表示（visitYear と一致させる。例: BC 1750） */
  timelineLabel: string;
  /** 背景アートのキー（art/registry で差し替え可能） */
  artKey: string;
  crossword: {
    termIds: string[];
    seed: number;
    /** 最初に選択しておく語（ルールを掴みやすい語を指定） */
    firstTermId?: string;
    /**
     * 盤面の分け方（任意）。スマートフォンでマスが小さくなりすぎる時代だけ指定する。
     * 各グループが 1 枚の盤面（BOARD A, B, …）になり、label がタブに出る。
     * termIds はすべてのグループの語を合わせたものと一致させる（data.test.ts で検証）。
     */
    boards?: { label: string; termIds: string[] }[];
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
    /** 人物の登場と同時に ARCHIVE に登録する語（クロスワードに入らない人物など） */
    unlockTermId?: string;
  };
  completion: {
    line: StageLine;
    unlockTermId: string;
    farewell: string;
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
