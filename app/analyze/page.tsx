"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";

type AnalysisResult = {
  presentationScore: number;
  potentialScore: number;
  potentialLabel: string;
  skin: string;
  hair: string;
  presentation: string;
  topImprovements: string[];
  suggestions: string[];
};

function getGrade(score: number) {
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 70) return "C";
  if (score >= 60) return "D";
  return "F";
}

export default function AnalyzePage() {
  const supabase = createClient();

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (!selected) return;

    setFile(selected);
    setPreview(URL.createObjectURL(selected));
    setStatus("");
    setResult(null);
  }

  async function uploadAndAnalyze() {
    try {
      setLoading(true);
      setStatus("");
      setResult(null);

      if (!file) {
        setStatus("Choose a file first.");
        return;
      }

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setStatus("You are not logged in.");
        return;
      }

      const filePath = `${user.id}/${Date.now()}_${file.name}`;

      const { error: uploadError } = await supabase.storage
        .from("photos")
        .upload(filePath, file);

      if (uploadError) {
        setStatus(uploadError.message);
        return;
      }

      const { data: signedData, error: signedError } = await supabase.storage
        .from("photos")
        .createSignedUrl(filePath, 60 * 10);

      if (signedError || !signedData?.signedUrl) {
        setStatus("Could not create image URL.");
        return;
      }

      const analysisRes = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageUrl: signedData.signedUrl,
        }),
      });

      const analysisData = await analysisRes.json();

      if (!analysisRes.ok) {
        setStatus(analysisData.error || "Analysis failed.");
        return;
      }

      const aiResult: AnalysisResult = analysisData.result;
      setResult(aiResult);
      setStatus("Analysis complete.");

      const grade = getGrade(aiResult.presentationScore);

      const { error: insertError } = await supabase.from("analyses").insert({
        user_id: user.id,
        image_path: filePath,
        presentation_score: aiResult.presentationScore,
        potential_score: aiResult.potentialScore,
        grade,
        result: aiResult,
      });

      if (insertError) {
        console.error(insertError);
      }
    } catch (error: any) {
      setStatus(error.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page">
      <section className="sectionHeader">
        <h1>Face Analysis</h1>
        <p>Upload a clear photo to get presentation and potential scores.</p>
      </section>

      <section className="analyzeLayout">
        <div className="card uploadCard">
          <h2>Upload Photo</h2>

          <label className="uploadBox">
            <input
              type="file"
              accept="image/*"
              onChange={handleFile}
              className="hiddenInput"
            />
            <span>Click to choose an image</span>
          </label>

          <button
            className="primaryButton"
            onClick={uploadAndAnalyze}
            disabled={loading}
          >
            {loading ? "Analyzing..." : "Analyze Photo"}
          </button>

          {status ? <p className="mutedText">{status}</p> : null}
        </div>

        <div className="card previewCard">
          <h2>Preview</h2>

          {preview ? (
            <img src={preview} alt="Preview" className="previewImage" />
          ) : (
            <div className="emptyPreview">
              Your uploaded image will appear here
            </div>
          )}

          {result && (
            <div className="resultPanel">
              <h2 className="reportTitle">Appearance Report</h2>

              <div className="reportCard">
                <div className="gradeBlock">
                  <span className="gradeLabel">Grade</span>
                  <span className="gradeValue">
                    {getGrade(result.presentationScore)}
                  </span>
                </div>

                <div className="scoreInfo">
                  <div className="scoreLine">
                    <span>Current Score</span>
                    <strong>{result.presentationScore}</strong>
                  </div>

                  <div className="scoreLine">
                    <span>Potential Score</span>
                    <strong>{result.potentialScore}</strong>
                  </div>

                  <div className="scoreLine highlight">
                    <span>Glow-Up Potential</span>
                    <strong>
                      +{result.potentialScore - result.presentationScore}
                    </strong>
                  </div>
                </div>
              </div>

              <div className="scoreBlock">
                <div className="scoreHeader">
                  <span>Current Presentation</span>
                  <strong>{result.presentationScore}/100</strong>
                </div>
                <div className="scoreBar">
                  <div
                    className="scoreFillCurrent"
                    style={{ width: `${result.presentationScore}%` }}
                  />
                </div>
              </div>

              <div className="scoreBlock">
                <div className="scoreHeader">
                  <span>Potential</span>
                  <strong>
                    {result.potentialScore}/100 · {result.potentialLabel}
                  </strong>
                </div>
                <div className="scoreBar">
                  <div
                    className="scoreFillPotential"
                    style={{ width: `${result.potentialScore}%` }}
                  />
                </div>
              </div>

              <h3>Observations</h3>

              <div className="observationGrid">
                <div className="observationCard">
                  <span>Skin</span>
                  <p>{result.skin}</p>
                </div>

                <div className="observationCard">
                  <span>Hair</span>
                  <p>{result.hair}</p>
                </div>

                <div className="observationCard">
                  <span>Presentation</span>
                  <p>{result.presentation}</p>
                </div>
              </div>

              <h3>Top Improvements</h3>
              <ul className="routineList">
                {result.topImprovements.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>

              <h3>Suggestions</h3>
              <ul className="routineList">
                {result.suggestions.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}