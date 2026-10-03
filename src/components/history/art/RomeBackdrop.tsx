import { memo } from 'react';
import Svg, { Circle, Defs, Ellipse, G, LinearGradient, Path, Rect, RadialGradient, Stop } from 'react-native-svg';

import { ART_VIEWBOX } from './artSpace';

/**
 * 仮背景: ハドリアヌス帝の時代のローマ（c. AD 120）。
 * - 中央にコロッセオ（80年完成）、右に丸屋根のパンテオン
 * - 中景を横切るアーチの水道橋
 * - 左に大浴場（トラヤヌス帝の浴場, 109年）
 * - 手前に石をしきつめた街道と糸杉
 */

function RomeBackdropImpl({ dim = 0, viewBox }: { dim?: number; viewBox?: string }) {
  const { width: W, height: H } = ART_VIEWBOX;
  return (
    <Svg width="100%" height="100%" viewBox={viewBox ?? `0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice">
      <Defs>
        <LinearGradient id="rSky" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#3d5f8f" />
          <Stop offset="0.6" stopColor="#c7b8a0" />
          <Stop offset="1" stopColor="#efd6a8" />
        </LinearGradient>
        <RadialGradient id="rSun" cx="0.5" cy="0.5" r="0.5">
          <Stop offset="0" stopColor="#fff0c8" stopOpacity="0.85" />
          <Stop offset="1" stopColor="#ffe7b0" stopOpacity="0" />
        </RadialGradient>
        <LinearGradient id="rGround" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#c8a878" />
          <Stop offset="1" stopColor="#8a6a44" />
        </LinearGradient>
        <RadialGradient id="rVignette" cx="0.5" cy="0.45" r="0.75">
          <Stop offset="0.55" stopColor="#000" stopOpacity="0" />
          <Stop offset="1" stopColor="#000" stopOpacity="0.55" />
        </RadialGradient>
      </Defs>

      <Rect x={0} y={0} width={W} height={H} fill="url(#rSky)" />
      <Circle cx={330} cy={70} r={60} fill="url(#rSun)" />
      <Circle cx={330} cy={70} r={12} fill="#fff6dc" />

      {/* 遠くの丘 */}
      <Path d="M-4 168 C 60 150, 120 158, 180 150 S 300 146, 404 156 L 404 200 L -4 200 Z" fill="#9a9a7e" opacity={0.55} />

      {/* 水道橋 */}
      <G>
        <Rect x={-4} y={150} width={408} height={8} fill="#b9946a" />
        {Array.from({ length: 17 }, (_, i) => (
          <G key={i}>
            <Rect x={-4 + i * 24} y={158} width={6} height={44} fill="#b08a60" />
            <Path d={`M${2 + i * 24} 172 A 9 12 0 0 1 ${20 + i * 24} 172`} stroke="#9c774f" strokeWidth={1} fill="none" />
          </G>
        ))}
      </G>

      <Rect x={0} y={198} width={W} height={H - 198} fill="url(#rGround)" />

      {/* 左: 大浴場 */}
      <G>
        <Rect x={20} y={168} width={110} height={44} fill="#c9a882" />
        <Path d="M30 168 A 20 16 0 0 1 70 168 Z M80 168 A 20 16 0 0 1 120 168 Z" fill="#b59470" />
        {[34, 54, 74, 94, 114].map((x) => (
          <Path key={x} d={`M${x} 212 L ${x} 190 A 6 6 0 0 1 ${x + 10} 190 L ${x + 10} 212`} fill="#3a2a1c" />
        ))}
      </G>

      {/* 中央: コロッセオ */}
      <G>
        <Path d="M150 214 L 150 150 Q 210 136 270 150 L 270 214 Z" fill="#d6b88c" />
        <Path d="M150 150 Q 210 136 270 150" stroke="#b8976a" strokeWidth={2} fill="none" />
        {[162, 182, 202].map((y) => (
          <G key={y}>
            {Array.from({ length: 8 }, (_, i) => (
              <Path
                key={i}
                d={`M${156 + i * 14} ${y + 12} L ${156 + i * 14} ${y + 4} A 4 4 0 0 1 ${164 + i * 14} ${y + 4} L ${164 + i * 14} ${y + 12}`}
                fill="#6a4a2e"
              />
            ))}
            <Path d={`M150 ${y + 13} H 270`} stroke="#b8976a" strokeWidth={1} />
          </G>
        ))}
      </G>

      {/* 右: パンテオン */}
      <G>
        <Rect x={300} y={186} width={70} height={28} fill="#d9c4a0" />
        <Path d="M300 186 A 35 28 0 0 1 370 186 Z" fill="#b9a688" />
        <Ellipse cx={335} cy={160} rx={6} ry={2} fill="#7a6a54" />
        <Path d="M290 192 L 335 176 L 380 192 Z" fill="#e4d2b0" />
        {[296, 308, 320, 332, 344, 356, 368].map((x) => (
          <Rect key={x} x={x} y={192} width={3} height={22} fill="#f0e3c8" />
        ))}
      </G>

      {/* 手前: 街道と糸杉 */}
      <Path d="M160 340 L 190 218 L 230 218 L 260 340 Z" fill="#9a8a78" />
      {Array.from({ length: 8 }, (_, i) => (
        <Path key={i} d={`M${186 - i * 3.6} ${230 + i * 14} H ${234 + i * 3.6}`} stroke="#7a6a58" strokeWidth={1} />
      ))}
      {[20, 120, 290, 386].map((x) => (
        <G key={x}>
          <Path d={`M${x} 300 L ${x} 240`} stroke="#3a2a1c" strokeWidth={2} />
          <Ellipse cx={x} cy={248} rx={7} ry={26} fill="#2f4a2a" />
        </G>
      ))}

      <Rect x={0} y={0} width={W} height={H} fill="url(#rVignette)" />
      {dim > 0 && <Rect x={0} y={0} width={W} height={H} fill="#05040a" opacity={dim} />}
    </Svg>
  );
}

export const RomeBackdrop = memo(RomeBackdropImpl);
