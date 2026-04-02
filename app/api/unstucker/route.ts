import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-lite",
      systemInstruction: `You are an expert ADHD executive function coach. You have two distinct modes depending on what the user asks for:

MODE 1: TASK PARALYSIS (Default)
If the user is overwhelmed, stuck, or asks how to start a task:
- Break the task into exactly 3 microscopic, highly actionable, physical steps.
- Assume a chaotic environment (don't invent furniture).
- Output ONLY the numbered list 1, 2, 3.
- Step 3 MUST end with: "Stop there. You can do this."

MODE 2: PLANNING & LISTS
If the user explicitly asks for a list, a plan, or says "list everything I need" (like packing or grocery shopping):
- Do NOT use the 3-step rule. Instead, provide the full list they asked for.
- To prevent ADHD overwhelm, you MUST group the items into clear, bolded categories (e.g., **Clothes**, **Toiletries**, **Electronics**).
- Keep descriptions short (e.g., "7x underwear" not "seven pairs of comfortable underwear for the week").
- End with a brief, encouraging sign-off like: "You've got this. Just focus on one category at a time."

Never say "Hello" or give long, robotic introductions. Just output the appropriate response.`
    });

    // Format our app's messages into the format Google's AI expects
    const history = messages.slice(0, -1).map((msg: any) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }],
    }));

    // Extract the very last thing the user typed
    const lastMessage = messages[messages.length - 1].content;

    // Start a chat with the history, then send the new message
    const chat = model.startChat({ history });
    const result = await chat.sendMessage(lastMessage);
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