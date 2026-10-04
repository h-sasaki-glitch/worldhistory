import type { HistoricalRelation } from '@/history/archive/relations';

/**
 * 用語どうしの関係（HistoricalRelation）。
 *
 * 方針:
 * - 教科書レベルで確かなものだけを置く。不確かな「直接の影響」は置かない。
 * - 分類が同じだけのもの（例: 太陽神シャマシュとラー）は conceptId に任せ、ここには書かない。
 * - 似ているが直接の影響はないものは COMPARE とし、note でそのことを明記する。
 * - 向きのある関係（INFLUENCE / CAUSE / EVOLUTION）は from → to の向きで書く。
 */
export const RELATIONS: HistoricalRelation[] = [
  // ── 時代をまたぐ関係（ACROSS TIME に出る） ──
  {
    from: 'lunar_calendar',
    to: 'solar_calendar',
    type: 'CONTRAST',
    note: '太陰暦は月の満ち欠け、太陽暦は太陽の動き（1年＝約365日）を基準にする。',
  },
  {
    from: 'cuneiform',
    to: 'hieroglyph',
    type: 'COMPARE',
    note: 'どちらも最も古い文字の一つ。くさび形文字は粘土板に刻み、象形文字は石やパピルスに書いた。',
  },
  {
    from: 'clay_tablet',
    to: 'papyrus',
    type: 'COMPARE',
    note: '文字を書く材料。メソポタミアは粘土、エジプトはナイル川の草からつくった紙を使った。',
  },
  {
    from: 'sexagesimal',
    to: 'decimal',
    type: 'CONTRAST',
    note: '60進法は60、十進法は10でくり上がる。時計の60分・60秒は60進法のなごり。',
  },
  {
    from: 'ziggurat',
    to: 'pyramid',
    type: 'COMPARE',
    note: 'どちらも巨大な建造物だが、ジッグラトは神をまつる神殿の土台、ピラミッドは王の墓。',
  },
  {
    from: 'hammurabi_code',
    to: 'roman_law',
    type: 'COMPARE',
    note: 'どちらも文字で記された法。ただし、ハンムラビ法典がローマ法に直接影響したわけではない。',
  },
  {
    from: 'indus_civ',
    to: 'mesopotamia',
    type: 'CONTEMPORARY',
    note: '同じころに栄え、交易をしていた。メソポタミアの遺跡からインダスの印章が見つかっている。',
  },
  {
    from: 'sewer',
    to: 'aqueduct',
    type: 'COMPARE',
    note: '都市の水の設備。インダスは汚れた水を流す下水道、ローマは遠くからきれいな水を運ぶ水道が名高い。',
  },
  {
    from: 'road',
    to: 'roman_road',
    type: 'COMPARE',
    note: 'モヘンジョ・ダロは町の中を碁盤の目の道路で区切り、ローマは帝国の各地を街道で結んだ。',
  },
  {
    from: 'democracy',
    to: 'republic',
    type: 'COMPARE',
    note: 'アテネの民主政は市民が民会で直接決め、ローマの共和政は選ばれた役人と元老院が国を動かした。',
  },
  {
    from: 'parthenon',
    to: 'pantheon',
    type: 'COMPARE',
    note: 'どちらも神々をまつる神殿。パルテノン神殿は大理石の柱が並び、パンテオンは大きな円屋根をもつ。',
  },
  {
    from: 'emperor',
    to: 'empire',
    type: 'COMPARE',
    note: '東では始皇帝が前221年に皇帝を名のり、西ではローマが前27年に帝政を始めた。それぞれ別に生まれたしくみ。',
  },
  {
    from: 'qin',
    to: 'republic',
    type: 'CONTEMPORARY',
    note: '秦が中国を統一した前221年ごろ、ローマはまだ共和政で、カルタゴと戦っていた。',
  },

  // ── 同じ時代の中の関係（CONNECTED に種類として出る） ──
  {
    from: 'oracle',
    to: 'kanji',
    type: 'EVOLUTION',
    note: '甲骨文字は、形を変えながら今の漢字へと発展した。',
  },
  {
    from: 'nile',
    to: 'farming',
    type: 'CAUSE',
    note: 'ナイル川が毎年あふれて肥えた土を運び、豊かな農耕を支えた。',
  },
  {
    from: 'nile',
    to: 'solar_calendar',
    type: 'CAUSE',
    note: '川があふれる時期を知るために、太陽の動きをもとにした暦がつくられた。',
  },
  {
    from: 'legalism',
    to: 'qin',
    type: 'INFLUENCE',
    note: '秦は法家の考えを取り入れて改革を進め、強い国になった。',
  },
  {
    from: 'legalism',
    to: 'shihuang',
    type: 'INFLUENCE',
    note: '始皇帝は法家の李斯を重く用い、法による統治で国をまとめた。',
  },
  {
    from: 'legalism',
    to: 'confucian',
    type: 'CONTRAST',
    note: '法家は法と刑罰で、儒教は思いやりと礼儀で国を治めようとした。',
  },
];
