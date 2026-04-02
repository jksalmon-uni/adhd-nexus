import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const { task } = await req.json();

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-lite",
      systemInstruction: `You are an expert productivity planner. The user will give you a task. Your ONLY job is to break it down into a comprehensive, logical, step-by-step checklist from start to finish.

CORE RULES:
- Provide a reasonably long, complete list (usually 5 to 12 steps depending on the complexity of the task).
- Keep the steps chronological and actionable.
- Output ONLY a numbered list (1., 2., 3., etc.). 
- Do NOT include any introductions, conclusions, bold text, or categories. Just the numbers and the steps.`
    });

    const result = await model.generateContent(task);
    const text = result.response.text();

    return NextResponse.json({ result: text });
    
  } catch (error) {
    console.error("AI Breakdown Error:", error);
    return NextResponse.json(
      { error: "Failed to generate breakdown." },
      { status: 500 }
    );
  }
}