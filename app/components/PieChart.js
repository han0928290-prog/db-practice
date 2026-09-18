const SIZE = 176;
const RADIUS = 68;
const STROKE = 26;
const GAP = 2.5;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const CENTER = SIZE / 2;

export default function PieChart({ data, centerLabel, centerValue }) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const slices = data.filter((d) => d.value > 0);

  const arcs = slices.reduce(
    (acc, d) => {
      const rawLen = total > 0 ? (d.value / total) * CIRCUMFERENCE : 0;
      const len = Math.max(rawLen - GAP, 0);
      return {
        cumulative: acc.cumulative + rawLen,
        items: [...acc.items, { ...d, len, offset: -acc.cumulative }],
      };
    },
    { cumulative: 0, items: [] }
  ).items;

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:gap-6">
      <div className="relative shrink-0" style={{ width: SIZE, height: SIZE }}>
        <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
          <circle cx={CENTER} cy={CENTER} r={RADIUS} fill="none" stroke="var(--line)" strokeWidth={STROKE} />
          {arcs.map((a) => (
            <circle
              key={a.label}
              cx={CENTER}
              cy={CENTER}
              r={RADIUS}
              fill="none"
              stroke={a.color}
              strokeWidth={STROKE}
              strokeLinecap="butt"
              strokeDasharray={`${a.len} ${CIRCUMFERENCE - a.len}`}
              strokeDashoffset={a.offset}
              transform={`rotate(-90 ${CENTER} ${CENTER})`}
            />
          ))}
        </svg>
        {(centerLabel || centerValue) && (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            {centerLabel && <span className="text-xs text-muted">{centerLabel}</span>}
            {centerValue && <span className="text-lg font-semibold text-ink">{centerValue}</span>}
          </div>
        )}
      </div>

      <ul className="flex flex-1 flex-col gap-1.5 text-sm">
        {slices.length === 0 && <li className="text-muted">尚無支出資料</li>}
        {slices.map((d) => (
          <li key={d.label} className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2 text-ink-soft">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: d.color }} />
              {d.label}
            </span>
            <span className="text-ink-soft">
              {total > 0 ? Math.round((d.value / total) * 100) : 0}%
              <span className="ml-2 text-muted">${d.value}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
