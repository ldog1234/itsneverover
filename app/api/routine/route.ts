import { NextResponse } from "next/server";
import OpenAI from "openai";
import { checkAndTrackUsage } from "@/lib/limits";


const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
   
   await checkAndTrackUsage("routine_generation");

    const body = await req.json();
    const { goal, category, experience, timeCommitment } = body;

    if (!goal || !category || !experience || !timeCommitment) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 }
      );
    }

    const prompt = `
You are building a healthy, practical self-improvement routine for a user.

The website should avoid toxic, extreme, or unsafe advice.
Do not recommend dangerous drugs, surgery, starvation, self-harm, or obsessive behavior.
Focus on realistic grooming, skincare, fitness, style, sleep, posture, and sustainable habits.

User info:
- Goal: ${goal}
- Category: ${category}
- Experience: ${experience}
- Time commitment: ${timeCommitment}

Return ONLY valid JSON in this exact shape:
{
  "title": "string",
  "summary": "string",
  "sections": [
    {
      "title": "Main Focus",
      "items": ["item 1", "item 2", "item 3"]
    },
    {
      "title": "Daily Actions",
      "items": ["item 1", "item 2", "item 3"]
    },
    {
      "title": "Weekly Actions",
      "items": ["item 1", "item 2", "item 3"]
    },
    {
      "title": "Avoid",
      "items": ["item 1", "item 2", "item 3"]
    }
  ]
}

Make it specific to the user's goal.
Keep each item concise and actionable.
`;

    const response = await openai.responses.create({
      model: "gpt-5.4",
      input: prompt,
    });

    const text = response.output_text;

    let routine;
    try {
      routine = JSON.parse(text);
    } catch {
      return NextResponse.json(
        { error: "Model returned invalid JSON. Try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({ routine });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Server error" },
      { status: 500 }
    );
  }
}