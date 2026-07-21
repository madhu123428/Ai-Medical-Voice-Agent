import { NextRequest, NextResponse } from "next/server";
import {openai} from "@/config/OpenAiModel";
import { AIDoctorAgents } from "@/shared/list";

export async function POST(req: NextRequest) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      console.error("❌ Error: GEMINI_API_KEY is not configured in environment variables.");
      return NextResponse.json(
        { error: "GEMINI_API_KEY environment variable is missing in .env.local" },
        { status: 500 }
      );
    }

    const { notes } = await req.json();
    
    const prompt = 
      `Analyze the user's symptoms: "${notes}"\n\n` +
      `Based on these symptoms, suggest a list of doctors from the provided agent list. ` +
      `You MUST return a JSON array of objects representing the recommended doctors, selected strictly from the list. ` +
      `Do not modify their fields. Return ONLY the JSON array (e.g. [ { "id": ... } ]). No conversational text.`;

    const completion = await openai.chat.completions.create({
      model: "gemini-2.5-flash",
      messages: [
        { 
          role: "system", 
          content: "You are a helpful medical triage assistant. Here is the list of available doctor agents:\n" + JSON.stringify(AIDoctorAgents) 
        },
        { 
          role: "user", 
          content: prompt 
        }
      ],
    });

    const rawContent = completion.choices[0].message?.content || "";
    console.log("Raw LLM response content:", rawContent);

    // Find boundaries for the JSON array ([])
    const jsonStart = rawContent.indexOf("[");
    const jsonEnd = rawContent.lastIndexOf("]");

    if (jsonStart === -1 || jsonEnd === -1 || jsonStart > jsonEnd) {
      throw new Error("Could not find any JSON array block in LLM response");
    }

    const cleanJsonString = rawContent.substring(jsonStart, jsonEnd + 1);
    const JSONResp = JSON.parse(cleanJsonString);

    console.log("Suggested Doctors:", JSONResp);
    return NextResponse.json({
      suggestedDoctors: JSONResp
    });
  } catch (err: any) {
    console.error("❌ Error in suggest-doctors API:", err);
    return NextResponse.json(
      { error: "Failed to suggest doctors", details: err?.message || String(err) },
      { status: 500 }
    );
  }
}
