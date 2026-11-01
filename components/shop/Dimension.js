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
 * An elevation that always occupies the same frame (5:4, like the full-design view):
 * the wall is scaled to fit inside it, so a tall or wide size never grows the page.
 */
export function FittedElevation({ ratio, className = "", ...props }) {
  return (
    <div className={`elevation-frame ${className}`} style={{ "--ratio": ratio }}>
      <Elevation {...props} ratio={ratio} className="elevation-fit" />
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
