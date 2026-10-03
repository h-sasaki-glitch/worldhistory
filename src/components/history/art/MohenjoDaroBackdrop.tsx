import { memo } from 'react';
import Svg, { Circle, Defs, Ellipse, G, LinearGradient, Path, Polygon, RadialGradient, Rect, Stop } from 'react-native-svg';

import { ART_VIEWBOX } from './artSpace';

/**
 * 仮背景: 最盛期のモヘンジョ・ダロ（c. 2300 BCE）。
 * - 高台（城塞）の上の大浴場（れんがの柱廊に囲まれた水浴び場）
 * - 焼きれんがの 2 階建ての家並み（通りに面した窓は少ない）
 * - 手前の直線の大通りと、れんがのふたでおおわれた下水道・点検口
 * - 遠景にインダス川と帆舟、牛車
 * 現在の遺跡にある仏塔は 2 世紀ごろの後代の建造物のため描かない。
 */

const BRICK = '#a5583a';
const BRICK_DARK = '#7e4029';
const BRICK_LIGHT = '#bd6c48';

function House({ x, y, w, h, shade = 0 }: { x: number; y: number; w: number; h: number; shade?: number }) {
  return (
    <G>
      <Rect x={x} y={y} width={w} height={h} fill={shade ? BRICK_DARK : BRICK} />
      <Rect x={x - 1} y={y - 3} width={w + 2} height={3} fill={BRICK_LIGHT} />
      {Array.from({ length: Math.floor(h / 6) }, (_, i) => (
        <Path key={i} d={`M${x} ${y + 5 + i * 6} H ${x + w}`} stroke="#6a3322" strokeWidth={0.4} opacity={0.5} />
      ))}
      <Rect x={x + w * 0.4} y={y + h - 11} width={6} height={11} fill="#3b1d12" />
    </G>
  );
}

function MohenjoDaroBackdropImpl({ dim = 0, viewBox }: { dim?: number; viewBox?: string }) {
  const { width: W, height: H } = ART_VIEWBOX;
  return (
    <Svg width="100%" height="100%" viewBox={viewBox ?? `0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice">
      <Defs>
        <LinearGradient id="mSky" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#5f7fa6" />
          <Stop offset="0.5" stopColor="#b9c7c6" />
          <Stop offset="1" stopColor="#ead9b4" />
        </LinearGradient>
        <RadialGradient id="mSun" cx="0.5" cy="0.5" r="0.5">
          <Stop offset="0" stopColor="#fff6dc" stopOpacity="0.9" />
          <Stop offset="1" stopColor="#fff0c8" stopOpacity="0" />
        </RadialGradient>
        <LinearGradient id="mGround" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#c99a6a" />
          <Stop offset="1" stopColor="#8e5d3a" />
        </LinearGradient>
        <LinearGradient id="mRiver" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0" stopColor="#7d9fa6" />
          <Stop offset="1" stopColor="#a9bfbb" />
        </LinearGradient>
        <RadialGradient id="mVignette" cx="0.5" cy="0.45" r="0.75">
          <Stop offset="0.55" stopColor="#000" stopOpacity="0" />
          <Stop offset="1" stopColor="#000" stopOpacity="0.6" />
        </RadialGradient>
      </Defs>

      <Rect x={0} y={0} width={W} height={H} fill="url(#mSky)" />
      <Circle cx={300} cy={46} r={60} fill="url(#mSun)" />
      <Circle cx={300} cy={46} r={13} fill="#fff7e2" />

      {/* 遠景: キルタール山地とインダス川 */}
      <Path d="M210 176 L 250 160 L 285 170 L 320 154 L 360 168 L 404 158 L 404 180 L 210 180 Z" fill="#9aa3a4" opacity={0.55} />
      <Rect x={0} y={176} width={W} height={10} fill="#d9c49c" />
      <Path d="M-4 166 C 40 160, 90 168, 140 172 L 140 182 C 90 178, 40 176, -4 180 Z" fill="url(#mRiver)" />
      <G transform="translate(52 167)">
        <Path d="M-8 0 Q 0 4 8 0 Z" fill="#6b4a2e" />
        <Path d="M0 0 L 0 -12" stroke="#4a321e" strokeWidth={0.8} />
        <Path d="M0.5 -11 L 7 -3 L 0.5 -2 Z" fill="#efe6cf" />
      </G>

      {/* 高台（城塞）と大浴場 */}
      <Path d="M150 186 L 170 150 L 372 146 L 396 186 Z" fill="#b07a52" />
      <Path d="M170 150 L 372 146 L 372 152 L 172 156 Z" fill="#c48d60" />
      <G>
        <Rect x={200} y={118} width={130} height={32} fill={BRICK} />
        <Rect x={198} y={114} width={134} height={5} fill={BRICK_LIGHT} />
        {Array.from({ length: 11 }, (_, i) => (
          <Rect key={i} x={204 + i * 12} y={122} width={5} height={28} fill={BRICK_DARK} />
        ))}
        {/* 中庭の水浴び場（上からのぞく形） */}
        <Rect x={238} y={130} width={54} height={14} fill="#4d7e8a" />
        <Path d="M238 130 h 54" stroke="#c9e2e2" strokeWidth={1} opacity={0.6} />
        <Path d="M240 144 l 4 -3 h 6 l 4 -3" stroke="#e0b88f" strokeWidth={1} fill="none" />
      </G>
      <Rect x={346} y={128} width={18} height={20} fill={BRICK_DARK} />

      {/* 下町の家並み（左右） */}
      <House x={0} y={190} w={42} h={46} />
      <House x={40} y={198} w={36} h={38} shade={1} />
      <House x={74} y={186} w={44} h={50} />
      <House x={300} y={194} w={40} h={42} shade={1} />
      <House x={338} y={186} w={62} h={50} />

      {/* 地面と大通り（遠近） */}
      <Rect x={0} y={232} width={W} height={H - 232} fill="url(#mGround)" />
      <Polygon points="168,232 232,232 300,344 100,344" fill="#b9875a" />
      {/* 通りの両側の家（手前） */}
      <Polygon points="0,214 140,226 168,232 100,344 0,344" fill={BRICK} />
      <Polygon points="0,214 140,226 140,232 0,226" fill={BRICK_LIGHT} />
      <Polygon points="400,214 260,226 232,232 300,344 400,344" fill={BRICK_DARK} />
      <Polygon points="400,214 260,226 260,232 400,226" fill={BRICK} />
      {Array.from({ length: 9 }, (_, i) => (
        <Path key={`l${i}`} d={`M0 ${236 + i * 12} L ${150 - i * 6} ${240 + i * 12}`} stroke="#6a3322" strokeWidth={0.5} opacity={0.45} />
      ))}
      <Rect x={60} y={262} width={12} height={22} fill="#3b1d12" />
      <Rect x={316} y={258} width={11} height={22} fill="#2c150d" />

      {/* れんがのふたでおおわれた下水道と点検口 */}
      <Polygon points="214,232 222,232 268,344 246,344" fill="#8a4f33" />
      {Array.from({ length: 10 }, (_, i) => {
        const t = i / 10;
        const y = 236 + t * 104;
        const xl = 214 + t * 32;
        const xr = 222 + t * 46;
        return <Path key={`d${i}`} d={`M${xl} ${y} L ${xr} ${y}`} stroke="#5e321f" strokeWidth={0.8} />;
      })}
      <Ellipse cx={244} cy={300} rx={7} ry={3} fill="#2a150c" />

      {/* 牛車 */}
      <G transform="translate(150 250)">
        <Rect x={-10} y={-8} width={20} height={6} fill="#6b4a2e" />
        <Circle cx={-6} cy={0} r={4} fill="#4a321e" />
        <Circle cx={6} cy={0} r={4} fill="#4a321e" />
        <Ellipse cx={-22} cy={-4} rx={8} ry={4} fill="#d9d0bc" />
        <Circle cx={-30} cy={-7} r={2.6} fill="#d9d0bc" />
      </G>

      <Rect x={0} y={0} width={W} height={H} fill="url(#mVignette)" />
      {dim > 0 && <Rect x={0} y={0} width={W} height={H} fill="#05040a" opacity={dim} />}
    </Svg>
  );
}

export const MohenjoDaroBackdrop = memo(MohenjoDaroBackdropImpl);
