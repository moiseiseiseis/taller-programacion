export default function Spinner({
  size = 20,
  className = 'border-current/25 border-t-current',
}: {
  size?: number;
  className?: string;
}) {
  return (
    <span
      role="status"
      aria-label="Cargando"
      className={`inline-block rounded-full border-2 animate-spin ${className}`}
      style={{ width: size, height: size }}
    />
  );
}
