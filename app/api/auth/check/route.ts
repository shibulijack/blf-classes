import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const { apartment } = await request.json();

  if (!apartment || typeof apartment !== "string") {
    return NextResponse.json({ error: "Apartment number required" }, { status: 400 });
  }

  const supabase = getSupabase();
  const { data } = await supabase
    .from("residents")
    .select("id, display_name")
    .eq("apartment", apartment.toUpperCase().trim())
    .order("created_at", { ascending: true });

  const profiles = data || [];

  return NextResponse.json({
    exists: profiles.length > 0,
    profiles: profiles.map((p) => ({ id: p.id, name: p.display_name })),
  });
}
