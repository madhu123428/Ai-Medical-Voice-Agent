import { NextRequest, NextResponse } from "next/server";
import {openai} from "@/config/OpenAiModel";
import { AIDoctorAgents } from "@/shared/list";

export async function POST(req: NextRequest) {
    const {notes}= await req.json();
  try {
    const completion = await openai.chat.completions.create({
      model: "gemini-2.5-flash",
      messages: [
        { role: "system", content:JSON.stringify(AIDoctorAgents) },
        { role: "user", content: "User Notes/Symptoms:" + notes + ",Depends on user notes and symptoms please suggest list of doctors,Return Object in JSON only"}],
    });

    const rawresponse = completion.choices[0].message;
    const rawContent = rawresponse?.content || "";
    console.log("Raw LLM response content:", rawContent);

    // Find boundaries for either JSON array ([]) or JSON object ({})
    const jsonStart = Math.min(
      rawContent.indexOf("[") === -1 ? Infinity : rawContent.indexOf("["),
      rawContent.indexOf("{") === -1 ? Infinity : rawContent.indexOf("{")
    );
    const jsonEnd = Math.max(
      rawContent.lastIndexOf("]"),
      rawContent.lastIndexOf("}")
    );

    if (jsonStart === Infinity || jsonEnd === -1 || jsonStart > jsonEnd) {
      throw new Error("Could not find any JSON block in LLM response");
    }

    const cleanJsonString = rawContent.substring(jsonStart, jsonEnd + 1);
    const JSONResp = JSON.parse(cleanJsonString);

    console.log("Suggested Doctors:", JSONResp);
    return NextResponse.json({
      suggestedDoctors: JSONResp
    });
  } catch (err) {
    return NextResponse.json(err);
  }
}
