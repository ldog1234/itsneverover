import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: analyses, error } = await supabase
    .from("analyses")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <main className="page">
      <section className="sectionHeader">
        <h1>Dashboard</h1>
        <p>Your saved uploads</p>
      </section>

      {error ? <p className="mutedText">Failed to load uploads.</p> : null}

      <div className="featuresGrid dashboardGrid">
        {analyses?.length ? (
          analyses.map((item) => (
            <div className="card" key={item.id}>
              <h3>Saved Upload</h3>
              <p className="mutedText">
                {new Date(item.created_at).toLocaleString()}
              </p>
              <img
  src={`https://lpyoigzrqifcxajijwsr.supabase.co/storage/v1/object/public/photos/${item.image_path}`}
  style={{ width: "100%", borderRadius: 12 }}
/>
            </div>
          ))
        ) : (
          <div className="card">
            <h3>No uploads yet</h3>
            <p>Upload your first image to see it here.</p>
          </div>
        )}
      </div>
    </main>
  );
}