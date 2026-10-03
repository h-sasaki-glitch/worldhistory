import { memo } from 'react';
import Svg, { Circle, Defs, G, LinearGradient, Path, Polygon, RadialGradient, Rect, Stop } from 'react-native-svg';

import { ART_VIEWBOX } from './artSpace';

/**
 * 仮背景: ペリクレスの時代のアテネ（c. 440 BCE）。
 * - アクロポリスの丘と、建設中のパルテノン神殿（足場・まだ屋根のない部分）
 * - 丘のふもとの家並みとアゴラ（広場）のオリーブの木
 * - 右奥にエーゲ海（サロニコス湾）と帆船
 */

function Column({ x, y, h }: { x: number; y: number; h: number }) {
  return (
    <G>
      <Rect x={x} y={y} width={4} height={h} fill="#f1ead9" />
      <Rect x={x + 2.6} y={y} width={1.4} height={h} fill="#d9cfb8" />
      <Rect x={x - 1} y={y - 2} width={6} height={2} fill="#e6dcc6" />
    </G>
  );
}

function AthensBackdropImpl({ dim = 0, viewBox }: { dim?: number; viewBox?: string }) {
  const { width: W, height: H } = ART_VIEWBOX;
  return (
    <Svg width="100%" height="100%" viewBox={viewBox ?? `0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice">
      <Defs>
        <LinearGradient id="aSky" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#2f5d93" />
          <Stop offset="0.6" stopColor="#8fb6d6" />
          <Stop offset="1" stopColor="#e9e3cf" />
        </LinearGradient>
        <RadialGradient id="aSun" cx="0.5" cy="0.5" r="0.5">
          <Stop offset="0" stopColor="#fffbe8" stopOpacity="0.9" />
          <Stop offset="1" stopColor="#fff6d6" stopOpacity="0" />
        </RadialGradient>
        <LinearGradient id="aSea" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#4f8fb8" />
          <Stop offset="1" stopColor="#2c6390" />
        </LinearGradient>
        <LinearGradient id="aHill" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#c9b48c" />
          <Stop offset="1" stopColor="#9c8460" />
        </LinearGradient>
        <RadialGradient id="aVignette" cx="0.5" cy="0.45" r="0.75">
          <Stop offset="0.55" stopColor="#000" stopOpacity="0" />
          <Stop offset="1" stopColor="#000" stopOpacity="0.55" />
        </RadialGradient>
      </Defs>

      <Rect x={0} y={0} width={W} height={H} fill="url(#aSky)" />
      <Circle cx={320} cy={50} r={60} fill="url(#aSun)" />
      <Circle cx={320} cy={50} r={13} fill="#fffdf2" />

      {/* 遠景: 山並みとエーゲ海 */}
      <Path d="M-4 176 C 40 150, 90 160, 130 170 L 130 200 L -4 200 Z" fill="#8b9a8e" opacity={0.6} />
      <Rect x={250} y={190} width={154} height={34} fill="url(#aSea)" />
      <Path d="M262 200 h 30 M300 208 h 40 M350 198 h 30 M320 216 h 50" stroke="#d6ecf5" strokeWidth={1} opacity={0.5} />
      <G transform="translate(352 196)">
        <Path d="M-8 0 Q 0 4 8 0 Z" fill="#5a3d22" />
        <Path d="M0 0 L 0 -12" stroke="#3a2a1c" strokeWidth={0.8} />
        <Path d="M0.5 -11 L 7 -3 L 0.5 -2 Z" fill="#f4eee0" />
      </G>

      {/* アクロポリスの丘 */}
      <Path d="M60 224 C 80 170, 110 150, 140 146 L 250 142 C 275 146, 292 168, 308 224 Z" fill="url(#aHill)" />
      <Path d="M140 146 L 250 142 L 250 150 L 140 154 Z" fill="#d8c59c" />
      {/* 建設中のパルテノン神殿 */}
      <G>
        <Rect x={146} y={136} width={96} height={6} fill="#e6dcc6" />
        <Rect x={150} y={132} width={88} height={4} fill="#efe6d2" />
        {Array.from({ length: 11 }, (_, i) => (
          <Column key={i} x={152 + i * 8} y={104} h={28} />
        ))}
        <Rect x={150} y={98} width={58} height={6} fill="#e6dcc6" />
        <Polygon points="150,98 179,86 208,98" fill="#efe6d2" />
        {/* 足場と、まだ屋根のない部分 */}
        <Path d="M212 98 L 240 98 M214 90 L 214 132 M226 90 L 226 132 M238 90 L 238 132 M212 108 L 240 108 M212 120 L 240 120" stroke="#7a5a36" strokeWidth={1} />
        <Path d="M232 90 L 232 70 M232 72 L 248 76" stroke="#5a3d22" strokeWidth={1.2} />
      </G>

      {/* ふもとの家並み */}
      <Rect x={0} y={218} width={W} height={H - 218} fill="#c7b08a" />
      {[
        [8, 222, 40, 26],
        [46, 228, 34, 22],
        [300, 224, 40, 24],
        [338, 220, 54, 30],
      ].map(([x, y, w, h]) => (
        <G key={x}>
          <Rect x={x} y={y} width={w} height={h} fill="#efe6d4" />
          <Polygon points={`${x - 2},${y} ${x + w / 2},${y - 8} ${x + w + 2},${y}`} fill="#b5603e" />
          <Rect x={x + w * 0.4} y={y + h - 10} width={6} height={10} fill="#5a3d22" />
        </G>
      ))}
      {/* アゴラ（広場）とオリーブ */}
      <Rect x={0} y={250} width={W} height={H - 250} fill="#bea57c" />
      {[110, 268].map((x) => (
        <G key={x}>
          <Path d={`M${x} 290 C ${x - 2} 278, ${x + 3} 270, ${x} 262`} stroke="#5a4630" strokeWidth={3} fill="none" />
          <Circle cx={x - 8} cy={258} r={11} fill="#7d8a5a" />
          <Circle cx={x + 7} cy={256} r={12} fill="#6f7d4e" />
          <Circle cx={x} cy={248} r={10} fill="#879463" />
        </G>
      ))}
      <Path d="M150 340 L 175 260 L 225 260 L 250 340 Z" fill="#cdb68e" />

      <Rect x={0} y={0} width={W} height={H} fill="url(#aVignette)" />
      {dim > 0 && <Rect x={0} y={0} width={W} height={H} fill="#05040a" opacity={dim} />}
    </Svg>
  );
}

export const AthensBackdrop = memo(AthensBackdropImpl);
