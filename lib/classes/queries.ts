import { getSupabase } from "@/lib/supabase/server";
import { ClassWithMeta } from "@/lib/types";

interface ClassFilters {
  category?: string;
  day?: string;
  search?: string;
  ageGroup?: string;
}

export async function getClasses(
  filters: ClassFilters,
  residentId: string
): Promise<ClassWithMeta[]> {
  const supabase = getSupabase();

  let query = supabase
    .from("classes")
    .select(
      `*, residents!created_by(apartment, display_name), registrations(count), class_verifications(count), class_reports(count)`
    )
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (filters.category) {
    query = query.eq("category", filters.category);
  }
  if (filters.day) {
    query = query.contains("day_of_week", [filters.day]);
  }
  if (filters.ageGroup) {
    query = query.eq("age_group", filters.ageGroup);
  }
  if (filters.search) {
    query = query.or(
      `title.ilike.%${filters.search}%,tutor_name.ilike.%${filters.search}%`
    );
  }

  const { data, error } = await query;
  if (error) throw error;

  // Get current user's actions in parallel
  const [{ data: myRegistrations }, { data: myVerifications }, { data: myReports }] =
    await Promise.all([
      supabase.from("registrations").select("class_id").eq("resident_id", residentId),
      supabase.from("class_verifications").select("class_id").eq("resident_id", residentId),
      supabase.from("class_reports").select("class_id").eq("resident_id", residentId),
    ]);

  const myRegIds = new Set(myRegistrations?.map((r) => r.class_id) || []);
  const myVerifyIds = new Set(myVerifications?.map((v) => v.class_id) || []);
  const myReportIds = new Set(myReports?.map((r) => r.class_id) || []);

  return (data || []).map((item) => {
    const resident = item.residents as unknown as {
      apartment: string;
      display_name: string | null;
    };
    const regCount = item.registrations as unknown as { count: number }[];
    const verifyCount = item.class_verifications as unknown as { count: number }[];
    const reportCount = item.class_reports as unknown as { count: number }[];
    return {
      ...item,
      interest_count: regCount?.[0]?.count || 0,
      is_interested: myRegIds.has(item.id),
      verification_count: verifyCount?.[0]?.count || 0,
      is_verified_by_me: myVerifyIds.has(item.id),
      is_reported_by_me: myReportIds.has(item.id),
      report_count: reportCount?.[0]?.count || 0,
      creator_apartment: resident?.apartment || "",
      creator_name: resident?.display_name || null,
      residents: undefined,
      registrations: undefined,
      class_verifications: undefined,
      class_reports: undefined,
    } as ClassWithMeta;
  });
}

export async function getClassById(
  id: string,
  residentId: string
): Promise<ClassWithMeta | null> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("classes")
    .select(
      `*, residents!created_by(apartment, display_name), registrations(count), class_verifications(count), class_reports(count)`
    )
    .eq("id", id)
    .single();

  if (error || !data) return null;

  const [{ data: myReg }, { data: myVerify }, { data: myReport }] = await Promise.all([
    supabase.from("registrations").select("id").eq("class_id", id).eq("resident_id", residentId).single(),
    supabase.from("class_verifications").select("id").eq("class_id", id).eq("resident_id", residentId).single(),
    supabase.from("class_reports").select("id").eq("class_id", id).eq("resident_id", residentId).single(),
  ]);

  const resident = data.residents as unknown as {
    apartment: string;
    display_name: string | null;
  };
  const regCount = data.registrations as unknown as { count: number }[];
  const verifyCount = data.class_verifications as unknown as { count: number }[];
  const reportCount = data.class_reports as unknown as { count: number }[];

  return {
    ...data,
    interest_count: regCount?.[0]?.count || 0,
    is_interested: !!myReg,
    verification_count: verifyCount?.[0]?.count || 0,
    is_verified_by_me: !!myVerify,
    is_reported_by_me: !!myReport,
    report_count: reportCount?.[0]?.count || 0,
    creator_apartment: resident?.apartment || "",
    creator_name: resident?.display_name || null,
  } as ClassWithMeta;
}

export async function getMyClasses(residentId: string) {
  const supabase = getSupabase();

  const [{ data: created }, { data: registrations }] = await Promise.all([
    supabase
      .from("classes")
      .select(`*, registrations(count), class_verifications(count), class_reports(count)`)
      .eq("created_by", residentId)
      .order("created_at", { ascending: false }),
    supabase
      .from("registrations")
      .select(`class_id, classes(*, registrations(count), class_verifications(count), class_reports(count))`)
      .eq("resident_id", residentId)
      .order("created_at", { ascending: false }),
  ]);

  const createdClasses = (created || []).map((item) => {
    const regCount = item.registrations as unknown as { count: number }[];
    const verifyCount = item.class_verifications as unknown as { count: number }[];
    const reportCount = item.class_reports as unknown as { count: number }[];
    return {
      ...item,
      interest_count: regCount?.[0]?.count || 0,
      is_interested: false,
      verification_count: verifyCount?.[0]?.count || 0,
      is_verified_by_me: false,
      is_reported_by_me: false,
      report_count: reportCount?.[0]?.count || 0,
      creator_apartment: "",
      creator_name: null,
    } as ClassWithMeta;
  });

  const registeredClasses = (registrations || []).map((reg) => {
    const cls = reg.classes as unknown as Record<string, unknown>;
    const regCount = cls.registrations as unknown as { count: number }[];
    const verifyCount = cls.class_verifications as unknown as { count: number }[];
    const reportCount = cls.class_reports as unknown as { count: number }[];
    return {
      ...cls,
      interest_count: regCount?.[0]?.count || 0,
      is_interested: true,
      verification_count: verifyCount?.[0]?.count || 0,
      is_verified_by_me: false,
      is_reported_by_me: false,
      report_count: reportCount?.[0]?.count || 0,
      creator_apartment: "",
      creator_name: null,
    } as ClassWithMeta;
  });

  return { created: createdClasses, registered: registeredClasses };
}
