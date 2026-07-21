import { db } from "@/config/db";
import { sessionChatTable } from "@/config/schema";
import { currentUser } from "@clerk/nextjs/server";
import { eq, desc, and } from "drizzle-orm";

import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  const { note, selectedDoctor } = await request.json();
  const user = await currentUser();
  const userEmail = user?.primaryEmailAddress?.emailAddress;
  
  if (!userEmail) {
    return NextResponse.json(
      { error: "Unauthorized" }, 
      { status: 401 }
    );
  }

  try {
    const sessionId = uuidv4();
    //@ts-ignore
    const result = await db.insert(sessionChatTable).values({
      sessionId: sessionId,
      createdBy: userEmail,
      note: note,
      selectedDoctor: selectedDoctor,
      createdOn: (new Date()).toString()
    }).returning();
    
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
    const userEmail = user?.primaryEmailAddress?.emailAddress;
    
    if (!userEmail) {
      return NextResponse.json(
        { error: "Unauthorized" }, 
        { status: 401 }
      );
    }

    if (!sessionId) {
      return NextResponse.json(
        { error: "sessionId is required" }, 
        { status: 400 }
      );
    }

    if (sessionId === 'all') {
      const result = await db
        .select()
        .from(sessionChatTable)
        .where(eq(sessionChatTable.createdBy, userEmail))
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
        .where(
          and(
            eq(sessionChatTable.sessionId, sessionId),
            eq(sessionChatTable.createdBy, userEmail)
          )
        );
      
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