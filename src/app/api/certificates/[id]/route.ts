import { NextRequest, NextResponse } from 'next/server';
import { renderToBuffer } from '@react-pdf/renderer';
import { createClient } from '@/lib/supabase/server';
import { getAuthUser } from '@/lib/auth';
import CertificateDocument from '@/lib/certificates/CertificateDocument';

// @react-pdf/renderer lee las fuentes y el logo del filesystem (fs), así que
// esta ruta necesita el runtime de Node — no corre en Edge.
export const runtime = 'nodejs';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { user } = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }

  const supabase = await createClient();

  // RLS ya limita esta consulta a: el alumno dueño del certificado, el
  // instructor del taller, o un admin. Si el certificado no existe o el
  // usuario no tiene acceso, esto simplemente no devuelve fila — 404 en
  // ambos casos, para no filtrar si el certificado existe.
  const { data: cert } = await supabase
    .from('certificates')
    .select('id, issued_at, student:users!certificates_user_id_fkey(name), workshop:workshops(title)')
    .eq('id', id)
    .single();

  if (!cert) {
    return NextResponse.json({ error: 'Certificado no encontrado' }, { status: 404 });
  }

  const student = cert.student as unknown as { name: string | null } | null;
  const workshop = cert.workshop as unknown as { title: string } | null;

  const folio = `CERT-${cert.id.slice(0, 8).toUpperCase()}`;
  const fechaEmision = new Date(cert.issued_at).toLocaleDateString('es-MX', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  const pdfBuffer = await renderToBuffer(
    CertificateDocument({
      nombreAlumno: student?.name || 'Alumno',
      nombreTaller: workshop?.title || 'Taller',
      folio,
      fechaEmision,
    })
  );

  return new NextResponse(new Uint8Array(pdfBuffer), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${folio}.pdf"`,
    },
  });
}
