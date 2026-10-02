import type { ComponentType } from 'react';

import type { StageCharacterId } from '@/history/stage/types';

import { BabylonBackdrop } from './BabylonBackdrop';
import { HammurabiFigure, ScribeFigure } from './Characters';

/**
 * アート素材とゲームロジックの境界。
 * ステージ定義は artKey / character id だけを持ち、実際の描画はここで解決する。
 * 画像に差し替える場合は、Image を返すコンポーネントをここに登録するだけでよい。
 */

export type BackdropProps = { dim?: number };

export const BACKDROPS: Record<string, ComponentType<BackdropProps>> = {
  babylon: BabylonBackdrop,
};

export type CharacterArt = {
  Figure: ComponentType;
  nameEn: string;
  nameJa: string;
  /** 背景内の立ち位置（中心 x、0〜1） */
  x: number;
  /** HISTORY WORLD の高さに対する人物の高さ */
  heightRatio: number;
};

export const CHARACTERS: Record<StageCharacterId, CharacterArt> = {
  scribe: { Figure: ScribeFigure, nameEn: 'SCRIBE', nameJa: '書記官', x: 0.3, heightRatio: 0.6 },
  hammurabi: { Figure: HammurabiFigure, nameEn: 'HAMMURABI', nameJa: 'ハンムラビ王', x: 0.62, heightRatio: 0.72 },
};
