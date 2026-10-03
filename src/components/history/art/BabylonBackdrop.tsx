import { memo } from 'react';
import Svg, { Circle, Defs, Ellipse, G, LinearGradient, Path, RadialGradient, Rect, Stop } from 'react-native-svg';

import { ART_VIEWBOX } from './artSpace';

/**
 * 仮背景: 紀元前18世紀頃のバビロン（夕刻）。
 * 遠景のジッグラト／日干しれんがの家並み／市場の日よけ／手前のユーフラテス川／遠くのティグリス川。
 * 本番アートに差し替える場合は art/registry.ts のエントリを画像コンポーネントに置き換える。
 */

const HOUSES: [number, number, number, number, string][] = [
  [8, 214, 52, 48, '#9a6a44'],
  [54, 224, 44, 40, '#8a5c3a'],
  [96, 210, 40, 54, '#a3754b'],
  [132, 228, 36, 36, '#8f6040'],
  [292, 220, 46, 44, '#9c6c45'],
  [334, 208, 58, 58, '#8a5c3a'],
  [384, 226, 30, 38, '#a3754b'],
];

const PEOPLE: [number, number, number][] = [
  [196, 292, 1],
  [214, 296, 0.9],
  [356, 300, 1.05],
  [376, 296, 0.95],
  [262, 300, 0.85],
];

function House({ x, y, w, h, color }: { x: number; y: number; w: number; h: number; color: string }) {
  return (
    <G>
      <Rect x={x} y={y} width={w} height={h} fill={color} />
      <Rect x={x + w * 0.72} y={y} width={w * 0.28} height={h} fill="#000" opacity={0.18} />
      <Rect x={x - 1} y={y - 3} width={w + 2} height={4} fill={color} />
      <Rect x={x + w * 0.38} y={y + h - 16} width={8} height={16} fill="#2a1810" />
      <Rect x={x + 6} y={y + 9} width={5} height={5} fill="#2a1810" opacity={0.85} />
      <Rect x={x + w - 14} y={y + 9} width={5} height={5} fill="#2a1810" opacity={0.6} />
    </G>
  );
}

function Palm({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <G transform={`translate(${x} ${y}) scale(${s})`}>
      <Path d="M0 0 C 2 -18, 6 -34, 4 -52" stroke="#3a2a1c" strokeWidth={3} fill="none" />
      <Path d="M4 -52 C -8 -56, -20 -50, -26 -40 M4 -52 C 14 -58, 26 -54, 32 -44 M4 -52 C -2 -64, -14 -68, -22 -66 M4 -52 C 10 -66, 22 -70, 30 -64 M4 -52 C 4 -62, 2 -70, -2 -74" stroke="#2c3820" strokeWidth={4} strokeLinecap="round" fill="none" />
    </G>
  );
}

function Person({ x, y, s }: { x: number; y: number; s: number }) {
  return (
    <G transform={`translate(${x} ${y}) scale(${s})`} opacity={0.9}>
      <Circle cx={0} cy={-26} r={4} fill="#3a2a20" />
      <Path d="M-5 -21 L5 -21 L8 0 L-8 0 Z" fill="#4a3528" />
    </G>
  );
}

function BabylonBackdropImpl({ dim = 0, viewBox }: { dim?: number; viewBox?: string }) {
  const { width: W, height: H } = ART_VIEWBOX;
  return (
    <Svg width="100%" height="100%" viewBox={viewBox ?? `0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice">
      <Defs>
        <LinearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#141327" />
          <Stop offset="0.42" stopColor="#47293a" />
          <Stop offset="0.68" stopColor="#a65a37" />
          <Stop offset="1" stopColor="#e4a25d" />
        </LinearGradient>
        <RadialGradient id="sunGlow" cx="0.5" cy="0.5" r="0.5">
          <Stop offset="0" stopColor="#ffd9a0" stopOpacity="0.85" />
          <Stop offset="1" stopColor="#ffb070" stopOpacity="0" />
        </RadialGradient>
        <LinearGradient id="ground" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#b98a58" />
          <Stop offset="1" stopColor="#6d4a2f" />
        </LinearGradient>
        <LinearGradient id="river" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#5d8590" />
          <Stop offset="1" stopColor="#24404d" />
        </LinearGradient>
        <RadialGradient id="vignette" cx="0.5" cy="0.45" r="0.75">
          <Stop offset="0.55" stopColor="#000" stopOpacity="0" />
          <Stop offset="1" stopColor="#000" stopOpacity="0.65" />
        </RadialGradient>
        <LinearGradient id="haze" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#f3c58a" stopOpacity="0" />
          <Stop offset="1" stopColor="#f3c58a" stopOpacity="0.35" />
        </LinearGradient>
      </Defs>

      {/* 空と太陽 */}
      <Rect x={0} y={0} width={W} height={H} fill="url(#sky)" />
      <Circle cx={262} cy={150} r={90} fill="url(#sunGlow)" />
      <Circle cx={262} cy={150} r={20} fill="#ffe0b0" opacity={0.92} />
      {[24, 38, 52].map((y, i) => (
        <Circle key={y} cx={40 + i * 130} cy={y} r={0.9} fill="#fff" opacity={0.5} />
      ))}

      {/* 遠景: ジッグラト */}
      <G opacity={0.92}>
        <Path d="M170 212 L330 212 L322 190 L178 190 Z" fill="#5a3628" />
        <Path d="M190 190 L310 190 L303 170 L197 170 Z" fill="#5f3a2b" />
        <Path d="M208 170 L292 170 L286 152 L214 152 Z" fill="#643d2d" />
        <Path d="M224 152 L276 152 L271 136 L229 136 Z" fill="#69402f" />
        <Rect x={240} y={122} width={22} height={14} fill="#6e4431" />
        <Path d="M243 212 L259 212 L255 170 L247 170 Z" fill="#7c4e36" />
        <Path d="M178 190 L322 190 M197 170 L303 170 M214 152 L286 152 M229 136 L271 136" stroke="#f0b070" strokeWidth={0.8} opacity={0.55} />
      </G>

      {/* 遠景: 城壁 */}
      <G opacity={0.95}>
        <Rect x={0} y={200} width={W} height={14} fill="#6b4430" />
        {Array.from({ length: 34 }, (_, i) => (
          <Rect key={i} x={i * 12} y={196} width={6} height={5} fill="#6b4430" />
        ))}
        <Rect x={70} y={186} width={18} height={28} fill="#6f4732" />
        <Rect x={118} y={186} width={18} height={28} fill="#6f4732" />
      </G>
      <Rect x={0} y={180} width={W} height={36} fill="url(#haze)" />

      {/* 地面 */}
      <Rect x={0} y={212} width={W} height={H - 212} fill="url(#ground)" />

      {/* 遠くのティグリス川（東） */}
      <Path d="M300 226 Q 326 218 352 222 T 404 214" stroke="#f3cf98" strokeWidth={3} fill="none" opacity={0.8} />
      <Path d="M306 229 Q 332 222 358 225 T 404 219" stroke="#9fb7b9" strokeWidth={1.2} fill="none" opacity={0.6} />

      {/* 家並みと椰子 */}
      <Palm x={40} y={216} s={0.9} />
      <Palm x={160} y={226} s={0.75} />
      <Palm x={330} y={212} s={0.85} />
      {HOUSES.map(([x, y, w, h, color]) => (
        <House key={`${x}-${y}`} x={x} y={y} w={w} h={h} color={color} />
      ))}

      {/* 手前: ユーフラテス川（西） */}
      <Path d="M-4 270 C 50 262, 104 270, 140 292 S 190 330, 214 344 L -4 344 Z" fill="url(#river)" />
      <Path d="M10 280 C 50 276, 80 282, 104 292 M24 300 C 60 296, 92 304, 120 318 M40 322 C 70 318, 104 326, 134 338" stroke="#d8ecec" strokeWidth={1} opacity={0.35} fill="none" />
      <Path d="M-4 270 C 50 262, 104 270, 140 292 S 190 330, 214 344" stroke="#8a6a44" strokeWidth={2} fill="none" />
      {Array.from({ length: 9 }, (_, i) => (
        <Path key={i} d={`M${120 + i * 9} ${286 + i * 5} l ${-2 + (i % 3)} -14`} stroke="#4c5a2c" strokeWidth={1.4} />
      ))}

      {/* 市場の日よけと人々 */}
      <G>
        <Path d="M232 270 L300 270 L292 284 L240 284 Z" fill="#7a3b2e" />
        <Path d="M246 270 L254 270 L250 284 L244 284 Z M268 270 L276 270 L274 284 L266 284 Z" fill="#a8583f" opacity={0.7} />
        <Path d="M312 276 L384 276 L376 290 L320 290 Z" fill="#33466e" />
        <Path d="M330 276 L338 276 L336 290 L328 290 Z M354 276 L362 276 L360 290 L352 290 Z" fill="#4a5f8e" opacity={0.7} />
        <Rect x={240} y={284} width={2} height={20} fill="#3a2a1c" />
        <Rect x={290} y={284} width={2} height={20} fill="#3a2a1c" />
        <Rect x={320} y={290} width={2} height={18} fill="#3a2a1c" />
        <Rect x={374} y={290} width={2} height={18} fill="#3a2a1c" />
        <Rect x={238} y={300} width={58} height={6} fill="#5a3d26" />
        {[248, 262, 276].map((x) => (
          <Ellipse key={x} cx={x} cy={297} rx={5} ry={5.5} fill="#a0623a" />
        ))}
        <Rect x={318} y={304} width={60} height={6} fill="#5a3d26" />
        {[330, 346].map((x) => (
          <Ellipse key={x} cx={x} cy={301} rx={7} ry={4} fill="#c8a060" />
        ))}
      </G>
      {PEOPLE.map(([x, y, s]) => (
        <Person key={x} x={x} y={y} s={s} />
      ))}

      <Rect x={0} y={0} width={W} height={H} fill="url(#vignette)" />
      {dim > 0 && <Rect x={0} y={0} width={W} height={H} fill="#05040a" opacity={dim} />}
    </Svg>
  );
}

export const BabylonBackdrop = memo(BabylonBackdropImpl);
