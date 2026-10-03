import { memo } from 'react';
import Svg, { Circle, Defs, G, LinearGradient, Path, Polygon, RadialGradient, Rect, Stop } from 'react-native-svg';

import { ART_VIEWBOX } from './artSpace';

/**
 * 仮背景: 秦の都・咸陽（c. 210 BCE）。
 * - 高い版築の基壇の上にそびえる瓦ぶきの宮殿
 * - 遠くの尾根に連なる長城
 * - 手前に黒い旗（秦は黒を尊んだ）と、度量衡の基準となる青銅のます
 */

function SmallHall({ x, y, w }: { x: number; y: number; w: number }) {
  return (
    <G>
      <Rect x={x - 4} y={y} width={w + 8} height={8} fill="#b89a68" />
      <Rect x={x} y={y - 16} width={w} height={16} fill="#5a2f22" />
      <Polygon points={`${x - 10},${y - 16} ${x + w + 10},${y - 16} ${x + w - 4},${y - 28} ${x + 4},${y - 28}`} fill="#3a3530" />
    </G>
  );
}

function XianyangBackdropImpl({ dim = 0, viewBox }: { dim?: number; viewBox?: string }) {
  const { width: W, height: H } = ART_VIEWBOX;
  return (
    <Svg width="100%" height="100%" viewBox={viewBox ?? `0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice">
      <Defs>
        <LinearGradient id="xSky" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#2e3448" />
          <Stop offset="0.55" stopColor="#8a8a86" />
          <Stop offset="1" stopColor="#d9c9a0" />
        </LinearGradient>
        <LinearGradient id="xGround" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#bfa476" />
          <Stop offset="1" stopColor="#7f6640" />
        </LinearGradient>
        <RadialGradient id="xSun" cx="0.5" cy="0.5" r="0.5">
          <Stop offset="0" stopColor="#ffe2b0" stopOpacity="0.7" />
          <Stop offset="1" stopColor="#ffe2b0" stopOpacity="0" />
        </RadialGradient>
        <RadialGradient id="xVignette" cx="0.5" cy="0.45" r="0.75">
          <Stop offset="0.55" stopColor="#000" stopOpacity="0" />
          <Stop offset="1" stopColor="#000" stopOpacity="0.6" />
        </RadialGradient>
      </Defs>

      <Rect x={0} y={0} width={W} height={H} fill="url(#xSky)" />
      <Circle cx={80} cy={60} r={50} fill="url(#xSun)" />

      {/* 遠くの尾根と長城 */}
      <Path d="M-4 120 L 40 100 L 80 112 L 130 92 L 180 108 L 230 96 L 280 110 L 330 94 L 404 108 L 404 150 L -4 150 Z" fill="#6f7062" opacity={0.7} />
      <Path d="M-4 118 L 40 98 L 80 110 L 130 90 L 180 106 L 230 94 L 280 108 L 330 92 L 404 106" stroke="#b8ae94" strokeWidth={2.2} fill="none" />
      {[40, 130, 230, 330].map((x, i) => (
        <Rect key={x} x={x - 3} y={[92, 84, 88, 86][i]} width={6} height={8} fill="#b8ae94" />
      ))}

      {/* 宮殿 */}
      <Rect x={0} y={198} width={W} height={H - 198} fill="url(#xGround)" />
      <G>
        <Polygon points="110,206 130,160 270,160 290,206" fill="#c2a46e" />
        {[170, 180, 190, 200].map((y) => (
          <Path key={y} d={`M${110 + (206 - y) * 0.43} ${y} H ${290 - (206 - y) * 0.43}`} stroke="#a3854f" strokeWidth={0.7} />
        ))}
        <Rect x={146} y={126} width={108} height={34} fill="#5a2f22" />
        {Array.from({ length: 10 }, (_, i) => (
          <Rect key={i} x={148 + i * 11.4} y={126} width={3} height={34} fill="#2a1a14" />
        ))}
        <Polygon points="128,126 272,126 252,106 148,106" fill="#3a3530" />
        <Polygon points="160,106 240,106 230,94 170,94" fill="#2c2824" />
        <Path d="M128 126 Q 120 122 116 118 M272 126 Q 280 122 284 118" stroke="#3a3530" strokeWidth={3} fill="none" />
        <Path d="M196 160 L 196 206 M204 160 L 204 206" stroke="#a3854f" strokeWidth={1} />
      </G>
      <SmallHall x={20} y={204} w={60} />
      <SmallHall x={320} y={206} w={64} />

      {/* 手前: 黒い旗と青銅のます */}
      {[36, 362].map((x) => (
        <G key={x}>
          <Path d={`M${x} 330 L ${x} 236`} stroke="#3a2a1c" strokeWidth={2} />
          <Path d={`M${x} 238 L ${x + 22} 244 L ${x + 18} 256 L ${x} 262 Z`} fill="#141414" />
        </G>
      ))}
      <G transform="translate(260 300)">
        <Rect x={-12} y={-10} width={24} height={16} rx={2} fill="#5f7f6a" />
        <Rect x={12} y={-6} width={10} height={4} fill="#4a6a55" />
        <Path d="M-8 -4 h 16 M-8 0 h 16" stroke="#a7c4a8" strokeWidth={0.6} />
      </G>

      <Rect x={0} y={0} width={W} height={H} fill="url(#xVignette)" />
      {dim > 0 && <Rect x={0} y={0} width={W} height={H} fill="#05040a" opacity={dim} />}
    </Svg>
  );
}

export const XianyangBackdrop = memo(XianyangBackdropImpl);
