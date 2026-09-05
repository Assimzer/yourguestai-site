import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Protège toutes les routes /dashboard : redirige vers /login si aucune
// session Supabase valide n'est trouvée. Rafraîchit aussi le cookie de
// session à chaque requête.
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  if (!user && pathname.startsWith("/dashboard")) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    return NextResponse.redirect(redirectUrl);
  }

  // Filet de securite pour /api/* : chaque route verifie deja sa propre
  // session via requireUser(), mais ce garde-fou au niveau middleware evite
  // qu'une future route oublie ce check. Exclut les deux routes publiques
  // par design (webhook Stripe verifie par signature, formulaire de demo).
  const isPublicApiRoute =
    pathname === "/api/stripe/webhook" || pathname === "/api/demo-request";

  if (!user && pathname.startsWith("/api/") && !isPublicApiRoute) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  return response;
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/:path*"],
};
