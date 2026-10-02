import { memo } from 'react';
import Svg, { Circle, Defs, Ellipse, Path, RadialGradient, Rect, Stop } from 'react-native-svg';

/**
 * 仮の人物アート（エジプト）。viewBox 100x200、足元を下端に揃える。
 * 古代エジプト美術の慣習どおり、男性の肌は赤褐色で描く。
 */

const SKIN = '#9a5a35';
const SKIN_SHADE = '#7a4426';
const LINEN = '#f1ead8';
const LINEN_SHADE = '#d6ccb4';

/** 書記座像（ルーヴル美術館蔵、第4〜5王朝）にならった、あぐらで膝にパピルスを広げる書記 */
function EgyptianScribeImpl() {
  return (
    <Svg width="100%" height="100%" viewBox="0 0 100 200" preserveAspectRatio="xMidYMax meet">
      <Ellipse cx={50} cy={195} rx={36} ry={4} fill="#000" opacity={0.35} />
      {/* 組んだ脚と腰布 */}
      <Path d="M14 192 C 16 176, 32 170, 50 170 C 68 170, 84 176, 86 192 Z" fill={LINEN} />
      <Path d="M50 170 C 68 170, 84 176, 86 192 L 60 192 Z" fill={LINEN_SHADE} />
      <Path d="M18 190 C 30 184, 40 184, 50 188 M50 188 C 60 184, 70 184, 82 190" stroke={SKIN_SHADE} strokeWidth={3} fill="none" />
      {/* 胴（上半身は裸） */}
      <Path d="M36 128 C 34 146, 34 160, 36 172 L 64 172 C 66 160, 66 146, 64 128 Z" fill={SKIN} />
      <Path d="M56 128 C 60 146, 62 160, 64 172 L 64 128 Z" fill={SKIN_SHADE} />
      <Path d="M44 150 C 48 152, 52 152, 56 150" stroke={SKIN_SHADE} strokeWidth={1} fill="none" />
      {/* 膝の上に広げたパピルス */}
      <Path d="M30 170 L 70 170 L 74 178 L 26 178 Z" fill="#e8d8a6" />
      <Path d="M30 170 L 26 178 M70 170 L 74 178" stroke="#b39a62" strokeWidth={1} />
      {[34, 42, 50, 58].map((x) => (
        <Path key={x} d={`M${x} 173 l 3 0 M${x + 1} 175.5 l 4 0`} stroke="#3a2a1a" strokeWidth={0.8} />
      ))}
      {/* 腕と葦のペン */}
      <Path d="M37 132 C 30 146, 32 162, 40 170" stroke={SKIN} strokeWidth={6} strokeLinecap="round" fill="none" />
      <Path d="M63 132 C 70 146, 68 160, 60 168" stroke={SKIN} strokeWidth={6} strokeLinecap="round" fill="none" />
      <Path d="M60 168 L 68 158" stroke="#c9b07a" strokeWidth={1.6} strokeLinecap="round" />
      {/* 首・頭・短い黒髪のかつら */}
      <Rect x={45} y={116} width={10} height={14} fill={SKIN_SHADE} />
      <Circle cx={50} cy={106} r={12} fill={SKIN} />
      <Path d="M37 104 C 36 90, 64 90, 63 104 L 63 110 C 60 106, 40 106, 37 110 Z" fill="#1b1612" />
      <Path d="M52 105 l 6 0" stroke="#1a110b" strokeWidth={1.4} strokeLinecap="round" />
      <Path d="M58 105 l 3 1" stroke="#1a110b" strokeWidth={0.8} />
    </Svg>
  );
}

/** クフ王: ネメス頭巾・付けひげ・幅広の襟飾り・プリーツの腰布、杖を持つ */
function KhufuImpl() {
  return (
    <Svg width="100%" height="100%" viewBox="0 0 100 200" preserveAspectRatio="xMidYMax meet">
      <Defs>
        <RadialGradient id="kAura" cx="0.5" cy="0.4" r="0.5">
          <Stop offset="0" stopColor="#ffe3a0" stopOpacity="0.5" />
          <Stop offset="1" stopColor="#ffe3a0" stopOpacity="0" />
        </RadialGradient>
      </Defs>
      <Ellipse cx={50} cy={80} rx={50} ry={80} fill="url(#kAura)" />
      <Ellipse cx={50} cy={195} rx={30} ry={4} fill="#000" opacity={0.4} />
      {/* 杖 */}
      <Path d="M84 64 L 84 194" stroke="#8a6a3a" strokeWidth={2.4} />
      <Path d="M80 60 Q 84 54 88 60" stroke="#d6ae62" strokeWidth={2.4} fill="none" />
      {/* 脚 */}
      <Path d="M40 148 L 38 190 M60 148 L 62 190" stroke={SKIN} strokeWidth={8} strokeLinecap="round" />
      <Path d="M30 191 L 44 191 M56 191 L 70 191" stroke="#c9a25e" strokeWidth={3} strokeLinecap="round" />
      {/* プリーツの腰布（シェンティ）と帯 */}
      <Path d="M32 112 L 68 112 L 74 152 L 26 152 Z" fill={LINEN} />
      <Path d="M50 112 L 68 112 L 74 152 L 50 152 Z" fill={LINEN_SHADE} />
      {[34, 40, 46, 54, 60, 66].map((x) => (
        <Path key={x} d={`M${x} 116 L ${x + (x - 50) * 0.18} 150`} stroke="#c2b694" strokeWidth={0.7} />
      ))}
      <Rect x={31} y={109} width={38} height={5} fill="#d6ae62" />
      {/* 胴（裸の上半身） */}
      <Path d="M32 64 C 30 82, 31 98, 33 110 L 67 110 C 69 98, 70 82, 68 64 Z" fill={SKIN} />
      <Path d="M58 64 C 62 82, 66 98, 67 110 L 68 64 Z" fill={SKIN_SHADE} />
      {/* 腕 */}
      <Path d="M32 68 C 26 84, 26 98, 30 110" stroke={SKIN} strokeWidth={7} strokeLinecap="round" fill="none" />
      <Path d="M68 68 C 76 72, 82 70, 84 78" stroke={SKIN} strokeWidth={7} strokeLinecap="round" fill="none" />
      <Path d="M28 84 L 34 84" stroke="#d6ae62" strokeWidth={2.5} />
      {/* 幅広の襟飾り（ウセク） */}
      <Path d="M34 62 C 38 78, 62 78, 66 62 Z" fill="#2f5d8c" />
      <Path d="M36 64 C 40 74, 60 74, 64 64" stroke="#d6ae62" strokeWidth={2} fill="none" />
      <Path d="M38 66 C 42 71, 58 71, 62 66" stroke="#b0573a" strokeWidth={1.4} fill="none" />
      {/* ネメス頭巾（金と青の縞） */}
      <Path d="M34 36 C 34 20, 66 20, 66 36 L 70 62 L 58 56 L 42 56 L 30 62 Z" fill="#d6ae62" />
      {[28, 33, 38, 43, 48].map((y) => (
        <Path key={y} d={`M${34 - (y - 28) * 0.1} ${y} L ${66 + (y - 28) * 0.1} ${y}`} stroke="#2f5d8c" strokeWidth={2} />
      ))}
      <Path d="M30 62 L 34 40 M70 62 L 66 40" stroke="#2f5d8c" strokeWidth={2} />
      {/* 顔・付けひげ */}
      <Path d="M39 34 C 39 26, 61 26, 61 34 L 60 48 C 58 54, 42 54, 40 48 Z" fill={SKIN} />
      <Path d="M52 38 l 6 0" stroke="#1a110b" strokeWidth={1.4} strokeLinecap="round" />
      <Path d="M58 38 l 3 1" stroke="#1a110b" strokeWidth={0.8} />
      <Rect x={47} y={52} width={6} height={10} fill="#1d1612" />
      <Rect x={46} y={22} width={8} height={4} fill="#2f5d8c" />
      <Circle cx={50} cy={21} r={2.2} fill="#d6ae62" />
    </Svg>
  );
}

export const EgyptianScribeFigure = memo(EgyptianScribeImpl);
export const KhufuFigure = memo(KhufuImpl);
