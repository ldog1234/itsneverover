import Link from "next/link";

export default function Home() {
  return (
    <main className="page">
      <section className="hero">
        <div className="badge">Healthy looks improvement</div>

        <h1 className="heroTitle">
          Improve your appearance with real, helpful advice
        </h1>

        <p className="heroText">
          Get personalized grooming, skincare, hair, and routine suggestions in
          a clean, non-toxic platform built for real self-improvement.
        </p>

        <div className="heroButtons">
          <Link href="/analyze" className="primaryButton">
            Start Face Analysis
          </Link>

          <Link href="/routine" className="secondaryButton">
            Build My Routine
          </Link>
        </div>
      </section>

      <section className="featuresGrid">
        <div className="card">
          <h3>Face Analysis</h3>
          <p>
            Upload a clear image and get improvement suggestions for grooming,
            skincare, and presentation.
          </p>
        </div>

        <div className="card">
          <h3>Routine Builder</h3>
          <p>
            Generate a custom routine based on your goals like skin, hair,
            physique, or style.
          </p>
        </div>

        <div className="card">
          <h3>Healthy Advice</h3>
          <p>
            No weird toxic forum garbage. Just clean, useful, realistic guidance.
          </p>
        </div>
      </section>
    </main>
  );
}