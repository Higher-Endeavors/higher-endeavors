import React from "react";
import { HiOutlineX } from "react-icons/hi";

export default function AddPRModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-slate-700 rounded-lg shadow-lg w-full max-w-md p-0 relative">
        <div className="flex items-center justify-between px-6 pt-6 pb-2 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold dark:text-white">Add Performance Record</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="ml-2 p-2 rounded-full text-gray-400 hover:text-gray-600 dark:text-gray-300 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <HiOutlineX className="w-5 h-5" />
          </button>
        </div>
        <form className="px-6 pt-4 pb-2 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-white" htmlFor="modality">Modality</label>
            <input id="modality" className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-200 dark:text-white dark:placeholder-gray-400 p-2" placeholder="e.g. Resistance Training" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-white" htmlFor="event">Event</label>
            <input id="event" className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-200 dark:text-white dark:placeholder-gray-400 p-2" placeholder="e.g. Bench Press 3RM" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-white" htmlFor="value">Value</label>
            <input id="value" className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-200 dark:text-white dark:placeholder-gray-400 p-2" placeholder="e.g. 250 lbs" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-white" htmlFor="date">Date</label>
            <input id="date" type="date" className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-200 dark:text-white p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-white" htmlFor="notes">Notes</label>
            <textarea id="notes" className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-200 dark:text-white dark:placeholder-gray-400 p-2" placeholder="Optional notes..." />
          </div>
          <div className="flex justify-end space-x-3 pt-2 pb-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              Save Record
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
