type CellType = 'dark' | 'green' | 'light';

const DARK  = '#1B3A2D';
const GREEN = '#3DC45A';
const LIGHT = '#EBF3E8';
const BORDER = '#C8DFC0';

const CELL = 18;
const GAP  = 2;
const STEP = CELL + GAP;
const SYM  = 5 * STEP - GAP; // 98

const GRID: CellType[][] = [
  ['dark',  'dark',  'dark',  'green', 'green'],
  ['dark',  'dark',  'green', 'green', 'light'],
  ['dark',  'green', 'green', 'light', 'light'],
  ['green', 'green', 'light', 'light', 'light'],
  ['green', 'light', 'light', 'light', 'light'],
];

interface Props {
  size?: number;
  variant?: 'light' | 'dark';
  showWordmark?: boolean;
  showTagline?: boolean;
}

export default function CleanPassLogo({
  size = 40,
  variant = 'light',
  showWordmark = true,
  showTagline = false,
}: Props) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: Math.round(size * 0.28) }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${SYM} ${SYM}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0 }}
      >
        {GRID.map((row, ri) =>
          row.map((type, ci) => (
            <rect
              key={`${ri}-${ci}`}
              x={ci * STEP}
              y={ri * STEP}
              width={CELL}
              height={CELL}
              rx={2}
              fill={type === 'dark' ? DARK : type === 'green' ? GREEN : LIGHT}
              stroke={type === 'light' ? BORDER : 'none'}
              strokeWidth={type === 'light' ? 1 : 0}
            />
          ))
        )}
      </svg>

      {showWordmark && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <div
            style={{
              fontFamily: "'Montserrat', sans-serif",
              fontSize: Math.round(size * 0.45),
              lineHeight: 1,
              letterSpacing: '-0.02em',
            }}
          >
            <span style={{ fontWeight: 300, color: variant === 'dark' ? '#FFFFFF' : DARK }}>Clean</span>
            <span style={{ fontWeight: 800, color: GREEN }}>Pass</span>
          </div>

          {showTagline && (
            <div
              style={{
                fontFamily: "'Open Sans', sans-serif",
                fontSize: 11,
                color: '#7A9A84',
                lineHeight: 1.3,
                whiteSpace: 'nowrap',
              }}
            >
              Limpeza e cuidado para usinas solares
            </div>
          )}
        </div>
      )}
    </div>
  );
}
