import { memo } from 'react';
import Svg, { Circle, Defs, Ellipse, G, LinearGradient, Path, Polygon, RadialGradient, Rect, Stop } from 'react-native-svg';

import { ART_VIEWBOX } from './artSpace';

/**
 * 仮背景: 殷の後期の都（のちの殷墟, c. 1200 BCE）。
 * - 版築（土をつき固めた層）の基壇の上に建つ、木の柱とかやぶき屋根の宮殿
 *   （瓦屋根は周の時代以降のため描かない）
 * - 都のそばを流れる洹河（えんが）、遠くの丘
 * - 手前に青銅の鼎（かなえ）と、甲骨の占いに使う火
 * - 右手前にあわの畑（背景 DISCOVERY）
 */

function Hall({ x, y, w, s = 1 }: { x: number; y: number; w: number; s?: number }) {
  const h = 22 * s;
  const posts = Math.max(3, Math.floor(w / 10));
  return (
    <G>
      {/* 版築の基壇 */}
      <Rect x={x - 6} y={y} width={w + 12} height={12 * s} fill="#c9a66e" />
      {[3, 6, 9].map((d) => (
        <Path key={d} d={`M${x - 6} ${y + d * s} H ${x + w + 6}`} stroke="#a8864f" strokeWidth={0.6} />
      ))}
      {/* 柱と壁 */}
      <Rect x={x} y={y - h} width={w} height={h} fill="#7a4f2c" />
      {Array.from({ length: posts }, (_, i) => (
        <Rect key={i} x={x + (i * (w - 3)) / (posts - 1)} y={y - h} width={3} height={h} fill="#4e3018" />
      ))}
      {/* かやぶきの寄棟屋根 */}
      <Polygon points={`${x - 10},${y - h} ${x + w + 10},${y - h} ${x + w - 6},${y - h - 16 * s} ${x + 6},${y - h - 16 * s}`} fill="#b59a5e" />
      <Path d={`M${x + 6} ${y - h - 16 * s} H ${x + w - 6}`} stroke="#8a7240" strokeWidth={2} />
      {Array.from({ length: 6 }, (_, i) => (
        <Path
          key={i}
          d={`M${x - 8 + i * ((w + 16) / 5)} ${y - h} L ${x + 6 + i * ((w - 12) / 5)} ${y - h - 16 * s}`}
          stroke="#9a804a"
          strokeWidth={0.6}
        />
      ))}
    </G>
  );
}

function YinxuBackdropImpl({ dim = 0, viewBox }: { dim?: number; viewBox?: string }) {
  const { width: W, height: H } = ART_VIEWBOX;
  return (
    <Svg width="100%" height="100%" viewBox={viewBox ?? `0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice">
      <Defs>
        <LinearGradient id="ySky" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#3f4a66" />
          <Stop offset="0.55" stopColor="#a39a84" />
          <Stop offset="1" stopColor="#e2d1a2" />
        </LinearGradient>
        <RadialGradient id="ySun" cx="0.5" cy="0.5" r="0.5">
          <Stop offset="0" stopColor="#ffe9bb" stopOpacity="0.8" />
          <Stop offset="1" stopColor="#ffe0a0" stopOpacity="0" />
        </RadialGradient>
        <LinearGradient id="yGround" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#c8ab72" />
          <Stop offset="1" stopColor="#8f7044" />
        </LinearGradient>
        <LinearGradient id="yBronze" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#6f8f78" />
          <Stop offset="1" stopColor="#3f5a48" />
        </LinearGradient>
        <RadialGradient id="yVignette" cx="0.5" cy="0.45" r="0.75">
          <Stop offset="0.55" stopColor="#000" stopOpacity="0" />
          <Stop offset="1" stopColor="#000" stopOpacity="0.6" />
        </RadialGradient>
      </Defs>

      <Rect x={0} y={0} width={W} height={H} fill="url(#ySky)" />
      <Circle cx={90} cy={70} r={55} fill="url(#ySun)" />
      <Circle cx={90} cy={70} r={11} fill="#fff2d2" opacity={0.9} />

      {/* 遠くの丘と洹河 */}
      <Path d="M-4 170 C 50 150, 110 158, 160 150 S 260 140, 320 152 S 380 150, 404 146 L 404 190 L -4 190 Z" fill="#8f8a74" opacity={0.6} />
      <Rect x={0} y={182} width={W} height={H - 182} fill="url(#yGround)" />
      <Path d="M-4 196 C 60 190, 120 200, 180 196 S 300 188, 404 194 L 404 202 C 300 196, 200 206, 140 204 S 40 200, -4 204 Z" fill="#8fa3a0" />

      {/* 宮殿（版築の基壇の上の木造建築） */}
      <Hall x={150} y={182} w={110} s={1.2} />
      <Hall x={34} y={186} w={70} />
      <Hall x={290} y={188} w={64} s={0.9} />

      {/* 手前: 占いの火と青銅の鼎 */}
      <G transform="translate(176 300)">
        <Ellipse cx={0} cy={6} rx={22} ry={5} fill="#5a4426" />
        <Path d="M-14 4 L -14 -12 L 14 -12 L 14 4" fill="url(#yBronze)" />
        <Path d="M-16 -12 H 16" stroke="#4a6a55" strokeWidth={3} />
        <Path d="M-10 -12 L -12 -20 M10 -12 L 12 -20" stroke="#4a6a55" strokeWidth={2.4} />
        <Path d="M-11 4 L -13 14 M11 4 L 13 14 M0 5 L 0 14" stroke="#3f5a48" strokeWidth={2.4} />
        <Path d="M-10 -6 h 4 v -3 h 4 v 3 h 4 v -3 h 4 v 3 h 4" stroke="#a7c4a8" strokeWidth={0.7} fill="none" />
      </G>
      <G transform="translate(250 304)">
        <Ellipse cx={0} cy={4} rx={14} ry={4} fill="#3a2a18" />
        <Path d="M-6 2 C -8 -6, -2 -10, 0 -16 C 2 -10, 8 -6, 6 2 Z" fill="#e9893a" />
        <Path d="M-3 2 C -4 -3, -1 -6, 0 -10 C 1 -6, 4 -3, 3 2 Z" fill="#ffd27a" />
        <Path d="M0 -18 C -6 -30, 6 -40, -2 -56" stroke="#d8d0bf" strokeWidth={3} opacity={0.35} fill="none" />
      </G>

      {/* 右手前: あわの畑 */}
      <G>
        <Path d="M300 266 L 404 258 L 404 344 L 280 344 Z" fill="#a98f4a" />
        {Array.from({ length: 22 }, (_, i) => {
          const x = 300 + (i % 11) * 10 + (i > 10 ? 5 : 0);
          const y = 278 + (i > 10 ? 30 : 0);
          return (
            <G key={i}>
              <Path d={`M${x} ${y + 26} L ${x} ${y}`} stroke="#6f7a34" strokeWidth={1.2} />
              <Path d={`M${x} ${y} C ${x + 4} ${y - 2}, ${x + 6} ${y + 4}, ${x + 5} ${y + 10}`} stroke="#d9b45a" strokeWidth={3} fill="none" strokeLinecap="round" />
            </G>
          );
        })}
      </G>

      <Rect x={0} y={0} width={W} height={H} fill="url(#yVignette)" />
      {dim > 0 && <Rect x={0} y={0} width={W} height={H} fill="#05040a" opacity={dim} />}
    </Svg>
  );
}

export const YinxuBackdrop = memo(YinxuBackdropImpl);
