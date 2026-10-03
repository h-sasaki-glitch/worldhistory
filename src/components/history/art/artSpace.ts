/**
 * 背景アートの座標系。背景は 400×340 の viewBox で描き、HISTORY WORLD の大きさに合わせて切り抜いて表示する。
 * タップポイントなどはこの座標系の比率（0〜1）で指定し、切り抜きに合わせて画面座標へ変換して重ねる。
 * 画像に差し替える場合も、同じ縦横比（400:340）で描けば座標がそのまま使える。
 */
export const ART_VIEWBOX = { width: 400, height: 340 } as const;

export type ArtCrop = { x: number; y: number; w: number; h: number };

/** 切り抜きの端からタップポイントまでの余白（アート座標） */
const FOCUS_MARGIN = 18;

/**
 * 表示領域（screenW×screenH）に合わせた切り抜き範囲を決める。
 * 画面いっぱいに敷き詰めたうえで、focusY（タップポイントの高さ, 0〜1）がすべて見える位置に寄せる。
 * スマホで HISTORY WORLD が低くなっても、背景の DISCOVERY を押せるようにするため。
 */
export function cropFor(
  screenW: number,
  screenH: number,
  focusY: readonly number[] = [],
  /** 上端で見出しなどに隠れる高さ（画面 px）。タップポイントをこれより下に置く */
  topInsetPx = 0,
): ArtCrop {
  const { width: W, height: H } = ART_VIEWBOX;
  if (screenW <= 0 || screenH <= 0) return { x: 0, y: 0, w: W, h: H };

  if (screenW / screenH < W / H) {
    // 表示が縦長: 左右を切る（中央寄せ）
    const w = (H * screenW) / screenH;
    return { x: (W - w) / 2, y: 0, w, h: H };
  }

  // 表示が横長: 上下を切る
  const h = (W * screenH) / screenW;
  let y = (H - h) / 2;
  if (focusY.length > 0) {
    const lo = Math.min(...focusY) * H - FOCUS_MARGIN - (topInsetPx * W) / screenW;
    const hi = Math.max(...focusY) * H + FOCUS_MARGIN;
    if (hi - lo <= h) {
      if (lo < y) y = lo;
      if (hi > y + h) y = hi - h;
    } else {
      y = (lo + hi) / 2 - h / 2;
    }
  }
  y = Math.max(0, Math.min(H - h, y));
  return { x: 0, y, w: W, h };
}

export function cropViewBox(c: ArtCrop): string {
  return `${c.x} ${c.y} ${c.w} ${c.h}`;
}

/** アート座標の比率（0〜1）を、切り抜きを考慮した画面座標に変換する */
export function artToScreen(
  rx: number,
  ry: number,
  screenW: number,
  screenH: number,
  crop: ArtCrop = cropFor(screenW, screenH),
): { x: number; y: number } {
  const { width: W, height: H } = ART_VIEWBOX;
  return {
    x: ((rx * W - crop.x) * screenW) / crop.w,
    y: ((ry * H - crop.y) * screenH) / crop.h,
  };
}
