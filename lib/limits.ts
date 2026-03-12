import { createClient } from "@/utils/supabase/server";

export async function checkAndTrackUsage(
  feature: "face_analysis" | "routine_generation"
) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("Unauthorized");
  }

  let { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("is_premium")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    throw new Error("Could not load profile");
  }

  if (!profile) {
    const { error: insertProfileError } = await supabase.from("profiles").insert({
      id: user.id,
      is_premium: false,
    });

    if (insertProfileError) {
      throw new Error("Could not create profile");
    }

    const { data: newProfile, error: newProfileError } = await supabase
      .from("profiles")
      .select("is_premium")
      .eq("id", user.id)
      .single();

    if (newProfileError || !newProfile) {
      throw new Error("Could not load profile");
    }

    profile = newProfile;
  }

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const { count, error: countError } = await supabase
    .from("usage_events")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("feature", feature)
    .gte("created_at", startOfToday.toISOString());

  if (countError) {
    throw new Error("Could not check usage");
  }

  const limit = profile.is_premium
    ? 999
    : feature === "face_analysis"
    ? 1
    : 3;

  if ((count ?? 0) >= limit) {
    throw new Error(
      feature === "face_analysis"
        ? "Daily limit reached: 1 face analysis per day for non-premium users."
        : "Daily limit reached: 3 routine generations per day for non-premium users."
    );
  }

  const { error: insertError } = await supabase.from("usage_events").insert({
    user_id: user.id,
    feature,
  });

  if (insertError) {
    throw new Error("Could not record usage");
  }

  return {
    user,
    isPremium: profile.is_premium,
    usedToday: count ?? 0,
    limit,
  };
}