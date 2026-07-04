"use client";
import React, { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { IconArrowRight } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@clerk/nextjs";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Loader2Icon } from "lucide-react";

export type doctorAgent = {
  id: number;
  specialist: string;
  description: string;
  image: string;
  agentPrompt: string;
  voiceId?: string;
  subscriptionRequired: boolean;
};
type props = {
  doctorAgent: doctorAgent;
};

function DoctorAgentCard({ doctorAgent }: props) {
  const [startingSession, setStartingSession] = useState(false);
  const router = useRouter();
  const { has } = useAuth();
  //@ts-ignore
  const paidUser = has && has({ plan: "pro" });
  console.log("Paid User:", paidUser);

  const onStartConsultation = async () => {
    if (!doctorAgent) {
      console.warn("⚠️ No doctor selected");
      return;
    }

    console.log("➡️ Starting session");
    console.log("👨‍⚕️ Selected doctor:", doctorAgent);

    try {
      setStartingSession(true);

      const res = await axios.post("/api/session-chat", {
        note: "New Consultation",
        selectedDoctor: doctorAgent,
      });

      console.log("✅ Session API response:", res.data);

      if (res.data?.sessionId) {
        console.log("🎉 Session created:", res.data.sessionId);
        router.push("/dashboard/medical-agent/" + res.data.sessionId);
      }
    } catch (err) {
      console.error("❌ Failed to start session:", err);
    } finally {
      setStartingSession(false);
    }
  };

  return (
    <div>
      <div className="relative w-full h-[250px] rounded-xl overflow-hidden">
        {doctorAgent.subscriptionRequired && (
          <Badge className="absolute top-2 right-2 z-10">Premium</Badge>
        )}

        <Image
          src={doctorAgent.image}
          alt={doctorAgent.specialist}
          fill
          className="object-cover"
        />
      </div>

      <h2 className="font-bold text-lg mt-1">{doctorAgent.specialist}</h2>
      <p className="line-clamp-2 mt-1 text-sm text-gray-500">
        {doctorAgent.description}
      </p>
      <Button
        className=" w-full mt-2"
        onClick={onStartConsultation}
      >
        {" "}
        Start Consultation{" "}
        {startingSession ? (
          <Loader2Icon className="ml-2 animate-spin" />
        ) : (
          <IconArrowRight />
        )}
      </Button>
    </div>
  );
}

export default DoctorAgentCard;
