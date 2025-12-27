"use client";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { doctorAgent } from "../../_components/DoctorAgentCard";
import { Circle, Loader, PhoneCall, PhoneOff } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Vapi from "@vapi-ai/web";
import { toast } from "sonner";

export type SessionDetail = {
  id: number;
  note: string;
  sessionId: string;
  report: Record<string, any>;
  selectedDoctor: doctorAgent;
  createdOn: string;
};
type message = {
  role: string;
  text: string;
};

function MedicalVoiceAgent() {
  const { sessionId } = useParams();
  console.log("params:", sessionId);
  const [sessionDetail, setSessionDetail] = useState<SessionDetail>();
  const [callStarted, setCallStarted] = useState(false);
  const [vapiInstance, setVapiInstance] = useState<any>();
  const [currentRole, setCurrentRole] = useState<string | null>();
  const [liveTranscript, setLiveTranscript] = useState<string>("");
  const [messages, setMessages] = useState<Array<message>>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();
  useEffect(() => {
    sessionId && GetSessionDetails();
  }, [sessionId]);

  const GetSessionDetails = async () => {
    const result = await axios.get("/api/session-chat?sessionId=" + sessionId);
    console.log(result.data);
    setSessionDetail(result.data);
  };
  const StartCall = () => {
    console.log(location.protocol)
    
    const vapi = new Vapi(process.env.NEXT_PUBLIC_VAPI_API_KEY!);
    setVapiInstance(vapi);

    // const VapiAgentConfig = {
    //   name: "Medical Voice Agent",
    //   firstMessage:
    //     "Hello, I am your AI medical assistant. How can I help you today?",
    //   transcriber: {
    //     provider: "assembly-ai",
    //     language: "en",
    //   },
    //   voice: {
    //     provider: "elevenlabs",
    //     voiceId: sessionDetail?.selectedDoctor.voiceId,
    //   },
    //   model: {
    //     provider: "openai",
    //     model: "gpt-4o-mini",
    //     systemPrompt:
    //       sessionDetail?.selectedDoctor.agentPrompt ||
    //       "You are a helpful medical AI assistant.",
    //   },
    // };
    //@ts-ignore

    vapi.start(process.env.NEXT_PUBLIC_VAPI_VOICE_ASSISTANT_ID);
    vapi.on("call-start", () => {
      console.log("Call started");
      setCallStarted(true);
    });
    vapi.on("call-end", () => {
      setCallStarted(false);
      console.log("Call ended");
    });
    vapi.on("message", (message) => {
      const { role, transcriptType, transcript } = message;
      if (message.type === "transcript") {
        console.log(`${message.role}: ${message.transcript}`);
        if (transcriptType === "partial") {
          setLiveTranscript(transcript);
          setCurrentRole(role);
        } else if (transcriptType === "final") {
          setMessages((prev: any) => [
            ...prev,
            { role: role, text: transcript },
          ]);
          setLiveTranscript("");
          setCurrentRole(null);
        }
      }
    });
    vapi.on("speech-start", () => {
      console.log("Assistant started speaking");
      setCurrentRole("assistant");
    });
    vapi.on("speech-end", () => {
      console.log("Assistant stopped speaking");
      setCurrentRole("user");
    });
  };
  const endCall = async () => {
  if (!vapiInstance) return;

  try {
    setLoading(true);
    console.log("🛑 End call triggered");

    // 1️⃣ Generate report FIRST (critical)
    console.log("📄 Generating report...");
    const report = await GenerateReport();
    console.log("✅ Report generated:", report);

    // 2️⃣ Stop Vapi AFTER report is done
    vapiInstance.stop();
    vapiInstance.off("call-start");
    vapiInstance.off("call-end");
    vapiInstance.off("message");

    // 3️⃣ Reset state
    setCallStarted(false);
    setVapiInstance(null);
    toast.success("Call ended and report generated successfully!");
     setTimeout(() => {
      router.replace("/dashboard");
    }, 0);
    console.log("✅ Call ended and state reset");
  } catch (err) {
    console.error("❌ Error ending call:", err);
  } finally {
    setLoading(false);
  }
};



  const GenerateReport=async ()=>{
    console.log("Generating report from messages:", messages);
    // Implement report generation logic here
    const result = await axios.post("/api/medical-report", {
      messages: messages,
      sessionDetail: sessionDetail,
      sessionId: sessionId
    });
    console.log("this is called")
    console.log("Report generation result:", result.data);
    return result.data;
  }

  return (
    <div className="p-5 border rounded-3xl bg-secondary">
      <div className="flex justify-between items-center">
        <h2 className="p-1 px-2 border rounded-md flex gap-2 items-center">
          {" "}
          <Circle
            className={`h-4 w-4 rounded-full ${
              callStarted ? "bg-green-500" : "bg-red-500"
            }`}
          />
          {callStarted ? "Connected..." : "Not Connected"}
        </h2>
        <h2 className="font-bold text-xl text-gray-400">00:00</h2>
      </div>
      {sessionDetail && (
        <div className="flex items-center flex-col mt-10">
          <Image
            src={sessionDetail?.selectedDoctor?.image}
            alt={sessionDetail?.selectedDoctor?.specialist ?? ""}
            width={80}
            height={80}
            className="h-[100px] w-[100px] object-cover rounded-full"
          />
          <h2 className="mt-2 text-lg">
            {sessionDetail?.selectedDoctor?.specialist}
          </h2>
          <p className="text-sm text-gray-400">AI Medical Voice Agent </p>

          <div className="mt-12 overflow-y-auto h-64 w-full border p-4 rounded-lg bg-gray-100">
            {messages?.slice(-4).map((msg: message, index) => (
              <h2 key={index} className="text-gray-400 p-2">
                {msg.role}:{msg.text}
              </h2>
            ))}
            <h2 className="text-gray-400">Assistant msg</h2>
            {liveTranscript && liveTranscript?.length > 0 && (
              <h2 className="text-lg">
                {currentRole}:{liveTranscript}
              </h2>
            )}
          </div>

          {!callStarted ? (
            <Button className="mt-20" onClick={StartCall} disabled={loading}>
              {loading? <Loader className="animate-spin mr-2 h-4 w-4"/>: <PhoneCall />}
               Start Call
            </Button>
          ) : (
            <Button variant={"destructive"} onClick={endCall} disabled={loading} className="mt-20">
              {loading? <Loader className="animate-spin mr-2 h-4 w-4"/>: <PhoneOff />}
              Disconnect
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

export default MedicalVoiceAgent;
