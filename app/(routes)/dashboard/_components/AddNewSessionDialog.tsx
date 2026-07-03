"use client";
import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { DialogClose } from "@radix-ui/react-dialog";
import { ArrowRight, Loader2 } from "lucide-react";
import axios from "axios";
import { doctorAgent } from "./DoctorAgentCard";
import SuggestedDoctorCard from "./SuggestedDoctorCard";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { SessionDetail } from "../medical-agent/[sessionId]/page";

type Step = "symptoms" | "doctors";

export default function AddNewSessionDialog() {
  // ---------------- STATE ----------------
  const [note, setNote] = useState("");
  const [open, setOpen] = useState(false);

  const [fetchingDoctors, setFetchingDoctors] = useState(false);
  const [startingSession, setStartingSession] = useState(false);

  const [suggestedDoctors, setSuggestedDoctors] = useState<doctorAgent[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<doctorAgent | null>(null);

  const [step, setStep] = useState<Step>("symptoms");

  const [historyList, setHistoryList] = useState<SessionDetail[]>([]);

  const router = useRouter();
  const { has } = useAuth();
  // @ts-ignore
  const paidUser = has && has({ plan: "pro" });

  // ---------------- HISTORY ----------------
  useEffect(() => {
    GetHistoryList();
  }, []);

  const GetHistoryList = async () => {
    const result = await axios.get("/api/session-chat?sessionId=all");
    setHistoryList(result.data);
  };

  // ---------------- RESET ----------------
  const resetDialog = () => {
    setNote("");
    setSuggestedDoctors([]);
    setSelectedDoctor(null);
    setStep("symptoms");
  };

  // ---------------- FETCH DOCTORS ----------------
  const onClickNext = async () => {
    if (!note.trim()) return;

    try {
      setFetchingDoctors(true);

      const res = await axios.post("/api/suggest-doctors", {
        notes: note,
      });

      const doctors = Array.isArray(res.data?.suggestedDoctors)
        ? res.data.suggestedDoctors
        : [];

      setSuggestedDoctors(doctors);
      setStep("doctors"); // ✅ explicit step change
    } catch (err) {
      console.error("❌ Failed to fetch doctors:", err);
    } finally {
      setFetchingDoctors(false);
    }
  };

  // ---------------- START SESSION ----------------
  const onStartConsultation = async () => {
    if (!selectedDoctor) return;

    try {
      setStartingSession(true);

      const res = await axios.post("/api/session-chat", {
        note,
        selectedDoctor,
      });

      if (res.data?.sessionId) {
        router.push("/dashboard/medical-agent/" + res.data.sessionId);
      }
    } catch (err) {
      console.error("❌ Failed to start session:", err);
    } finally {
      setStartingSession(false);
    }
  };

  // ---------------- UI ----------------
  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) resetDialog();
      }}
    >
      <DialogTrigger asChild>
        <Button
          className="mt-3"
          disabled={process.env.NODE_ENV !== "development" && !paidUser && historyList?.length >= 1}
        >
          + Book a Consultation
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Basic Details</DialogTitle>
          <DialogDescription>
            Describe your symptoms or choose a doctor
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          {step === "symptoms" ? (
            <>
              <h2 className="font-semibold">Add Symptoms</h2>
              <Textarea
                className="mt-2 h-[200px]"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Describe your symptoms clearly..."
              />
            </>
          ) : (
            <>
              <h2 className="mb-3 font-semibold">Select the Doctor</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {suggestedDoctors.map((doctor) => (
                  <SuggestedDoctorCard
                    key={doctor.id}
                    doctorAgent={doctor}
                    isSelected={selectedDoctor?.id === doctor.id}
                    onSelect={setSelectedDoctor}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>

          {step === "symptoms" ? (
            <Button
              disabled={!note.trim() || fetchingDoctors}
              onClick={onClickNext}
            >
              Next
              {fetchingDoctors ? (
                <Loader2 className="ml-2 animate-spin" />
              ) : (
                <ArrowRight className="ml-2" />
              )}
            </Button>
          ) : (
            <Button
              disabled={!selectedDoctor || startingSession}
              onClick={onStartConsultation}
            >
              Start Consultation
              {startingSession ? (
                <Loader2 className="ml-2 animate-spin" />
              ) : (
                <ArrowRight className="ml-2" />
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
