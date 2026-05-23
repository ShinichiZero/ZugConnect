"use client";

import { useEffect, useRef, useState } from "react";
import { X, HelpCircle } from "lucide-react";

const STEPS = [
  {
    title: "Choose your station",
    body: "Type the station name in the search box and pick the correct station from the list.",
  },
  {
    title: "Select a day",
    body: "Use the day selector to choose Today or another service date.",
  },
  {
    title: "Pick a train",
    body: "Select a departure card to expand it and see the full list of stops and platforms.",
  },
  {
    title: "Plan your transfer",
    body: "Use the stop list to see times and platforms. If you need help, open Feedback to report accessibility issues.",
  },
];

export default function GuideModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const nextButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setIndex(0);
      setTimeout(() => nextButtonRef.current?.focus(), 10);
    }
  }, [isOpen]);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        className="tap-target p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors"
        aria-label="Open step-by-step guide"
      >
        <HelpCircle size={18} />
      </button>

      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="guide-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
        >
          <div className="bg-background w-full max-w-lg rounded-2xl shadow-xl overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 id="guide-title" className="text-lg font-semibold">
                Step-by-step Guide
              </h2>
              <button
                ref={closeButtonRef}
                onClick={() => setIsOpen(false)}
                className="tap-target rounded-full p-1 hover:bg-gray-100 dark:hover:bg-gray-800"
                aria-label="Close guide"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-base">{STEPS[index].title}</h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{STEPS[index].body}</p>
            </div>
            <div className="p-4 border-t flex justify-between gap-2">
              <button
                onClick={() => setIndex((i) => Math.max(0, i - 1))}
                disabled={index === 0}
                className="tap-target px-3 py-2 rounded-md border bg-white text-sm disabled:opacity-40"
              >
                Previous
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => setIndex((i) => Math.min(STEPS.length - 1, i + 1))}
                  ref={nextButtonRef}
                  className="tap-target px-3 py-2 rounded-md bg-blue-600 text-white text-sm"
                >
                  {index === STEPS.length - 1 ? "Done" : "Next"}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="tap-target px-3 py-2 rounded-md border bg-white text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
