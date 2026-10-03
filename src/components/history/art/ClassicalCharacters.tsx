import { memo } from 'react';
import Svg, { Circle, Defs, Ellipse, Path, RadialGradient, Rect, Stop } from 'react-native-svg';

/**
 * 仮の人物アート（ギリシャ・秦・ローマ）。viewBox 100x200、足元を下端に揃える。
 */

const SKIN_MED = '#c08a62';
const SKIN_MED_SHADE = '#9c6c48';
const SKIN_CHINA = '#c49a6c';
const SKIN_CHINA_SHADE = '#a57c50';

function Aura({ id, color }: { id: string; color: string }) {
  return (
    <>
      <Defs>
        <RadialGradient id={id} cx="0.5" cy="0.4" r="0.5">
          <Stop offset="0" stopColor={color} stopOpacity="0.45" />
          <Stop offset="1" stopColor={color} stopOpacity="0" />
        </RadialGradient>
      </Defs>
      <Ellipse cx={50} cy={80} rx={50} ry={80} fill={`url(#${id})`} />
    </>
  );
}

/** ソクラテス: 素朴な外衣（ヒマティオン）、はだし、上を向いた鼻と、はげ上がった頭、ちぢれたひげ */
function SocratesImpl() {
  return (
    <Svg width="100%" height="100%" viewBox="0 0 100 200" preserveAspectRatio="xMidYMax meet">
      <Ellipse cx={50} cy={195} rx={28} ry={4} fill="#000" opacity={0.35} />
      <Path d="M40 168 L 38 192 M60 168 L 62 192" stroke={SKIN_MED} strokeWidth={7} strokeLinecap="round" />
      <Path d="M30 66 C 26 110, 24 150, 26 172 L 74 172 C 76 150, 74 110, 70 66 Z" fill="#a68a64" />
      <Path d="M30 66 L 70 66 L 74 84 L 26 130 Z" fill="#8e7452" />
      <Path d="M70 70 C 78 84, 76 98, 68 104" stroke={SKIN_MED} strokeWidth={7} strokeLinecap="round" fill="none" />
      <Rect x={45} y={52} width={10} height={14} fill={SKIN_MED_SHADE} />
      <Circle cx={50} cy={40} r={13} fill={SKIN_MED} />
      <Path d="M37 42 C 36 34, 38 32, 40 30 M63 42 C 64 34, 62 32, 60 30" stroke="#6f6f6f" strokeWidth={3} fill="none" />
      <Path d="M39 46 C 40 62, 60 62, 61 46 C 56 52, 44 52, 39 46 Z" fill="#7d7d7d" />
      <Path d="M42 52 q 2 3 4 0 q 2 3 4 0 q 2 3 4 0 q 2 3 4 0" stroke="#5f5f5f" strokeWidth={1} fill="none" />
      <Circle cx={55} cy={40} r={1.3} fill="#1a110b" />
      <Path d="M57 44 q 3 1 2 3" stroke={SKIN_MED_SHADE} strokeWidth={1.4} fill="none" />
    </Svg>
  );
}

/** ペリクレス: 胸像と同じく、コリント式のかぶとを頭の上に押し上げてかぶる。白い外衣に青いふちどり */
function PericlesImpl() {
  return (
    <Svg width="100%" height="100%" viewBox="0 0 100 200" preserveAspectRatio="xMidYMax meet">
      <Aura id="peAura" color="#cfe4ff" />
      <Ellipse cx={50} cy={195} rx={30} ry={4} fill="#000" opacity={0.4} />
      <Path d="M40 168 L 38 192 M60 168 L 62 192" stroke={SKIN_MED} strokeWidth={7} strokeLinecap="round" />
      <Path d="M28 66 C 24 110, 22 150, 24 174 L 76 174 C 78 150, 76 110, 72 66 Z" fill="#f2ede0" />
      <Path d="M24 170 H 76" stroke="#3c5aa6" strokeWidth={3} />
      <Path d="M28 66 L 72 66 L 76 86 L 24 134 Z" fill="#e2dccb" />
      <Path d="M72 70 L 26 132" stroke="#3c5aa6" strokeWidth={2.5} />
      <Path d="M30 72 C 24 88, 26 100, 32 108" stroke={SKIN_MED} strokeWidth={7} strokeLinecap="round" fill="none" />
      <Rect x={45} y={52} width={10} height={14} fill={SKIN_MED_SHADE} />
      <Circle cx={50} cy={42} r={12} fill={SKIN_MED} />
      <Path d="M40 48 C 41 62, 59 62, 60 48 C 56 53, 44 53, 40 48 Z" fill="#4a3424" />
      <Circle cx={55} cy={42} r={1.3} fill="#1a110b" />
      {/* 押し上げたコリント式のかぶと */}
      <Path d="M36 34 C 36 16, 64 16, 64 34 L 60 36 L 40 36 Z" fill="#b8913e" />
      <Path d="M40 36 L 44 44 M60 36 L 56 44" stroke="#9a7630" strokeWidth={2} />
      <Path d="M38 20 C 46 4, 60 6, 66 18" stroke="#9a2f2a" strokeWidth={6} strokeLinecap="round" fill="none" />
    </Svg>
  );
}

/** 秦の役人: 黒い衣、高い冠、竹簡（竹の札をひもでつないだ書類）を持つ */
function QinOfficialImpl() {
  return (
    <Svg width="100%" height="100%" viewBox="0 0 100 200" preserveAspectRatio="xMidYMax meet">
      <Ellipse cx={50} cy={195} rx={28} ry={4} fill="#000" opacity={0.35} />
      <Path d="M30 68 C 26 110, 24 150, 24 192 L 76 192 C 76 150, 74 110, 70 68 Z" fill="#1c1a1a" />
      <Path d="M50 68 L 50 192" stroke="#5a2f22" strokeWidth={2} />
      <Path d="M36 68 L 50 92 L 64 68" stroke="#5a2f22" strokeWidth={3} fill="none" />
      <Rect x={30} y={112} width={40} height={5} fill="#5a2f22" />
      {/* 竹簡 */}
      <Path d="M32 74 C 26 92, 30 104, 40 108" stroke="#1c1a1a" strokeWidth={10} strokeLinecap="round" fill="none" />
      <Path d="M68 74 C 74 92, 70 104, 60 108" stroke="#1c1a1a" strokeWidth={10} strokeLinecap="round" fill="none" />
      <Rect x={36} y={96} width={28} height={22} fill="#d8c48a" />
      {[40, 45, 50, 55, 60].map((x) => (
        <Path key={x} d={`M${x} 96 V 118`} stroke="#a8924f" strokeWidth={0.8} />
      ))}
      <Path d="M36 102 H 64 M36 112 H 64" stroke="#6b4a2a" strokeWidth={0.8} />
      <Circle cx={36} cy={108} r={2.5} fill={SKIN_CHINA} />
      <Circle cx={64} cy={108} r={2.5} fill={SKIN_CHINA} />
      <Rect x={45} y={54} width={10} height={14} fill={SKIN_CHINA_SHADE} />
      <Circle cx={50} cy={44} r={12} fill={SKIN_CHINA} />
      <Path d="M38 42 C 38 32, 62 32, 62 42 L 62 38 C 56 35, 44 35, 38 38 Z" fill="#14100c" />
      <Rect x={44} y={20} width={12} height={14} fill="#14100c" />
      <Path d="M44 34 L 40 46 M56 34 L 60 46" stroke="#14100c" strokeWidth={1} />
      <Path d="M52 45 q 4 1 6 0" stroke="#1a110b" strokeWidth={1.2} strokeLinecap="round" fill="none" />
    </Svg>
  );
}

/** 始皇帝: 黒い衣に赤のふちどり、玉のすだれを前後に垂らした冕冠（べんかん）、腰に剣 */
function ShiHuangdiImpl() {
  return (
    <Svg width="100%" height="100%" viewBox="0 0 100 200" preserveAspectRatio="xMidYMax meet">
      <Aura id="shAura" color="#ffd9a0" />
      <Ellipse cx={50} cy={195} rx={32} ry={4} fill="#000" opacity={0.4} />
      <Path d="M28 66 C 24 110, 22 150, 20 192 L 80 192 C 78 150, 76 110, 72 66 Z" fill="#141212" />
      <Path d="M20 186 H 80" stroke="#a8322a" strokeWidth={5} />
      <Path d="M36 66 L 50 100 L 64 66" stroke="#a8322a" strokeWidth={3} fill="none" />
      <Rect x={28} y={110} width={44} height={6} fill="#a8322a" />
      <Path d="M66 116 L 84 150" stroke="#8a7a5a" strokeWidth={3} />
      <Path d="M64 113 L 70 120" stroke="#c9a24e" strokeWidth={4} />
      <Path d="M30 72 C 24 90, 28 104, 38 110" stroke="#141212" strokeWidth={10} strokeLinecap="round" fill="none" />
      <Rect x={45} y={52} width={10} height={14} fill={SKIN_CHINA_SHADE} />
      <Circle cx={50} cy={42} r={12} fill={SKIN_CHINA} />
      <Path d="M42 48 C 44 58, 56 58, 58 48 C 55 51, 45 51, 42 48 Z" fill="#14100c" />
      <Path d="M52 43 q 4 1 6 0" stroke="#1a110b" strokeWidth={1.2} strokeLinecap="round" fill="none" />
      {/* 冕冠: 平らな板と玉のすだれ */}
      <Rect x={42} y={22} width={16} height={10} fill="#14100c" />
      <Rect x={30} y={18} width={40} height={4} fill="#1f1a16" />
      {[33, 38, 43, 48, 53, 58, 63, 67].map((x) => (
        <Path key={x} d={`M${x} 22 V 34`} stroke="#c9a24e" strokeWidth={1.2} strokeDasharray="1.5 1.2" />
      ))}
    </Svg>
  );
}

/** ローマの水道技師: 短いトゥニカ、腰帯、測量具グローマ（十字の棒からおもりを垂らす道具） */
function RomanEngineerImpl() {
  return (
    <Svg width="100%" height="100%" viewBox="0 0 100 200" preserveAspectRatio="xMidYMax meet">
      <Ellipse cx={50} cy={195} rx={28} ry={4} fill="#000" opacity={0.35} />
      {/* グローマ */}
      <Path d="M84 62 L 84 194" stroke="#6b4a2a" strokeWidth={2} />
      <Path d="M72 62 L 96 62 M84 50 L 84 74" stroke="#6b4a2a" strokeWidth={1.6} />
      {[72, 96].map((x) => (
        <Path key={x} d={`M${x} 62 L ${x} 80`} stroke="#3a2a1c" strokeWidth={0.6} />
      ))}
      <Circle cx={72} cy={81} r={1.6} fill="#5f5f5f" />
      <Circle cx={96} cy={81} r={1.6} fill="#5f5f5f" />
      <Path d="M40 150 L 38 190 M60 150 L 62 190" stroke={SKIN_MED} strokeWidth={7} strokeLinecap="round" />
      <Path d="M32 190 L 44 190 M56 190 L 68 190" stroke="#6b4a2a" strokeWidth={3} strokeLinecap="round" />
      <Path d="M30 66 C 28 100, 28 130, 28 152 L 72 152 C 72 130, 72 100, 70 66 Z" fill="#b5875a" />
      <Rect x={29} y={112} width={42} height={5} fill="#5a3d22" />
      <Path d="M68 72 C 76 76, 82 72, 84 80" stroke={SKIN_MED} strokeWidth={7} strokeLinecap="round" fill="none" />
      <Path d="M32 72 C 26 88, 28 100, 34 108" stroke={SKIN_MED} strokeWidth={7} strokeLinecap="round" fill="none" />
      <Rect x={45} y={52} width={10} height={14} fill={SKIN_MED_SHADE} />
      <Circle cx={50} cy={42} r={12} fill={SKIN_MED} />
      <Path d="M38 40 C 38 28, 62 28, 62 40 C 58 34, 42 34, 38 40 Z" fill="#3a2a1c" />
      <Circle cx={55} cy={42} r={1.3} fill="#1a110b" />
      <Path d="M51 48 q 3 1 6 0" stroke={SKIN_MED_SHADE} strokeWidth={1.2} fill="none" />
    </Svg>
  );
}

/** ハドリアヌス帝: 皇帝として初めてあごひげを生やした。月桂冠、よろいの上に紫のマント */
function HadrianImpl() {
  return (
    <Svg width="100%" height="100%" viewBox="0 0 100 200" preserveAspectRatio="xMidYMax meet">
      <Aura id="haAura" color="#ffe3a0" />
      <Ellipse cx={50} cy={195} rx={30} ry={4} fill="#000" opacity={0.4} />
      <Path d="M40 150 L 38 190 M60 150 L 62 190" stroke={SKIN_MED} strokeWidth={7} strokeLinecap="round" />
      <Path d="M32 190 L 44 190 M56 190 L 68 190" stroke="#8a2a24" strokeWidth={3.5} strokeLinecap="round" />
      {/* よろいとマント */}
      <Path d="M30 66 C 28 100, 28 130, 28 152 L 72 152 C 72 130, 72 100, 70 66 Z" fill="#efe6d2" />
      <Path d="M32 66 L 68 66 L 68 118 L 32 118 Z" fill="#c9a24e" />
      <Path d="M38 80 C 44 86, 56 86, 62 80 M38 96 C 44 102, 56 102, 62 96" stroke="#9a7630" strokeWidth={1.2} fill="none" />
      {[34, 40, 46, 52, 58, 64].map((x) => (
        <Rect key={x} x={x} y={118} width={4} height={16} fill="#a8322a" />
      ))}
      <Path d="M68 64 C 82 70, 84 120, 80 176 L 68 176 C 70 130, 68 96, 64 72 Z" fill="#5b2a5e" />
      <Path d="M30 72 C 24 88, 26 100, 32 108" stroke={SKIN_MED} strokeWidth={7} strokeLinecap="round" fill="none" />
      <Circle cx={66} cy={66} r={3} fill="#c9a24e" />
      <Rect x={45} y={52} width={10} height={14} fill={SKIN_MED_SHADE} />
      <Circle cx={50} cy={42} r={12} fill={SKIN_MED} />
      <Path d="M38 38 C 38 26, 62 26, 62 38 C 58 32, 42 32, 38 38 Z" fill="#3a2a1c" />
      <Path d="M39 44 C 40 58, 60 58, 61 44 C 56 50, 44 50, 39 44 Z" fill="#3a2a1c" />
      <Circle cx={55} cy={41} r={1.3} fill="#1a110b" />
      {/* 月桂冠 */}
      <Path d="M38 33 C 44 28, 56 28, 62 33" stroke="#6f8a3a" strokeWidth={3} strokeDasharray="3 1.5" fill="none" />
    </Svg>
  );
}

export const SocratesFigure = memo(SocratesImpl);
export const PericlesFigure = memo(PericlesImpl);
export const QinOfficialFigure = memo(QinOfficialImpl);
export const ShiHuangdiFigure = memo(ShiHuangdiImpl);
export const RomanEngineerFigure = memo(RomanEngineerImpl);
export const HadrianFigure = memo(HadrianImpl);
