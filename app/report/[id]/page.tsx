import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";

type ReportPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ReportPage({ params }: ReportPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: report, error } = await supabase
    .from("analyses")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error || !report) {
    redirect("/dashboard");
  }

  const { data: signedData } = await supabase.storage
    .from("photos")
    .createSignedUrl(report.image_path, 60 * 60);

  const imageUrl = signedData?.signedUrl ?? null;
  const glowUpGain =
    (report.potential_score ?? 0) - (report.presentation_score ?? 0);

  return (
    <main className="page">
      <div style={{ marginBottom: 18 }}>
        <Link href="/dashboard" className="secondaryButton">
          Back to Tracker
        </Link>
      </div>

      <section className="sectionHeader">
        <h1>Detailed Report</h1>
        <p>{new Date(report.created_at).toLocaleString()}</p>
      </section>

      <section className="trackerCard card reportPageGrid">
        <div>
          {imageUrl ? (
            <img src={imageUrl} alt="Analysis" className="trackerImage" />
          ) : (
            <div className="emptyPreview">Image unavailable</div>
          )}
        </div>

        <div className="trackerContent">
          <div className="reportCard">
            <div className="gradeBlock">
              <span className="gradeLabel">Grade</span>
              <span className="gradeValue">{report.grade || "-"}</span>
            </div>

            <div className="scoreInfo">
              <div className="scoreLine">
                <span>Current Score</span>
                <strong>{report.presentation_score ?? "-"}</strong>
              </div>

              <div className="scoreLine">
                <span>Potential Score</span>
                <strong>{report.potential_score ?? "-"}</strong>
              </div>

              <div className="scoreLine highlight">
                <span>Glow-Up Potential</span>
                <strong>{glowUpGain > 0 ? `+${glowUpGain}` : glowUpGain}</strong>
              </div>
            </div>
          </div>

          <div className="scoreBlock">
            <div className="scoreHeader">
              <span>Current Presentation</span>
              <strong>{report.presentation_score ?? 0}/100</strong>
            </div>
            <div className="scoreBar">
              <div
                className="scoreFillCurrent"
                style={{ width: `${report.presentation_score ?? 0}%` }}
              />
            </div>
          </div>

          <div className="scoreBlock">
            <div className="scoreHeader">
              <span>Potential</span>
              <strong>
                {report.potential_score ?? 0}/100
                {report.result?.potentialLabel
                  ? ` · ${report.result.potentialLabel}`
                  : ""}
              </strong>
            </div>
            <div className="scoreBar">
              <div
                className="scoreFillPotential"
                style={{ width: `${report.potential_score ?? 0}%` }}
              />
            </div>
          </div>

          {report.result ? (
            <>
              <h3>Observations</h3>

              <div className="observationGrid">
                <div className="observationCard">
                  <span>Skin</span>
                  <p>{report.result.skin}</p>
                </div>

                <div className="observationCard">
                  <span>Hair</span>
                  <p>{report.result.hair}</p>
                </div>

                <div className="observationCard">
                  <span>Presentation</span>
                  <p>{report.result.presentation}</p>
                </div>
              </div>

              <h3>Top Improvements</h3>
              <ul className="routineList">
                {report.result.topImprovements?.map(
                  (item: string, index: number) => (
                    <li key={index}>{item}</li>
                  )
                )}
              </ul>

              <h3>Suggestions</h3>
              <ul className="routineList">
                {report.result.suggestions?.map(
                  (item: string, index: number) => (
                    <li key={index}>{item}</li>
                  )
                )}
              </ul>
            </>
          ) : null}
        </div>
      </section>
    </main>
  );
}