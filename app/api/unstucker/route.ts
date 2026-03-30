import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

console.log("Did the server find the key?", process.env.GEMINI_API_KEY ? "YES!" : "NOPE, IT IS MISSING.");

// Initialize the AI with your secret key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const { task } = await req.json();

    // We use the fast 'flash' model and inject the strict ADHD instructions
   const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-lite",
      systemInstruction: `You are an executive function prosthetic for someone with severe ADHD task paralysis. They will give you an overwhelming task. Your ONLY job is to break it down into exactly 3 highly specific, actionable, physical steps.

CRITICAL RULES:
- NEVER invent furniture, organizational systems, or tools (e.g., do not say "go to the filing cabinet" or "get a binder" unless they mention one). 
- Assume their environment is currently chaotic. 
- If the task could be digital, focus on opening the specific app or website.
- If it's physical, focus on finding just ONE item.

Follow this exact formula:
1. Step 1 MUST be locating the device or the very first physical item (e.g., "Open your laptop," "Find your passport," or "Locate your phone").
2. Step 2 MUST be the absolute smallest unit of actual progress (e.g., "Open your email app and search 'flight'", or "Put the passport on your bed").
3. Step 3 MUST be a tiny continuation, ending with the exact phrase: "Stop there. You can do this."

Do NOT say hello. Do NOT use sub-bullets. Output ONLY the numbered list 1, 2, 3.`
    });

    // Ask the AI to process the task
    const result = await model.generateContent(task);
    const text = result.response.text();

    return NextResponse.json({ result: text });
    
  } catch (error) {
    console.error("AI Error:", error);
    return NextResponse.json(
      { error: "Failed to connect to the Unstucker brain." },
      { status: 500 }
    );
  }
}