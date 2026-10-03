import { memo } from 'react';
import Svg, { Circle, Defs, Ellipse, G, Path, RadialGradient, Rect, Stop } from 'react-native-svg';

/**
 * 仮の人物アート（インダス・殷）。viewBox 100x200、足元を下端に揃える。
 */

const SKIN_INDUS = '#8a5a3a';
const SKIN_INDUS_SHADE = '#6c4429';
const SKIN_CHINA = '#c49a6c';
const SKIN_CHINA_SHADE = '#a57c50';

/** インダスの商人: 白い布をまとい、紅玉髄（カーネリアン）のビーズと、動物を刻んだ印章を持つ */
function IndusMerchantImpl() {
  return (
    <Svg width="100%" height="100%" viewBox="0 0 100 200" preserveAspectRatio="xMidYMax meet">
      <Ellipse cx={50} cy={195} rx={28} ry={4} fill="#000" opacity={0.35} />
      <Path d="M40 150 L 38 192 M60 150 L 62 192" stroke={SKIN_INDUS} strokeWidth={7} strokeLinecap="round" />
      {/* 腰布 */}
      <Path d="M32 112 L 68 112 L 72 156 L 28 156 Z" fill="#ece3cf" />
      <Path d="M50 112 L 50 156" stroke="#cfc4aa" strokeWidth={1} />
      {/* 上半身と肩掛け */}
      <Path d="M33 66 C 31 84, 32 100, 33 114 L 67 114 C 68 100, 69 84, 67 66 Z" fill={SKIN_INDUS} />
      <Path d="M33 66 L 60 66 L 30 112 Z" fill="#d9cdb0" />
      {/* ビーズの首飾り */}
      <Path d="M38 68 C 42 78, 58 78, 62 68" stroke="#c0502e" strokeWidth={3} strokeDasharray="2 1.5" fill="none" />
      {/* 腕と印章 */}
      <Path d="M66 70 C 74 82, 74 92, 66 98" stroke={SKIN_INDUS} strokeWidth={7} strokeLinecap="round" fill="none" />
      <Rect x={58} y={92} width={13} height={13} rx={1.5} fill="#e7dcc4" stroke="#8c7c5c" strokeWidth={0.8} />
      <Path d="M61 101 C 63 97, 67 97, 69 100 M66 97 l 2 -3" stroke="#6b5a3c" strokeWidth={0.8} fill="none" />
      <Path d="M34 70 C 28 86, 30 100, 34 108" stroke={SKIN_INDUS} strokeWidth={7} strokeLinecap="round" fill="none" />
      {/* 頭・はちまき・ひげ */}
      <Rect x={45} y={52} width={10} height={14} fill={SKIN_INDUS_SHADE} />
      <Circle cx={50} cy={42} r={12} fill={SKIN_INDUS} />
      <Path d="M38 38 C 38 26, 62 26, 62 38 Z" fill="#1d1612" />
      <Path d="M38 37 H 62" stroke="#c9b48a" strokeWidth={2} />
      <Path d="M41 46 C 42 56, 58 56, 59 46 C 56 50, 44 50, 41 46 Z" fill="#1d1612" />
      <Circle cx={55} cy={42} r={1.2} fill="#120c08" />
    </Svg>
  );
}

/** 「神官王」の像にならった人物: 三つ葉もようの衣を左肩にかけ、額に円い飾りのついた鉢巻き、口ひげをそったあごひげ */
function PriestKingImpl() {
  const trefoils = [
    [36, 78],
    [48, 84],
    [40, 96],
    [54, 100],
    [34, 116],
    [46, 124],
    [58, 118],
    [40, 140],
    [54, 146],
    [36, 162],
    [50, 170],
    [62, 160],
  ];
  return (
    <Svg width="100%" height="100%" viewBox="0 0 100 200" preserveAspectRatio="xMidYMax meet">
      <Defs>
        <RadialGradient id="pkAura" cx="0.5" cy="0.4" r="0.5">
          <Stop offset="0" stopColor="#ffe3b0" stopOpacity="0.45" />
          <Stop offset="1" stopColor="#ffe3b0" stopOpacity="0" />
        </RadialGradient>
      </Defs>
      <Ellipse cx={50} cy={80} rx={50} ry={80} fill="url(#pkAura)" />
      <Ellipse cx={50} cy={195} rx={30} ry={4} fill="#000" opacity={0.4} />
      {/* 衣（左肩にかけ、右肩は出す） */}
      <Path d="M28 66 C 24 110, 22 150, 22 192 L 78 192 C 76 150, 74 110, 70 66 Z" fill="#e2d6bd" />
      <Path d="M62 66 L 72 66 C 76 110, 76 150, 78 192 L 66 192 C 66 150, 64 110, 60 80 Z" fill="#000" opacity={0.08} />
      {/* 右肩と腕（出ている） */}
      <Path d="M66 66 C 76 70, 78 86, 74 104" stroke={SKIN_INDUS} strokeWidth={8} strokeLinecap="round" fill="none" />
      <Rect x={70} y={78} width={9} height={4} rx={2} fill="#c9a24e" />
      <Path d="M58 64 L 70 66 L 66 80 Z" fill={SKIN_INDUS} />
      {/* 三つ葉もよう（赤い顔料が詰められていた） */}
      <G>
        {trefoils.map(([x, y]) => (
          <G key={`${x}-${y}`}>
            <Circle cx={x - 2} cy={y} r={2.4} fill="#b4452e" />
            <Circle cx={x + 2} cy={y} r={2.4} fill="#b4452e" />
            <Circle cx={x} cy={y - 3.2} r={2.4} fill="#b4452e" />
          </G>
        ))}
      </G>
      {/* 頭・額飾り・ひげ（口ひげはそっている） */}
      <Rect x={45} y={52} width={10} height={14} fill={SKIN_INDUS_SHADE} />
      <Circle cx={50} cy={40} r={13} fill={SKIN_INDUS} />
      <Path d="M37 36 C 37 24, 63 24, 63 36 Z" fill="#241a12" />
      <Path d="M37 34 H 63" stroke="#d9c08a" strokeWidth={2.2} />
      <Circle cx={50} cy={34} r={3} fill="#e8d6a4" stroke="#a88a4a" strokeWidth={0.6} />
      <Path d="M52 42 q 4 1 7 0" stroke="#1a110b" strokeWidth={1.2} strokeLinecap="round" fill="none" />
      <Path d="M40 47 C 41 60, 59 60, 60 47 L 58 50 C 54 52, 46 52, 42 50 Z" fill="#241a12" />
      {[49, 52, 55].map((y) => (
        <Path key={y} d={`M43 ${y} H 57`} stroke="#3b2c20" strokeWidth={0.7} />
      ))}
    </Svg>
  );
}

/** 殷の占い師: 黒褐色の衣にふちどり、髪をまげに結い、亀の甲羅（腹甲）を持つ */
function DivinerImpl() {
  return (
    <Svg width="100%" height="100%" viewBox="0 0 100 200" preserveAspectRatio="xMidYMax meet">
      <Ellipse cx={50} cy={195} rx={28} ry={4} fill="#000" opacity={0.35} />
      <Path d="M30 68 C 26 110, 24 150, 24 192 L 76 192 C 76 150, 74 110, 70 68 Z" fill="#3a2b22" />
      <Path d="M24 186 H 76" stroke="#b08a4a" strokeWidth={3} />
      <Path d="M50 68 L 50 192" stroke="#b08a4a" strokeWidth={2} />
      <Rect x={30} y={112} width={40} height={5} fill="#6b4a2a" />
      {/* 腕と甲羅 */}
      <Path d="M32 74 C 26 92, 30 104, 40 110" stroke="#3a2b22" strokeWidth={10} strokeLinecap="round" fill="none" />
      <Path d="M68 74 C 74 92, 70 104, 60 110" stroke="#3a2b22" strokeWidth={10} strokeLinecap="round" fill="none" />
      <Ellipse cx={50} cy={108} rx={15} ry={19} fill="#e3d2a8" stroke="#a88d5a" strokeWidth={1} />
      <Path d="M50 90 V 126 M37 100 H 63 M38 116 H 62" stroke="#b39a68" strokeWidth={0.8} />
      <Path d="M44 98 l 3 4 l -2 3 M56 112 l -3 3 l 2 4" stroke="#4a3220" strokeWidth={0.9} fill="none" />
      <Circle cx={40} cy={112} r={2.5} fill={SKIN_CHINA} />
      <Circle cx={60} cy={112} r={2.5} fill={SKIN_CHINA} />
      {/* 頭 */}
      <Rect x={45} y={54} width={10} height={14} fill={SKIN_CHINA_SHADE} />
      <Circle cx={50} cy={44} r={12} fill={SKIN_CHINA} />
      <Path d="M38 42 C 38 30, 62 30, 62 42 L 62 38 C 56 34, 44 34, 38 38 Z" fill="#14100c" />
      <Ellipse cx={50} cy={29} rx={6} ry={5} fill="#14100c" />
      <Path d="M42 28 L 60 32" stroke="#c9b48a" strokeWidth={1.4} />
      <Path d="M52 45 q 4 1 6 0" stroke="#1a110b" strokeWidth={1.2} strokeLinecap="round" fill="none" />
    </Svg>
  );
}

/** 殷王・武丁: 高い冠、雷文（らいもん）のふちどりの赤褐色の衣、王の力を示す青銅の鉞（まさかり） */
function WuDingImpl() {
  return (
    <Svg width="100%" height="100%" viewBox="0 0 100 200" preserveAspectRatio="xMidYMax meet">
      <Defs>
        <RadialGradient id="wdAura" cx="0.5" cy="0.4" r="0.5">
          <Stop offset="0" stopColor="#ffd9a0" stopOpacity="0.45" />
          <Stop offset="1" stopColor="#ffd9a0" stopOpacity="0" />
        </RadialGradient>
      </Defs>
      <Ellipse cx={50} cy={80} rx={50} ry={80} fill="url(#wdAura)" />
      <Ellipse cx={50} cy={195} rx={32} ry={4} fill="#000" opacity={0.4} />
      {/* 青銅の鉞 */}
      <Path d="M84 58 L 84 194" stroke="#6b4a2a" strokeWidth={2.6} />
      <Path d="M84 64 C 96 62, 98 80, 96 92 L 84 86 Z" fill="#5f7f6a" stroke="#3f5a48" strokeWidth={0.8} />
      <Circle cx={90} cy={76} r={2.2} fill="#3f5a48" />
      {/* 衣 */}
      <Path d="M28 66 C 24 110, 22 150, 20 192 L 80 192 C 78 150, 76 110, 72 66 Z" fill="#7a2f22" />
      <Path d="M20 184 H 80" stroke="#c9a24e" strokeWidth={6} />
      <Path d="M22 184 h 6 v -4 h -3 v 4 M34 184 h 6 v -4 h -3 v 4 M46 184 h 6 v -4 h -3 v 4 M58 184 h 6 v -4 h -3 v 4 M70 184 h 6 v -4 h -3 v 4" stroke="#7a2f22" strokeWidth={1} fill="none" />
      <Path d="M36 66 L 50 100 L 64 66" stroke="#c9a24e" strokeWidth={3} fill="none" />
      <Rect x={28} y={110} width={44} height={6} fill="#c9a24e" />
      <Path d="M68 72 C 78 76, 82 72, 84 80" stroke="#7a2f22" strokeWidth={9} strokeLinecap="round" fill="none" />
      <Circle cx={84} cy={81} r={3} fill={SKIN_CHINA} />
      {/* 頭・高い冠・ひげ */}
      <Rect x={45} y={52} width={10} height={14} fill={SKIN_CHINA_SHADE} />
      <Circle cx={50} cy={42} r={12} fill={SKIN_CHINA} />
      <Path d="M38 38 C 38 30, 62 30, 62 38 Z" fill="#14100c" />
      <Path d="M40 32 L 42 12 L 58 12 L 60 32 Z" fill="#2a2420" />
      <Path d="M42 18 H 58 M41 25 H 59" stroke="#c9a24e" strokeWidth={1.4} />
      <Circle cx={50} cy={21} r={2.2} fill="#c9a24e" />
      <Path d="M52 43 q 4 1 6 0" stroke="#1a110b" strokeWidth={1.2} strokeLinecap="round" fill="none" />
      <Path d="M42 48 C 44 60, 56 60, 58 48 C 55 52, 45 52, 42 48 Z" fill="#14100c" />
      <Path d="M46 49 C 48 51, 52 51, 54 49" stroke="#14100c" strokeWidth={1.4} fill="none" />
    </Svg>
  );
}

export const IndusMerchantFigure = memo(IndusMerchantImpl);
export const PriestKingFigure = memo(PriestKingImpl);
export const DivinerFigure = memo(DivinerImpl);
export const WuDingFigure = memo(WuDingImpl);
