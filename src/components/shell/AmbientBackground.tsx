/** Живий фон: три розмиті «плями» у кольорах теми + легке зерно. */
export function AmbientBackground() {
  return (
    <div className="ambient" aria-hidden>
      <div className="blob b1" />
      <div className="blob b2" />
      <div className="blob b3" />
      <div className="grain" />
    </div>
  );
}
