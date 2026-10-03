import type { ComponentType } from 'react';

import type { StageCharacterId } from '@/history/stage/types';

import { BabylonBackdrop } from './BabylonBackdrop';
import { HammurabiFigure, ScribeFigure } from './Characters';
import { EgyptianScribeFigure, KhufuFigure } from './EgyptCharacters';
import { AthensBackdrop } from './AthensBackdrop';
import {
  HadrianFigure,
  PericlesFigure,
  QinOfficialFigure,
  RomanEngineerFigure,
  ShiHuangdiFigure,
  SocratesFigure,
} from './ClassicalCharacters';
import { GizaBackdrop } from './GizaBackdrop';
import { DivinerFigure, IndusMerchantFigure, PriestKingFigure, WuDingFigure } from './IndusChinaCharacters';
import { MohenjoDaroBackdrop } from './MohenjoDaroBackdrop';
import { RomeBackdrop } from './RomeBackdrop';
import { XianyangBackdrop } from './XianyangBackdrop';
import { YinxuBackdrop } from './YinxuBackdrop';

/**
 * アート素材とゲームロジックの境界。
 * ステージ定義は artKey / character id だけを持ち、実際の描画はここで解決する。
 * 画像に差し替える場合は、Image を返すコンポーネントをここに登録するだけでよい。
 */

/** viewBox: 表示領域に合わせた切り抜き（artSpace.cropFor）。省略時は全体 */
export type BackdropProps = { dim?: number; viewBox?: string };

export const BACKDROPS: Record<string, ComponentType<BackdropProps>> = {
  babylon: BabylonBackdrop,
  giza: GizaBackdrop,
  mohenjodaro: MohenjoDaroBackdrop,
  yinxu: YinxuBackdrop,
  athens: AthensBackdrop,
  xianyang: XianyangBackdrop,
  rome: RomeBackdrop,
};

export type CharacterArt = {
  Figure: ComponentType;
  nameEn: string;
  nameJa: string;
  /** 背景内の立ち位置（中心 x、0〜1） */
  x: number;
  /** HISTORY WORLD の高さに対する人物の高さ */
  heightRatio: number;
  /** 足元の高さ（下端からの比率）。奥に座る人物などは大きくする。既定 0.02 */
  baseline?: number;
};

export const CHARACTERS: Partial<Record<StageCharacterId, CharacterArt>> = {
  scribe: { Figure: ScribeFigure, nameEn: 'SCRIBE', nameJa: '書記官', x: 0.3, heightRatio: 0.6 },
  hammurabi: { Figure: HammurabiFigure, nameEn: 'HAMMURABI', nameJa: 'ハンムラビ王', x: 0.62, heightRatio: 0.72 },
  egyptian_scribe: {
    Figure: EgyptianScribeFigure,
    nameEn: 'SCRIBE',
    nameJa: '書記',
    x: 0.36,
    heightRatio: 0.62,
    // あぐらで座るため、字幕に隠れないよう少し奥（上）に置く
    baseline: 0.2,
  },
  khufu: { Figure: KhufuFigure, nameEn: 'KHUFU', nameJa: 'クフ王', x: 0.68, heightRatio: 0.72 },
  indus_merchant: { Figure: IndusMerchantFigure, nameEn: 'MERCHANT', nameJa: '商人', x: 0.3, heightRatio: 0.6 },
  priest_king: { Figure: PriestKingFigure, nameEn: 'PRIEST-KING', nameJa: '神官王', x: 0.66, heightRatio: 0.72 },
  diviner: { Figure: DivinerFigure, nameEn: 'DIVINER', nameJa: '占い師', x: 0.3, heightRatio: 0.6 },
  wu_ding: { Figure: WuDingFigure, nameEn: 'WU DING', nameJa: '武丁王', x: 0.62, heightRatio: 0.74 },
  socrates: { Figure: SocratesFigure, nameEn: 'SOCRATES', nameJa: 'ソクラテス', x: 0.24, heightRatio: 0.6 },
  pericles: { Figure: PericlesFigure, nameEn: 'PERICLES', nameJa: 'ペリクレス', x: 0.66, heightRatio: 0.72 },
  qin_official: { Figure: QinOfficialFigure, nameEn: 'OFFICIAL', nameJa: '役人', x: 0.24, heightRatio: 0.6 },
  shi_huangdi: { Figure: ShiHuangdiFigure, nameEn: 'SHI HUANGDI', nameJa: '始皇帝', x: 0.72, heightRatio: 0.74 },
  roman_engineer: { Figure: RomanEngineerFigure, nameEn: 'ENGINEER', nameJa: '水道技師', x: 0.42, heightRatio: 0.6 },
  hadrian: { Figure: HadrianFigure, nameEn: 'HADRIAN', nameJa: 'ハドリアヌス帝', x: 0.7, heightRatio: 0.72 },
};
