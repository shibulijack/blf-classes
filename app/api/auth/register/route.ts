import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getSupabase } from "@/lib/supabase/server";
import { createSessionToken, setSessionCookie } from "@/lib/auth/session";

export async function POST(request: NextRequest) {
  const { apartment, pin, displayName } = await request.json();

  const apt = apartment?.toUpperCase().trim();
  const name = displayName?.trim();

  if (!apt || !name) {
    return NextResponse.json(
      { error: "Apartment number and name are required" },
      { status: 400 }
    );
  }

  if (!pin || typeof pin !== "string" || pin.length !== 4 || !/^\d{4}$/.test(pin)) {
    return NextResponse.json(
      { error: "A valid 4-digit PIN is required" },
      { status: 400 }
    );
  }

  const supabase = getSupabase();

  // Check if this name already exists for this apartment
  const { data: existing } = await supabase
    .from("residents")
    .select("id")
    .eq("apartment", apt)
    .eq("display_name", name)
    .single();

  if (existing) {
    return NextResponse.json(
      { error: "This name is already registered at this apartment. Please login or use a different name." },
      { status: 409 }
    );
  }

  const pinHash = await bcrypt.hash(pin, 10);

  const { data: resident, error } = await supabase
    .from("residents")
    .insert({
      apartment: apt,
      pin_hash: pinHash,
      display_name: name,
    })
    .select("id, apartment")
    .single();

  if (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Registration failed", detail: error.message },
      { status: 500 }
    );
  }

  const token = await createSessionToken({
    residentId: resident.id,
    apartment: resident.apartment,
    isAdmin: false,
  });

  await setSessionCookie(token);

  return NextResponse.json({ success: true, apartment: resident.apartment });
}
