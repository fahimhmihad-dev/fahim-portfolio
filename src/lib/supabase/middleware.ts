import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return supabaseResponse;
  }

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: Array<{ name: string; value: string; options: CookieOptions }>) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isAdminRoute = pathname.startsWith("/admin");
  const isLoginRoute = pathname === "/admin/login";

  if (isAdminRoute && !isLoginRoute) {
    if (!user?.email) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/admin/login";
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }

    const configuredAdminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const userEmail = user.email.trim().toLowerCase();

    let allowed = false;
    if (configuredAdminEmail && userEmail === configuredAdminEmail) {
      allowed = true;
    } else {
      const { data: adminRow } = await supabase
        .from("admins")
        .select("email")
        .eq("email", userEmail)
        .maybeSingle();
      allowed = Boolean(adminRow);
    }

    if (!allowed) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/admin/login";
      loginUrl.searchParams.set("error", "unauthorized");
      return NextResponse.redirect(loginUrl);
    }
  }

  if (isLoginRoute && user?.email) {
    const userEmail = user.email.trim().toLowerCase();
    const configuredAdminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    let isAllowed = Boolean(configuredAdminEmail && userEmail === configuredAdminEmail);
    if (!isAllowed) {
      const { data: adminRow } = await supabase
        .from("admins")
        .select("email")
        .eq("email", userEmail)
        .maybeSingle();
      isAllowed = Boolean(adminRow);
    }
    if (isAllowed) {
      const dashUrl = request.nextUrl.clone();
      dashUrl.pathname = "/admin";
      dashUrl.search = "";
      return NextResponse.redirect(dashUrl);
    }
  }

  return supabaseResponse;
}
