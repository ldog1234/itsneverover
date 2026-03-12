import { NextResponse } from "next/server";
import OpenAI from "openai";
import { checkAndTrackUsage } from "@/lib/limits";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    await checkAndTrackUsage("face_analysis");

    const body = await req.json();
    const { imageUrl, notes } = body;

    if (!imageUrl) {
      return NextResponse.json({ error: "Image required" }, { status: 400 });
    }

    const prompt = `
You are analyzing a user's face photo for healthy appearance improvement.

Important rules:
- Do NOT judge the person's worth.
- Do NOT give toxic or demeaning feedback.
- Do NOT recommend surgery, starvation, dangerous drugs, or extreme looksmaxing.
- Focus on visible, changeable factors like grooming, skin presentation, hairstyle framing, lighting, posture, and photo presentation.
- Scores should reflect presentation and improvement potential, not absolute human value.

User notes: ${notes || "none"}

Return ONLY valid JSON in this exact format:
{
  "presentationScore": 0,
  "potentialScore": 0,
  "potentialLabel": "Low | Moderate | High | Very High",
  "skin": "short observation",
  "hair": "short observation",
  "presentation": "short observation",
  "topImprovements": [
    "item 1",
    "item 2",
    "item 3"
  ],
  "suggestions": [
    "item 1",
    "item 2",
    "item 3"
  ]
}

Scoring guidance:
- presentationScore = current visible presentation quality from 1 to 100
- potentialScore = realistic improvement potential within a few months from 1 to 100
- potentialScore should usually be >= presentationScore
- keep observations concise
- topImprovements should be short
- suggestions should be actionable
`;

    const response = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: [
        {
          type: "message",
          role: "user",
          content: [
            {
              type: "input_text",
              text: prompt,
            },
            {
              type: "input_image",
              image_url: imageUrl,
              detail: "auto",
            },
          ],
        },
      ],
    });

    const text = response.output_text;

    let result;
    try {
      result = JSON.parse(text);
    } catch {
      return NextResponse.json(
        { error: "AI returned invalid JSON" },
        { status: 500 }
      );
    }

    return NextResponse.json({ result });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Server error" },
      { status: 500 }
    );
  }
}