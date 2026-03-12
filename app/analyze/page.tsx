"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";

export default function AnalyzePage() {
  const supabase = createClient();

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [status, setStatus] = useState("");

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (!selected) return;

    setFile(selected);
    setPreview(URL.createObjectURL(selected));
    setStatus("");
  }

  async function upload() {
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

    const { error: insertError } = await supabase.from("analyses").insert({
      user_id: user.id,
      image_path: filePath,
    });

    if (insertError) {
      setStatus(insertError.message);
      return;
    }

    setStatus("Upload saved successfully.");
  }

  return (
    <main className="page">
      <section className="sectionHeader">
        <h1>Face Analysis</h1>
        <p>Upload a photo and save it to your account.</p>
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

          <button className="primaryButton" onClick={upload}>
            Upload Photo
          </button>

          {status ? <p className="mutedText authMessage">{status}</p> : null}
        </div>

        <div className="card previewCard">
          <h2>Preview</h2>
          {preview ? (
            <img src={preview} alt="Preview" className="previewImage" />
          ) : (
            <div className="emptyPreview">Your uploaded image will appear here</div>
          )}
        </div>
      </section>
    </main>
  );
}