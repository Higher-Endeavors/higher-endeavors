'use client';

import React, { useState, useEffect } from 'react';
import { ReferenceLift } from '@/types/referenceLift';

export default function ReferenceLiftsList() {
  const [referenceLifts, setReferenceLifts] = useState<ReferenceLift[]>([]);

  useEffect(() => {
    fetchReferenceLifts();
  }, []);

  const fetchReferenceLifts = async () => {
    const response = await fetch('/api/reference-lifts');
    const data = await response.json();
    setReferenceLifts(data);
  };

  const handleDelete = async (id: number) => {
    await fetch(`/api/reference-lifts?id=${id}`, { method: 'DELETE' });
    fetchReferenceLifts();
  };

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4">Reference Lifts List</h2>
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="border p-2">Exercise Name</th>
            <th className="border p-2">Reference Load</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {referenceLifts.map((lift) => (
            <tr key={lift.id}>
              <td className="border p-2">{lift.exercise_name}</td>
              <td className="border p-2">{lift.struct_bal_ref_lift_load}</td>
              <td className="border p-2">
                <button
                  className="bg-red-500 text-white px-2 py-1 rounded"
                  onClick={() => handleDelete(lift.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
