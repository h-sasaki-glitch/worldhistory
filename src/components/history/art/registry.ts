import type { ComponentType } from 'react';

import type { StageCharacterId } from '@/history/stage/types';

import { BabylonBackdrop } from './BabylonBackdrop';
import { HammurabiFigure, ScribeFigure } from './Characters';
import { EgyptianScribeFigure, KhufuFigure } from './EgyptCharacters';
import { GizaBackdrop } from './GizaBackdrop';

/**
 * アート素材とゲームロジックの境界。
 * ステージ定義は artKey / character id だけを持ち、実際の描画はここで解決する。
 * 画像に差し替える場合は、Image を返すコンポーネントをここに登録するだけでよい。
 */

export type BackdropProps = { dim?: number };

export const BACKDROPS: Record<string, ComponentType<BackdropProps>> = {
  babylon: BabylonBackdrop,
  giza: GizaBackdrop,
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
};
