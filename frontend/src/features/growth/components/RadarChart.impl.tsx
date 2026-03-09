/**
 * RadarChart — 순수 SVG 레이더 차트 (6축, 라벨 겹침 없음)
 *
 * 6축:
 *   vocabulary           — 語彙
 *   grammarAccuracy      — 文法
 *   consistency          — 継続性
 *   positivity           — ポジティブ
 *   revisionEffort       — 修正度
 *   verbalizationClarity — 言語化
 *
 * Label 설계 원칙:
 *   - 각 축 방향의 단위 벡터로 라벨을 바깥으로 push
 *   - 상/하 축은 y 방향으로, 좌/우 축은 x + y 방향으로 오프셋
 *   - 배경 pill로 가독성 보장
 */

interface RadarData {
  vocabulary: number;
  grammarAccuracy: number;
  consistency: number;
  positivity: number;
  revisionEffort: number;
  verbalizationClarity: number;
}

interface RadarChartProps {
  data: RadarData;
  size?: number;
}

// 6축 정의 — 순서 = 시계 방향 (12시부터)
const AXES = [
  { key: "vocabulary", ja: "語彙", sub: "Vocab" },
  { key: "grammarAccuracy", ja: "文法", sub: "Grammar" },
  { key: "consistency", ja: "継続性", sub: "Streak" },
  { key: "positivity", ja: "ポジ", sub: "Mood" },
  { key: "revisionEffort", ja: "修正度", sub: "Revision" },
  { key: "verbalizationClarity", ja: "言語化", sub: "Clarity" },
] as const;

const N = AXES.length;
const TWO_PI = Math.PI * 2;

// 극좌표 → 직교 (12시 방향이 0°, 시계 방향)
function polar(
  cx: number,
  cy: number,
  r: number,
  idx: number,
): [number, number] {
  const angle = (TWO_PI * idx) / N - Math.PI / 2;
  return [cx + r * Math.cos(angle), cy + r * Math.sin(angle)];
}

// 축 방향 단위 벡터
function axisDir(idx: number): [number, number] {
  const angle = (TWO_PI * idx) / N - Math.PI / 2;
  return [Math.cos(angle), Math.sin(angle)];
}

function makePolygon(
  cx: number,
  cy: number,
  r: number,
  values: number[],
): string {
  return values
    .map((v, i) => {
      const [x, y] = polar(cx, cy, (v / 100) * r, i);
      return `${x},${y}`;
    })
    .join(" ");
}

// 텍스트 앵커 결정
function textAnchor(idx: number): "start" | "middle" | "end" {
  const [dx] = axisDir(idx);
  if (dx > 0.3) return "start";
  if (dx < -0.3) return "end";
  return "middle";
}

// 수직 정렬 오프셋 (dy)
function verticalOffset(idx: number): number {
  const [, dy] = axisDir(idx);
  if (dy < -0.5) return -6; // top: move up more
  if (dy > 0.5) return 14; // bottom: move down
  return 5; // sides: vertical center
}

const LEVELS = [20, 40, 60, 80, 100];

const C = {
  grid: "#E7E2D9", // warm border-subtle
  axis: "#C7D2FE", // primary-200
  fill: "rgba(99,102,241,0.12)",
  stroke: "#6366F1", // primary-500
  dot: "#4F46E5", // primary-600
  dotStroke: "#FFFDF9", // surface-elevated
  label: "#57534E", // warm stone-600
  labelHigh: "#4338CA", // primary-700
  pillBg: "rgba(255,253,249,0.92)", // surface-elevated
  pillBorder: "rgba(99,102,241,0.18)",
};

export function RadarChart({ data, size = 260 }: RadarChartProps) {
  const cx = size / 2;
  const cy = size / 2;
  const maxR = size * 0.28; // 차트 반경 (여백 확보)
  const labelR = size * 0.4; // 라벨 기준 반경 (SVG 경계 내에 유지)

  const values = AXES.map((a) => data[a.key]);
  const dataPolygon = makePolygon(cx, cy, maxR, values);

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      overflow="visible"
      aria-label="スキルレーダーチャート"
    >
      {/* ── 배경 격자 ── */}
      {LEVELS.map((lvl) => (
        <polygon
          key={lvl}
          points={makePolygon(
            cx,
            cy,
            maxR,
            AXES.map(() => lvl),
          )}
          fill={lvl === 100 ? "rgba(99,102,241,0.03)" : "none"}
          stroke={C.grid}
          strokeWidth={lvl === 100 ? 1.2 : 0.8}
          strokeDasharray={lvl % 40 === 0 ? undefined : "3,3"}
        />
      ))}

      {/* ── 축 선 ── */}
      {AXES.map((_, i) => {
        const [x, y] = polar(cx, cy, maxR, i);
        return (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={x}
            y2={y}
            stroke={C.axis}
            strokeWidth={1}
          />
        );
      })}

      {/* ── 데이터 폴리곤 (glow effect) ── */}
      <polygon
        points={dataPolygon}
        fill={C.fill}
        stroke={C.stroke}
        strokeWidth={2}
        strokeLinejoin="round"
        filter="url(#glow)"
      />

      {/* ── glow filter ── */}
      <defs>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* ── 데이터 점 ── */}
      {values.map((v, i) => {
        const [x, y] = polar(cx, cy, (v / 100) * maxR, i);
        return (
          <circle
            key={i}
            cx={x}
            cy={y}
            r={4}
            fill={C.dot}
            stroke={C.dotStroke}
            strokeWidth={2}
          />
        );
      })}

      {/* ── 라벨 (pill 배경 + 텍스트) ── */}
      {AXES.map((axis, i) => {
        const [dx, dy] = axisDir(i);
        // 기준 위치 = labelR에서 axis 방향으로 push
        const lx = cx + dx * labelR;
        const ly = cy + dy * labelR;
        const val = values[i];
        const anchor = textAnchor(i);
        const vOff = verticalOffset(i);
        const isHigh = val >= 70;

        // Pill 크기
        const pillW = 30;
        const pillH = 26;
        const pillX =
          anchor === "start"
            ? lx - 2
            : anchor === "end"
              ? lx - pillW + 2
              : lx - pillW / 2;
        const pillY = ly + vOff - 17;

        return (
          <g key={i}>
            {/* Pill 배경 */}
            <rect
              x={pillX}
              y={pillY}
              width={pillW}
              height={pillH}
              rx={6}
              fill={C.pillBg}
              stroke={isHigh ? C.stroke : C.pillBorder}
              strokeWidth={isHigh ? 1.2 : 0.8}
              opacity={0.95}
            />
            {/* 축 이름 */}
            <text
              x={lx}
              y={ly + vOff - 5}
              textAnchor={anchor}
              fontSize={9.5}
              fontWeight={600}
              fill={isHigh ? C.labelHigh : C.label}
              letterSpacing="0"
            >
              {axis.ja}
            </text>
            {/* 점수 */}
            <text
              x={lx}
              y={ly + vOff + 7}
              textAnchor={anchor}
              fontSize={9}
              fontWeight={isHigh ? 700 : 400}
              fill={isHigh ? C.stroke : "#94a3b8"}
            >
              {val}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
