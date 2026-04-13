import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getSupabase } from "@/lib/supabase/server";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const supabase = getSupabase();
  const { data } = await supabase
    .from("residents")
    .select("apartment, display_name, is_admin")
    .eq("id", session.residentId)
    .single();

  if (!data) {
    return NextResponse.json({ error: "Resident not found" }, { status: 404 });
  }

  return NextResponse.json(data);
}
