import { memo } from 'react';
import Svg, { Circle, Defs, Ellipse, G, Path, RadialGradient, Rect, Stop } from 'react-native-svg';

/**
 * 仮の人物アート（シルエット寄りの様式化）。viewBox 100x200 の縦長で描き、足元を下端に揃える。
 * 本番アートに差し替える場合は art/registry.ts で画像コンポーネントへ置き換える。
 */

const SKIN = '#8a5a3c';
const SKIN_SHADE = '#6e452c';

function ScribeImpl() {
  return (
    <Svg width="100%" height="100%" viewBox="0 0 100 200" preserveAspectRatio="xMidYMax meet">
      <Ellipse cx={50} cy={195} rx={30} ry={4} fill="#000" opacity={0.35} />
      {/* 房飾りのついた長衣 */}
      <Path d="M33 66 C 30 100, 26 150, 24 190 L 76 190 C 74 150, 70 100, 67 66 Z" fill="#d6c7a6" />
      <Path d="M58 66 C 62 100, 66 150, 70 190 L 76 190 C 74 150, 70 100, 67 66 Z" fill="#000" opacity={0.15} />
      <Path d="M36 110 C 46 114, 56 114, 66 110 M30 150 C 44 155, 58 155, 72 150" stroke="#a8977a" strokeWidth={1.2} fill="none" />
      {Array.from({ length: 13 }, (_, i) => (
        <Rect key={i} x={25 + i * 4} y={186} width={1.4} height={7} fill="#b9a784" />
      ))}
      {/* 首と頭（剃髪） */}
      <Rect x={45} y={52} width={10} height={14} fill={SKIN_SHADE} />
      <Circle cx={50} cy={42} r={13} fill={SKIN} />
      <Path d="M38 38 C 40 28, 60 28, 62 38" fill="#7a4e33" opacity={0.6} />
      <Circle cx={55} cy={42} r={1.3} fill="#1a110b" />
      <Ellipse cx={39} cy={44} rx={2} ry={3.5} fill={SKIN_SHADE} />
      {/* 腕と粘土板・葦のペン */}
      <Path d="M36 70 C 30 86, 34 100, 44 104" stroke={SKIN} strokeWidth={7} strokeLinecap="round" fill="none" />
      <Path d="M64 70 C 70 84, 66 96, 58 100" stroke={SKIN} strokeWidth={7} strokeLinecap="round" fill="none" />
      <Rect x={38} y={92} width={26} height={30} rx={3} fill="#b98a5a" />
      <Rect x={38} y={92} width={26} height={30} rx={3} fill="none" stroke="#7a5432" strokeWidth={1} />
      {[98, 104, 110, 116].map((y) => (
        <Path key={y} d={`M42 ${y} l3 0 l-1.5 2 M48 ${y} l3 0 l-1.5 2 M55 ${y} l3 0 l-1.5 2`} stroke="#6b4a2a" strokeWidth={0.9} fill="none" />
      ))}
      <Path d="M58 100 L 72 84" stroke="#c9b07a" strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}

function HammurabiImpl() {
  return (
    <Svg width="100%" height="100%" viewBox="0 0 100 200" preserveAspectRatio="xMidYMax meet">
      <Defs>
        <RadialGradient id="aura" cx="0.5" cy="0.4" r="0.5">
          <Stop offset="0" stopColor="#f2c879" stopOpacity="0.45" />
          <Stop offset="1" stopColor="#f2c879" stopOpacity="0" />
        </RadialGradient>
      </Defs>
      <Ellipse cx={50} cy={80} rx={50} ry={80} fill="url(#aura)" />
      <Ellipse cx={50} cy={195} rx={32} ry={4} fill="#000" opacity={0.4} />
      {/* 杖 */}
      <Path d="M86 60 L 86 194" stroke="#8a6a3a" strokeWidth={2.4} />
      <Circle cx={86} cy={58} r={3.4} fill="#d6ae62" />
      {/* 左肩から斜めに掛ける長衣 */}
      <Path d="M30 64 C 26 100, 22 150, 20 192 L 80 192 C 78 150, 74 100, 70 64 Z" fill="#2c3352" />
      <Path d="M30 64 L 70 64 L 76 80 L 24 140 Z" fill="#3a4470" />
      <Path d="M70 64 L 22 150" stroke="#d6ae62" strokeWidth={3} />
      <Path d="M20 188 L 80 188" stroke="#d6ae62" strokeWidth={2.5} />
      <Path d="M62 64 C 66 120, 72 160, 78 192" stroke="#000" strokeWidth={10} opacity={0.12} fill="none" />
      {/* 右腕（杖を持つ） */}
      <Path d="M68 70 C 78 74, 84 70, 86 80" stroke={SKIN} strokeWidth={7} strokeLinecap="round" fill="none" />
      {/* 頭・つば付きの丸い冠 */}
      <Rect x={45} y={50} width={10} height={12} fill={SKIN_SHADE} />
      <Circle cx={50} cy={40} r={13} fill={SKIN} />
      <Path d="M36 32 C 36 16, 64 16, 64 32 Z" fill="#3a3550" />
      <Rect x={33} y={30} width={34} height={5} rx={2.5} fill="#4a4468" />
      <Rect x={33} y={30} width={34} height={1.6} fill="#d6ae62" />
      <Circle cx={55} cy={41} r={1.3} fill="#1a110b" />
      {/* 四角く整えた長いあごひげ */}
      <Path d="M39 44 C 39 52, 42 56, 42 58 L 40 84 L 60 84 L 58 58 C 58 56, 61 52, 61 44 C 56 50, 44 50, 39 44 Z" fill="#1d1612" />
      <G stroke="#3b2c22" strokeWidth={1}>
        {[60, 66, 72, 78].map((y) => (
          <Path key={y} d={`M42 ${y} q 2 -2 4 0 q 2 2 4 0 q 2 -2 4 0 q 2 2 4 0`} fill="none" />
        ))}
      </G>
    </Svg>
  );
}

export const ScribeFigure = memo(ScribeImpl);
export const HammurabiFigure = memo(HammurabiImpl);
