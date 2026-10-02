/**
 * 背景アートの座標系。背景は viewBox を「xMidYMid slice」で画面に敷き詰めるため、
 * タップポイントなどはこの座標系の比率（0〜1）で指定し、画面座標へ変換して重ねる。
 * 画像に差し替える場合も、同じ縦横比（400:340）で描けば座標がそのまま使える。
 */
export const ART_VIEWBOX = { width: 400, height: 340 } as const;

export function artToScreen(
  rx: number,
  ry: number,
  screenW: number,
  screenH: number,
): { x: number; y: number } {
  const { width: W, height: H } = ART_VIEWBOX;
  const scale = Math.max(screenW / W, screenH / H);
  const offX = (screenW - W * scale) / 2;
  const offY = (screenH - H * scale) / 2;
  return { x: offX + rx * W * scale, y: offY + ry * H * scale };
}
