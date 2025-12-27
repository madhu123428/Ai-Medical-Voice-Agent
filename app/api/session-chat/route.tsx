import { db } from "@/config/db";
import { sessionChatTable } from "@/config/schema";
import { currentUser } from "@clerk/nextjs/server";
import { eq, desc } from "drizzle-orm";

import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  const { note, selectedDoctor } = await request.json();
  const user = await currentUser();
  
  try {
    const sessionId = uuidv4();
    //@ts-ignore
    const result = await db.insert(sessionChatTable).values({
      sessionId: sessionId,
      createdBy: user?.primaryEmailAddress?.emailAddress,
      note: note,
      selectedDoctor: selectedDoctor,
      createdOn: (new Date()).toString()
    }).returning(); // Just use returning() without arguments, or specify fields like .returning({ sessionId: sessionChatTable.sessionId })
    
    // Return the first result with sessionId
        return NextResponse.json({
          ...result[0],
          sessionId: result[0]?.sessionId || sessionId,
        });
    
  } catch (e) {
    console.error("❌ Error creating session:", e);
    return NextResponse.json(
      { error: "Failed to create session", details: e }, 
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionId');
    const user = await currentUser();
    
    if (!sessionId) {
      return NextResponse.json(
        { error: "sessionId is required" }, 
        { status: 400 }
      );
    }
    if (sessionId == 'all') {

    const result = await db
      .select()
      .from(sessionChatTable)
      //@ts-ignore
      .where(eq(sessionChatTable.createdBy, user?.primaryEmailAddress?.emailAddress))
      .orderBy(desc(sessionChatTable.id));

    if (!result || result.length === 0) {
      return NextResponse.json(
        { error: "Session not found" }, 
        { status: 404 }
      );
    }
    
    return NextResponse.json(result);
  } else {
     const result = await db
      .select()
      .from(sessionChatTable)
      .where(eq(sessionChatTable.sessionId, sessionId));
    
    if (!result || result.length === 0) {
      return NextResponse.json(
        { error: "Session not found" }, 
        { status: 404 }
      );
    }

    return NextResponse.json(result[0]);
  }
    
  } catch (e) {
    console.error("❌ Error fetching session:", e);
    return NextResponse.json(
      { error: "Failed to fetch session", details: e }, 
      { status: 500 }
    );
  }
}