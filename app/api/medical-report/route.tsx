import { openai } from "../../../config/OpenAiModel";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/config/db";
import { sessionChatTable } from "@/config/schema";

const REPORT_GEN_PROMPT=`You are an AI Medical Voice Agent that just finished a voice conversation with a user. Based on the doctor AI agent info and Conversation between AI medical agent and user., generate a structured report with the following fields:
sessionId: a unique session identifier
agent: the medical specialist name (e.g., "General Physician AI")
user: name of the patient or "Anonymous" if not provided
timestamp: current date and time in ISO format
chiefComplaint: one-sentence summary of the main health concern
summary: a 2–3 sentence summary of the conversation, symptoms, and recommendations
symptoms: list of symptoms mentioned by the user
duration: how long the user has experienced the symptoms
severity: mild, moderate, or severe
medicationsMentioned: list of any medicines mentioned
recommendations: list of AI suggestions (e.g., rest, see a doctor)
Return the result in this JSON format:
{
  "sessionId": "string",
  "agent": "string",
  "user": "string",
  "timestamp": "ISO Date string",
  "chiefComplaint": "string",
  "summary": "string",
  "symptoms": ["symptom1", "symptom2"],
  "duration": "string",
  "severity": "string",
  "medicationsMentioned": ["med1", "med2"],
  "recommendations": ["rec1", "rec2"]
}
Only include valid fields. Respond with nothing else.
`;

export async function POST(req: NextRequest) {
  const { sessionId, sessionDetail, messages } = await req.json();
  console.log("Received data for report generation:", {
    messages,
    sessionDetail,
    sessionId,
  });
  try {
    const UserInput="AI Doctor Agent Info: "+JSON.stringify(sessionDetail)+", Conversation"+JSON.stringify(messages);
    const completion = await openai.chat.completions.create({
      model: "gemini-2.5-flash",
      messages: [
        { role: "system",content:REPORT_GEN_PROMPT  },
        {
          role: "user",
          content:UserInput
        }
      ],
    });

    const rawresponse = completion.choices[0].message;
    //@ts-ignore
    const Resp=rawresponse.content.trim().replace('```json','').replace('```','');
    const JSONResp=JSON.parse(Resp);
    //save to DB
    const result = await db
  .update(sessionChatTable)
  .set({ report: JSONResp ,
    conversation: messages
  })
  .where(eq(sessionChatTable.sessionId, sessionId))
  .returning({ id: sessionChatTable.sessionId });

    console.log("Update result:", result);

    return NextResponse.json( JSONResp );
  } catch (err) {
    console.error("Error generating report:", err);
    return NextResponse.json(err);
  }
}
