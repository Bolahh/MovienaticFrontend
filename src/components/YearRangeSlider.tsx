type YearRangeSliderProps = {
  min: number;
  max: number;
  from: number;
  to: number;
  onChange: (from: number, to: number) => void;
};

/**
 * Selector de rango de años con dos tiradores sobre una misma pista.
 * `from` y `to` siempre se mantienen entre `min` y `max`, y no se cruzan.
 */
export function YearRangeSlider({
  min,
  max,
  from,
  to,
  onChange,
}: YearRangeSliderProps) {
  const span = Math.max(1, max - min);
  const fromPct = ((from - min) / span) * 100;
  const toPct = ((to - min) / span) * 100;
  const crossed = fromPct > 50;

  return (
    <div>
      <div className="year-range relative h-9">
        {/* Pista */}
        <div
          aria-hidden="true"
          className="absolute top-1/2 h-1.5 w-full -translate-y-1/2 rounded-full bg-ink/10"
        />
        {/* Tramo seleccionado */}
        <div
          aria-hidden="true"
          className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-accent"
          style={{ left: `${fromPct}%`, width: `${Math.max(0, toPct - fromPct)}%` }}
        />

        {/* Tirador del año inicial */}
        <input
          type="range"
          min={min}
          max={max}
          step={1}
          value={from}
          aria-label="Año inicial"
          onChange={(event) => {
            const next = Math.min(Number(event.target.value), to);
            onChange(next, to);
          }}
          className="absolute inset-0 m-0 h-full w-full"
          style={{ zIndex: crossed ? 30 : 20 }}
        />

        {/* Tirador del año final */}
        <input
          type="range"
          min={min}
          max={max}
          step={1}
          value={to}
          aria-label="Año final"
          onChange={(event) => {
            const next = Math.max(Number(event.target.value), from);
            onChange(from, next);
          }}
          className="absolute inset-0 m-0 h-full w-full"
          style={{ zIndex: 40 }}
        />
      </div>

      <div className="mt-1 flex justify-between text-[11px] tabular-nums text-faint">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}
