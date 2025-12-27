import { NextRequest, NextResponse } from "next/server";
import {openai} from "@/config/OpenAiModel";
import { AIDoctorAgents } from "@/shared/list";

export async function POST(req: NextRequest) {
    const {notes}= await req.json();
  try {
    const completion = await openai.chat.completions.create({
      model: "kwaipilot/kat-coder-pro:free",
      messages: [
        { role: "system", content:JSON.stringify(AIDoctorAgents) },
        { role: "user", content: "User Notes/Symptoms:" + notes + ",Depends on user notes and symptoms please suggest list of doctors,Return Object in JSON only"}],
    });

    const rawresponse = completion.choices[0].message;
    //@ts-ignore
    const Resp=rawresponse.content.trim().replace('```json','').replace('```','');
    const JSONResp=JSON.parse(Resp);
    console.log("Suggested Doctors:",JSONResp);
    return NextResponse.json( JSONResp );
  } catch (err) {
    return NextResponse.json(err);
  }
}
