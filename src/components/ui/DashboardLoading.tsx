import Spinner from './Spinner';

// Fallback de los loading.tsx del dashboard: Next lo muestra automáticamente
// (envuelto en Suspense) mientras el page.tsx del segmento hace sus awaits
// a Supabase, en vez de dejar la pantalla en blanco durante la navegación.
export default function DashboardLoading({ label = 'cargando' }: { label?: string }) {
  return (
    <div className="flex items-center justify-center min-h-[60vh] px-4">
      <div className="flex flex-col items-center gap-4 text-center">
        <Spinner size={32} className="border-brand-mint/20 border-t-brand-mint" />
        <p className="font-mono text-sm text-[#9c9c94]">
          <span className="text-brand-mint">$</span> {label}
          <span className="animate-blink">_</span>
        </p>
      </div>
    </div>
  );
}
