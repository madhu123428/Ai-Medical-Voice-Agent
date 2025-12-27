"use client";

import React from "react";
import Image from "next/image";
import type { doctorAgent } from "./DoctorAgentCard";

type Props = {
  doctorAgent: doctorAgent;
  isSelected: boolean;
  onSelect: (doctor: doctorAgent) => void;
};

function SuggestedDoctorCard({ doctorAgent, isSelected, onSelect }: Props) {
  return (
    <div
      onClick={() => onSelect(doctorAgent)}
      className={`flex flex-col items-center border rounded-2xl shadow p-5 cursor-pointer space-y-2
        ${isSelected ? "border-blue-500 ring-2 ring-blue-400" : "hover:border-gray-500"}
      `}
    >
      {/* 🔒 Safe image rendering */}
      {doctorAgent.image && (
        <Image
          src={doctorAgent.image}
          alt={doctorAgent.specialist ?? "Doctor"}
          width={70}
          height={70}
          className="w-[50px] h-[50px] object-cover rounded-full"
        />
      )}

      <h2 className="text-sm font-bold text-center">
        {doctorAgent.specialist ?? "Unknown Specialist"}
      </h2>

      <p className="text-xs text-gray-500 text-center">
        {doctorAgent.description ?? "No description available"}
      </p>
    </div>
  );
}

export default SuggestedDoctorCard;
