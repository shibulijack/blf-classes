import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getSupabase } from "@/lib/supabase/server";
import { createSessionToken, setSessionCookie } from "@/lib/auth/session";
import { checkRateLimit, resetRateLimit } from "@/lib/auth/rate-limit";

export async function POST(request: NextRequest) {
  const { residentId, apartment, pin } = await request.json();

  if (!residentId || !apartment || !pin) {
    return NextResponse.json({ error: "All fields required" }, { status: 400 });
  }

  const apt = apartment.toUpperCase().trim();

  const { allowed, remaining } = checkRateLimit(apt);
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many attempts. Try again in 15 minutes." },
      { status: 429 }
    );
  }

  const supabase = getSupabase();
  const { data: resident } = await supabase
    .from("residents")
    .select("id, apartment, pin_hash, is_admin")
    .eq("id", residentId)
    .eq("apartment", apt)
    .single();

  if (!resident) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const valid = await bcrypt.compare(pin, resident.pin_hash);
  if (!valid) {
    return NextResponse.json(
      { error: `Invalid PIN. ${remaining} attempts remaining.` },
      { status: 401 }
    );
  }

  resetRateLimit(apt);

  const token = await createSessionToken({
    residentId: resident.id,
    apartment: resident.apartment,
    isAdmin: resident.is_admin || false,
  });

  await setSessionCookie(token);

  return NextResponse.json({ success: true, apartment: resident.apartment });
}
