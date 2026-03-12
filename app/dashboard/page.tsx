import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

function getChange(current: number | null, previous: number | null) {
  if (current == null || previous == null) return null;
  return current - previous;
}

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
        <h1>Glow-Up Tracker</h1>
        <p>Your saved reports and score progress over time.</p>
      </section>

      {error ? <p className="mutedText">Failed to load reports.</p> : null}

      <div className="dashboardList">
        {analyses?.length ? (
          analyses.map((item, index) => {
            const previous = analyses[index + 1];
            const change = getChange(
              item.presentation_score ?? null,
              previous?.presentation_score ?? null
            );

            const imageUrl = `https://lpyoigzrqifcxajijwsr.supabase.co/storage/v1/object/public/photos/${item.image_path}`;

            return (
              <div className="card trackerCard" key={item.id}>
                <div className="trackerImageWrap">
                  <img
                    src={imageUrl}
                    alt="Saved analysis"
                    className="trackerImage"
                  />
                </div>

                <div className="trackerContent">
                  <div className="trackerTopRow">
                    <div>
                      <h3 className="trackerTitle">Appearance Report</h3>
                      <p className="mutedText">
                        {new Date(item.created_at).toLocaleString()}
                      </p>
                    </div>

                    <div className="trackerGradeBadge">
                      Grade {item.grade || "-"}
                    </div>
                  </div>

                  <div className="trackerStats">
                    <div className="miniScoreCard">
                      <span className="miniScoreLabel">Current</span>
                      <strong className="miniScoreValue">
                        {item.presentation_score ?? "-"}
                      </strong>
                    </div>

                    <div className="miniScoreCard">
                      <span className="miniScoreLabel">Potential</span>
                      <strong className="miniScoreValue">
                        {item.potential_score ?? "-"}
                      </strong>
                    </div>

                    <div className="miniScoreCard">
                      <span className="miniScoreLabel">Change</span>
                      <strong
                        className={`miniScoreValue ${
                          change != null
                            ? change > 0
                              ? "scorePositive"
                              : change < 0
                              ? "scoreNegative"
                              : ""
                            : ""
                        }`}
                      >
                        {change == null ? "-" : change > 0 ? `+${change}` : change}
                      </strong>
                    </div>
                  </div>

                  <div className="scoreBlock">
                    <div className="scoreHeader">
                      <span>Current Presentation</span>
                      <strong>{item.presentation_score ?? 0}/100</strong>
                    </div>
                    <div className="scoreBar">
                      <div
                        className="scoreFillCurrent"
                        style={{ width: `${item.presentation_score ?? 0}%` }}
                      />
                    </div>
                  </div>

                  <div className="scoreBlock">
                    <div className="scoreHeader">
                      <span>Potential</span>
                      <strong>{item.potential_score ?? 0}/100</strong>
                    </div>
                    <div className="scoreBar">
                      <div
                        className="scoreFillPotential"
                        style={{ width: `${item.potential_score ?? 0}%` }}
                      />
                    </div>
                  </div>

                  {item.result ? (
                    <>
                      <h4>Top Improvements</h4>
                      <ul className="routineList">
                        {item.result.topImprovements?.map(
                          (improvement: string, i: number) => (
                            <li key={i}>{improvement}</li>
                          )
                        )}
                      </ul>
                    </>
                  ) : null}
                </div>
              </div>
            );
          })
        ) : (
          <div className="card">
            <h3>No reports yet</h3>
            <p>Upload your first image to start your tracker.</p>
          </div>
        )}
      </div>
    </main>
  );
}