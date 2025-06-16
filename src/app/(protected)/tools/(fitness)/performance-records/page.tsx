"use client";
import { useState } from "react";
import PRList from "././components/PRList";
import AddPRModal from "./modals/AddPRModal";

export default function PerformanceRecordsPage() {
  const [modalOpen, setModalOpen] = useState(false);
  // Placeholder data for PRs
  const dummyPRs = [
    { id: 1, modality: "Resistance Training", event: "Bench Press 3RM", value: "250 lbs", date: "2024-06-01", notes: "Felt strong!" },
    { id: 2, modality: "Endurance", event: "5 Mile Run", value: "35:42", date: "2024-05-20", notes: "Personal best." },
    { id: 3, modality: "Real World", event: "Hiked Mt. Whitney", value: "14,505 ft", date: "2023-09-10", notes: "Epic day." },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Performance Records</h1>
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-blue-500 dark:hover:bg-blue-600"
          onClick={() => setModalOpen(true)}
        >
          Add Record
        </button>
      </div>
      <PRList prs={dummyPRs} />
      <AddPRModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
