import { memo } from 'react';
import Svg, { Circle, Defs, G, LinearGradient, Path, Polygon, RadialGradient, Rect, Stop } from 'react-native-svg';

import { ART_VIEWBOX } from './artSpace';

/**
 * 仮背景: 古王国第4王朝、クフ王治世末のギザ（朝）。
 * - 建設中の大ピラミッド（上部は未完成、日干しれんがの傾斜路、下部は白い化粧石）
 * - 王妃の小ピラミッド 3 基
 * - 遠景にダハシュールのピラミッド（先王スネフェルの代）
 * - 石材を橇で引く労働者、ナイル川と緑の耕地、パピルスの茂み、葦舟
 * カフラー・メンカウラーのピラミッドとスフィンクスは後代のため描かない。
 */

const WORKERS = [
  [292, 252],
  [300, 254],
  [308, 252],
  [316, 254],
];

function Papyrus({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  // 茎の先に扇状の穂がつくパピルス
  const stems = [-14, -7, 0, 6, 12];
  return (
    <G transform={`translate(${x} ${y}) scale(${s})`}>
      {stems.map((dx, i) => {
        const h = 46 + ((i * 7) % 12);
        return (
          <G key={dx}>
            <Path d={`M0 0 Q ${dx * 0.4} ${-h * 0.5} ${dx} ${-h}`} stroke="#3f5a2a" strokeWidth={1.4} fill="none" />
            <Path
              d={`M${dx} ${-h} l -7 -6 M${dx} ${-h} l -3 -9 M${dx} ${-h} l 1 -10 M${dx} ${-h} l 5 -8 M${dx} ${-h} l 8 -4`}
              stroke="#5f7c34"
              strokeWidth={1.2}
            />
          </G>
        );
      })}
    </G>
  );
}

function Palm({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <G transform={`translate(${x} ${y}) scale(${s})`}>
      <Path d="M0 0 C 2 -16, 5 -30, 3 -46" stroke="#4a3622" strokeWidth={3} fill="none" />
      <Path
        d="M3 -46 C -8 -50, -18 -45, -24 -36 M3 -46 C 13 -52, 24 -48, 30 -39 M3 -46 C -2 -57, -12 -61, -20 -59 M3 -46 C 9 -59, 20 -62, 27 -57"
        stroke="#33502a"
        strokeWidth={4}
        strokeLinecap="round"
        fill="none"
      />
    </G>
  );
}

function GizaBackdropImpl({ dim = 0 }: { dim?: number }) {
  const { width: W, height: H } = ART_VIEWBOX;
  return (
    <Svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice">
      <Defs>
        <LinearGradient id="gSky" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#1c2c50" />
          <Stop offset="0.45" stopColor="#5d6c8a" />
          <Stop offset="0.72" stopColor="#d8a46c" />
          <Stop offset="1" stopColor="#f3d6a0" />
        </LinearGradient>
        <RadialGradient id="gSun" cx="0.5" cy="0.5" r="0.5">
          <Stop offset="0" stopColor="#fff2cc" stopOpacity="0.95" />
          <Stop offset="1" stopColor="#ffd890" stopOpacity="0" />
        </RadialGradient>
        <LinearGradient id="gSand" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#d9b27a" />
          <Stop offset="1" stopColor="#a87a48" />
        </LinearGradient>
        <LinearGradient id="gNile" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#6f9aa0" />
          <Stop offset="1" stopColor="#2c4c5a" />
        </LinearGradient>
        <LinearGradient id="gFace" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0" stopColor="#f1e2bf" />
          <Stop offset="1" stopColor="#d9c08e" />
        </LinearGradient>
        <RadialGradient id="gVignette" cx="0.5" cy="0.45" r="0.75">
          <Stop offset="0.55" stopColor="#000" stopOpacity="0" />
          <Stop offset="1" stopColor="#000" stopOpacity="0.6" />
        </RadialGradient>
        <LinearGradient id="gHaze" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#fbe3b4" stopOpacity="0" />
          <Stop offset="1" stopColor="#fbe3b4" stopOpacity="0.45" />
        </LinearGradient>
      </Defs>

      {/* 空と太陽（ラー） */}
      <Rect x={0} y={0} width={W} height={H} fill="url(#gSky)" />
      <Circle cx={320} cy={54} r={70} fill="url(#gSun)" />
      <Circle cx={320} cy={54} r={16} fill="#fff4d6" />

      {/* 遠景: ダハシュールのピラミッド */}
      <G opacity={0.45}>
        <Polygon points="352,196 372,172 392,196" fill="#b98d62" />
        <Polygon points="368,196 380,182 392,196" fill="#a57c55" />
      </G>

      {/* 台地 */}
      <Path d="M0 198 L 130 190 L 400 196 L 400 230 L 0 230 Z" fill="#cfa36c" />

      {/* 建設中の大ピラミッド: 上部は未完成、下部は白い化粧石 */}
      <G>
        <Polygon points="70,206 150,113 186,113 266,206" fill="#c99a62" />
        <Polygon points="168,113 186,113 266,206 168,206" fill="#a87a4a" />
        {/* 未完成の頂部（平らな作業面） */}
        <Rect x={150} y={111} width={36} height={3} fill="#8b6a44" />
        {/* 石積みの段 */}
        {Array.from({ length: 12 }, (_, i) => {
          const y = 118 + i * 7.5;
          const half = ((y - 92) / 114) * 98;
          return <Path key={i} d={`M${168 - half} ${y} L ${168 + half} ${y}`} stroke="#8e6640" strokeWidth={0.6} opacity={0.6} />;
        })}
        {/* 下部の化粧石 */}
        <Polygon points="90,183 246,183 266,206 70,206" fill="url(#gFace)" />
        <Polygon points="168,183 246,183 266,206 168,206" fill="#cdb27e" />
        {/* 日干しれんがの傾斜路と作業員 */}
        <Polygon points="190,206 266,206 186,118 176,118" fill="#9b6e42" opacity={0.9} />
        <Path d="M186 118 L 266 206" stroke="#6e4b2c" strokeWidth={1} />
        {[0.2, 0.42, 0.64].map((t) => (
          <Circle key={t} cx={186 + 80 * t} cy={118 + 88 * t - 3} r={1.4} fill="#3a2716" />
        ))}
        <Rect x={160} y={106} width={2} height={4} fill="#3a2716" />
        <Rect x={172} y={106} width={2} height={4} fill="#3a2716" />
      </G>

      {/* 王妃のピラミッド */}
      <Polygon points="268,206 284,186 300,206" fill="#c99a62" />
      <Polygon points="284,186 300,206 284,206" fill="#a87a4a" />
      <Polygon points="298,206 312,189 326,206" fill="#c99a62" />
      <Polygon points="312,189 326,206 312,206" fill="#a87a4a" />
      <Polygon points="326,206 339,191 352,206" fill="#c99a62" />
      <Polygon points="339,191 352,206 339,206" fill="#a87a4a" />

      <Rect x={0} y={170} width={W} height={50} fill="url(#gHaze)" />

      {/* 砂の地面 */}
      <Rect x={0} y={206} width={W} height={H - 206} fill="url(#gSand)" />

      {/* 石材を橇で引く労働者 */}
      <G>
        <Rect x={326} y={244} width={22} height={13} fill="#e3cfa4" />
        <Rect x={324} y={257} width={28} height={3} fill="#6e4b2c" />
        <Path d="M326 252 L 288 252" stroke="#5a3d22" strokeWidth={0.8} />
        {WORKERS.map(([x, y]) => (
          <G key={x}>
            <Circle cx={x} cy={y - 10} r={2.2} fill="#4a2e1c" />
            <Path d={`M${x - 2} ${y - 8} L ${x + 3} ${y - 8} L ${x + 1} ${y} L ${x - 3} ${y} Z`} fill="#5a3826" />
            <Rect x={x - 3} y={y - 4} width={5} height={3} fill="#efe6d0" />
          </G>
        ))}
      </G>

      {/* ナイル川と耕地 */}
      <Path d="M-4 262 C 60 256, 130 262, 196 282 S 300 322, 404 318 L 404 344 L -4 344 Z" fill="#4f7a3a" />
      <Path d="M-4 276 C 60 270, 120 278, 176 296 S 280 334, 404 334 L 404 344 L -4 344 Z" fill="url(#gNile)" />
      <Path d="M20 290 C 60 287, 100 292, 140 304 M60 312 C 100 312, 150 322, 200 334" stroke="#d6eaea" strokeWidth={1} opacity={0.35} fill="none" />

      {/* 葦舟 */}
      <G transform="translate(214 312)">
        <Path d="M-18 0 Q 0 8 18 0 Q 0 4 -18 0 Z" fill="#c9a25e" />
        <Path d="M0 2 L 0 -22" stroke="#5a3d22" strokeWidth={1} />
        <Path d="M1 -21 L 13 -6 L 1 -4 Z" fill="#efe3c4" />
      </G>

      {/* 椰子とパピルスの茂み */}
      <Palm x={96} y={262} s={0.75} />
      <Palm x={360} y={300} s={0.8} />
      <Papyrus x={18} y={278} s={0.9} />
      <Papyrus x={44} y={284} s={0.7} />

      <Rect x={0} y={0} width={W} height={H} fill="url(#gVignette)" />
      {dim > 0 && <Rect x={0} y={0} width={W} height={H} fill="#05040a" opacity={dim} />}
    </Svg>
  );
}

export const GizaBackdrop = memo(GizaBackdropImpl);
