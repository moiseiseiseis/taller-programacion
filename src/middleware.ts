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

  if (path.startsWith('/dashboard')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', req.url))
    }

    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    const role = userData?.role || 'student'

    if (path === '/dashboard') {
      return NextResponse.redirect(new URL(`/dashboard/${role}`, req.url))
    }

    if ((path.startsWith('/dashboard/instructor') || path.startsWith('/dashboard/admin')) && role === 'student') {
      return NextResponse.redirect(new URL('/dashboard/student', req.url))
    }

    if (path.startsWith('/dashboard/admin') && role !== 'admin') {
      return NextResponse.redirect(new URL(`/dashboard/${role}`, req.url))
    }
  }

  return res
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}