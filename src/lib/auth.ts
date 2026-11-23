import { NextResponse } from "next/server";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";

export interface AdminContext {
  userId: string;
  email: string;
  supabase: Awaited<ReturnType<typeof createClient>>;
  serviceClient: ReturnType<typeof createServiceRoleClient>;
}

/**
 * Verifies the current request comes from an authenticated user whose email
 * is listed in `public.admins` (and matches ADMIN_EMAIL if configured).
 */
export async function verifyAdmin(): Promise<AdminContext | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user?.email) {
      return null;
    }

    const email = user.email.trim().toLowerCase();
    const envAdmin = process.env.ADMIN_EMAIL?.trim().toLowerCase();

    // Always verify against the database admins table (using user JWT or service role)
    const { data: adminRow } = await supabase
      .from("admins")
      .select("email")
      .eq("email", email)
      .maybeSingle();

    const isAllowed = Boolean(adminRow) || (Boolean(envAdmin) && email === envAdmin);
    if (!isAllowed) {
      return null;
    }

    return {
      userId: user.id,
      email,
      supabase,
      serviceClient: createServiceRoleClient(),
    };
  } catch {
    return null;
  }
}

export function unauthorizedResponse(message = "Unauthorized — admin access required.") {
  return NextResponse.json({ error: message }, { status: 401 });
}
