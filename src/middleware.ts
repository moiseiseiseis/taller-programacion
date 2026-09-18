import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(req: NextRequest) {
  let res = NextResponse.next()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            req.cookies.set(name, value)
            res.cookies.set({ name, value, ...options })
          })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const path = req.nextUrl.pathname

  // Red de seguridad: si el redirect_to de Supabase no matchea contra la lista
  // de Redirect URLs configurada en el dashboard, cae al Site URL (la raíz)
  // pero igual le pega el ?code= ahí. Lo reenviamos a nuestro callback real.
  if (path === '/' && req.nextUrl.searchParams.has('code')) {
    const callbackUrl = new URL('/auth/callback', req.url)
    callbackUrl.search = req.nextUrl.search
    return NextResponse.redirect(callbackUrl)
  }

  // Solo el chequeo optimista (¿hay sesión?) va aquí. El rol requiere una
  // consulta a Postgres, y el middleware corre en TODAS las rutas —incluidos
  // los prefetches de <Link>—, así que esa consulta se movió a
  // dashboard/layout.tsx y a los layouts de instructor/admin, donde corre
  // una sola vez por request (memoizada con React cache) en vez de en cada
  // ruta y prefetch.
  if (path.startsWith('/dashboard') && !user) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  return res
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}