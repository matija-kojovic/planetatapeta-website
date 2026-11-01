// Line drawings standing in for products that have no photography yet
// (plexiglass prints, printed stickers). Drawn in the dimension-line language,
// so they read as technical sketches rather than decoration.

export function PlexiglassGlyph({ className = "" }) {
  return (
    <svg viewBox="0 0 200 200" className={className} role="img" aria-label="Skica: ploča od pleksiglasa sa distancerima">
      <rect x="40" y="34" width="120" height="132" fill="#fffcf8" stroke="#26352e" strokeWidth="1.5" />
      <rect x="48" y="42" width="104" height="116" fill="none" stroke="#b38b59" strokeWidth="1" strokeDasharray="3 3" />
      {[
        [52, 46],
        [148, 46],
        [52, 154],
        [148, 154],
      ].map(([cx, cy]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="4" fill="#ece6da" stroke="#26352e" strokeWidth="1.5" />
      ))}
      <path d="M40 182h120M40 177v10M160 177v10" stroke="#b38b59" strokeWidth="1" />
      <path d="M176 34v132M171 34h10M171 166h10" stroke="#b38b59" strokeWidth="1" />
    </svg>
  );
}

export function StickerSheetGlyph({ className = "" }) {
  const cells = [];
  for (let row = 0; row < 3; row++) for (let col = 0; col < 3; col++) cells.push([58 + col * 30, 58 + row * 30]);
  return (
    <svg viewBox="0 0 200 200" className={className} role="img" aria-label="Skica: tabak sa nalepnicama">
      <rect x="40" y="40" width="120" height="120" fill="#fffcf8" stroke="#26352e" strokeWidth="1.5" />
      {cells.map(([x, y], i) => (
        <rect key={i} x={x - 1} y={y - 1} width="24" height="24" rx="6" fill={i === 4 ? "#285448" : "none"} stroke="#26352e" strokeWidth="1.25" />
      ))}
      <path d="M57 176h24M57 171v10M81 171v10" stroke="#b38b59" strokeWidth="1" />
    </svg>
  );
}
