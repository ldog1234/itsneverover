"use client";

import { useState } from "react";

export default function RoutinePage() {
  const [goal, setGoal] = useState("");
  const [category, setCategory] = useState("Skin");
  const [routine, setRoutine] = useState<string[]>([]);

  function generateRoutine() {
    const baseRoutine: Record<string, string[]> = {
      Skin: [
        "Wash face with a gentle cleanser morning and night",
        "Use moisturizer after cleansing",
        "Apply sunscreen every morning",
        "Track irritation, redness, or breakouts weekly",
      ],
      Hair: [
        "Use a hairstyle that matches your face shape",
        "Wash hair on a schedule that fits your scalp type",
        "Use a lightweight styling product",
        "Get consistent trims to keep shape clean",
      ],
      Body: [
        "Lift 3–4 times per week",
        "Walk daily for conditioning and leanness",
        "Eat enough protein for recovery",
        "Prioritize sleep for growth and appearance",
      ],
      Style: [
        "Wear clothes that fit your frame properly",
        "Use neutral colors as a base wardrobe",
        "Keep shoes and outerwear clean",
        "Build a simple style that looks intentional",
      ],
    };

    const selected = baseRoutine[category] || [];
    const customGoal = goal.trim()
      ? `Focus goal: ${goal.trim()}`
      : "Focus goal: general improvement";

    setRoutine([customGoal, ...selected]);
  }

  return (
    <main className="page">
      <section className="sectionHeader">
        <h1>Routine Builder</h1>
        <p>
          Choose your focus and generate a simple routine you can actually stick
          to.
        </p>
      </section>

      <section className="routineWrap">
        <div className="card formCard">
          <label className="label">Main Goal</label>
          <input
            className="textInput"
            placeholder="Example: reduce redness, improve hairstyle, look leaner"
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
          </select>

          <button className="primaryButton" onClick={generateRoutine}>
            Generate Routine
          </button>
        </div>

        <div className="card resultCard">
          <h2>Your Routine</h2>

          {routine.length === 0 ? (
            <p className="mutedText">
              Your generated routine will appear here.
            </p>
          ) : (
            <ul className="routineList">
              {routine.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </main>
  );
}