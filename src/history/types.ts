/**
 * 歴史用語の共通データモデル。
 * ステージ・ジャンル（世界史／日本史／科学史…）をまたいで共有する。
 */

export type TermCategory =
  | 'PERSON'
  | 'PLACE'
  | 'STATE'
  | 'EVENT'
  | 'IDEA'
  | 'RELIGION'
  | 'TECHNOLOGY'
  | 'CULTURE'
  | 'WRITING';

export type ExamRank = 'S' | 'A' | 'B';

/**
 * 時代をまたいで同一概念を接続するための ID（TIME LINK 用）。
 * 例: CITY_STATE は メソポタミアの都市国家 → ギリシアのポリス → ルネサンス期イタリアの都市国家 を束ねる。
 */
export type ConceptId = string;

export type HistoryTerm = {
  id: string;
  /** 正式表示（漢字可）。クロスワードには使わない。 */
  display: string;
  /** ひらがな／カタカナの読み */
  reading: string;
  /** クロスワード内部の解答（カタカナのみ） */
  crosswordAnswer: string;
  /** DISCOVERED 演出の英語見出し（例: CUNEIFORM） */
  nameEn: string;

  category: TermCategory;

  /** 西暦。紀元前は負数。 */
  periodFrom?: number;
  periodTo?: number;
  /** 表示用の時代ラベル（例: c. 18th century BCE） */
  eraLabel?: string;

  region: string;

  examRank: ExamRank;

  clues: {
    easy: string;
    normal: string;
    hard?: string;
  };

  /** DISCOVER LEVEL 2 で出す追加情報（一文） */
  discoverNote: string;

  /** 50〜80字程度の要約 */
  summary: string;

  relatedTermIds: string[];

  /** 時代横断の概念 ID（TIME LINK 用。任意） */
  conceptId?: ConceptId;

  /** 日本語版 Wikipedia の記事タイトル。URL はアプリ側で生成する。 */
  wikipediaTitle?: string;
};

export type DiscoveryResult =
  | 'SOLVED'
  | 'DISCOVER_1'
  | 'DISCOVER_2'
  | 'DISCOVER_3'
  | 'ANSWERED';

export type DiscoverLevel = 0 | 1 | 2 | 3;
