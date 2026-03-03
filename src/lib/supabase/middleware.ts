import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options as any)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Exact public routes (no auth required)
  const publicRoutes = [
    "/",
    "/login",
    "/signup",
    "/verify-email",
    "/forgot-password",
    "/reset-password",
    "/confirm",
    "/auth/callback",
    "/browse",
    "/wanted",
    "/about",
    "/safety",
    "/contact",
    "/terms",
  ];
  const isExactPublicRoute = publicRoutes.includes(pathname);

  // /listings/[id] is public but NOT /listings/new or /listings/[id]/edit
  const isPublicListingDetail =
    /^\/listings\/[^/]+$/.test(pathname) && pathname !== "/listings/new";

  // /wanted/[id] is public but NOT /wanted/new
  const isPublicWantedDetail =
    /^\/wanted\/[^/]+$/.test(pathname) && pathname !== "/wanted/new";

  const isPublic = isExactPublicRoute || isPublicListingDetail || isPublicWantedDetail;

  // If not authenticated and trying to access a protected route, redirect to login
  if (!user && !isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // If authenticated and trying to access auth pages, redirect to browse
  if (user && ["/login", "/signup", "/forgot-password"].includes(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/browse";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
