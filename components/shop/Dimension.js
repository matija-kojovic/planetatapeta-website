// Architectural dimension lines: a gold hairline with end ticks and a centred label.

export function DimensionH({ children, className = "" }) {
  return (
    <div className={`dim dim-h ${className}`}>
      <span className="tick" aria-hidden="true" />
      <span className="label">{children}</span>
      <span className="tick" aria-hidden="true" />
    </div>
  );
}

export function DimensionV({ children, className = "" }) {
  return (
    <div className={`dim dim-v ${className}`}>
      <span className="tick" aria-hidden="true" />
      <span className="label">{children}</span>
      <span className="tick" aria-hidden="true" />
    </div>
  );
}

/**
 * A wall drawn as an elevation: content inside a frame with the given
 * proportions, width marked above and height on the right.
 */
export function Elevation({ widthLabel, heightLabel, ratio, children, className = "" }) {
  return (
    <div className={`grid grid-cols-[minmax(0,1fr)_auto] grid-rows-[auto_minmax(0,1fr)] gap-x-3 gap-y-2.5 ${className}`}>
      <DimensionH className="col-start-1 row-start-1">{widthLabel}</DimensionH>
      <div className="relative col-start-1 row-start-2 overflow-hidden bg-board" style={{ aspectRatio: ratio }}>
        {children}
      </div>
      <DimensionV className="col-start-2 row-start-2">{heightLabel}</DimensionV>
    </div>
  );
}
