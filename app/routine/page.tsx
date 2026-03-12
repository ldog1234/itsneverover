"use client";

import { useState } from "react";

type AiRoutineResponse = {
  title: string;
  summary: string;
  sections: {
    title: string;
    items: string[];
  }[];
};

export default function RoutinePage() {
  const [goal, setGoal] = useState("");
  const [category, setCategory] = useState("Skin");
  const [experience, setExperience] = useState("Beginner");
  const [timeCommitment, setTimeCommitment] = useState("Medium");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [routine, setRoutine] = useState<AiRoutineResponse | null>(null);

  async function generateRoutine() {
    setLoading(true);
    setError("");
    setRoutine(null);

    try {
      const res = await fetch("/api/routine", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          goal,
          category,
          experience,
          timeCommitment,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to generate routine");
      }

      setRoutine(data.routine);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page">
      <section className="sectionHeader">
        <h1>AI Routine Builder</h1>
        <p>
          Generate a custom routine based on your goals, category, experience,
          and time commitment.
        </p>
      </section>

      <section className="routineWrap">
        <div className="card formCard">
          <label className="label">Main Goal</label>
          <input
            className="textInput"
            placeholder="Example: reduce redness and acne, improve hairstyle, look leaner"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
          />

          <label className="label">Category</label>
          <select
            className="textInput"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option>Skin</option>
            <option>Hair</option>
            <option>Body</option>
            <option>Style</option>
            <option>Overall</option>
          </select>

          <label className="label">Experience Level</label>
          <select
            className="textInput"
            value={experience}
            onChange={(e) => setExperience(e.target.value)}
          >
            <option>Beginner</option>
            <option>Intermediate</option>
            <option>Advanced</option>
          </select>

          <label className="label">Time Commitment</label>
          <select
            className="textInput"
            value={timeCommitment}
            onChange={(e) => setTimeCommitment(e.target.value)}
          >
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
          </select>

          <button className="primaryButton" onClick={generateRoutine} disabled={loading}>
            {loading ? "Generating..." : "Generate AI Routine"}
          </button>

          {error ? <p className="authMessage mutedText">{error}</p> : null}
        </div>

        <div className="card resultCard">
          <h2>Your Routine</h2>

          {!routine && !loading ? (
            <p className="mutedText">
              Your AI-generated routine will appear here.
            </p>
          ) : null}

          {loading ? (
            <p className="mutedText">Thinking...</p>
          ) : null}

          {routine ? (
            <div style={{ display: "grid", gap: "18px" }}>
              <div>
                <h3 style={{ marginBottom: 8 }}>{routine.title}</h3>
                <p className="mutedText">{routine.summary}</p>
              </div>

              {routine.sections.map((section, index) => (
                <div key={index}>
                  <h3 style={{ marginBottom: 8 }}>{section.title}</h3>
                  <ul className="routineList">
                    {section.items.map((item, itemIndex) => (
                      <li key={itemIndex}>{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}