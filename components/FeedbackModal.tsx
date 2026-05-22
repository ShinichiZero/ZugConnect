"use client";

import { useState, useEffect } from "react";
import { MessageSquare, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export default function FeedbackModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [metrics, setMetrics] = useState({ scale: 1, locale: "en-US" });

  useEffect(() => {
    if (typeof window !== "undefined") {
      setMetrics({
        scale: window.devicePixelRatio || 1,
        locale: navigator.language || "en-US",
      });
    }
  }, [isOpen]);

  const toggleModal = () => setIsOpen(!isOpen);

  const issueBody = `### User Environment
- Device Pixel Ratio: ${metrics.scale}
- Locale: ${metrics.locale}
- User Agent: ${typeof navigator !== "undefined" ? navigator.userAgent : "Unknown"}

### Feedback
📝 Please enter your feedback here:

`;

  const githubUrl = `https://github.com/USERNAME/zugconnect/issues/new?title=User%20Feedback&body=${encodeURIComponent(
    issueBody
  )}`;

  return (
    <>
      <button
        onClick={toggleModal}
        className="fixed bottom-6 right-4 tap-target bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-blue-700 transition"
        aria-label="Open Feedback Modal"
        aria-expanded={isOpen}
      >
        <MessageSquare size={24} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          >
            <motion.div
              layoutId="feedback-modal"
              className="bg-background w-full max-w-sm rounded-2xl shadow-xl overflow-hidden flex flex-col"
              role="dialog"
              aria-modal="true"
              aria-labelledby="feedback-title"
            >
              <div className="p-4 border-b flex justify-between items-center">
                <h2 id="feedback-title" className="text-lg font-semibold">
                  Send Feedback
                </h2>
                <button
                  onClick={toggleModal}
                  className="tap-target flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                  aria-label="Close Feedback Modal"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 flex flex-col gap-4">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Help us improve ZugConnect! Your device metrics (locale, scaling) will be included to help diagnose issues.
                </p>
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 text-xs font-mono text-gray-500 overflow-hidden text-ellipsis whitespace-nowrap">
                  Scale: {metrics.scale}x | Locale: {metrics.locale}
                </div>
                <a
                  href={githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "tap-target flex items-center justify-center w-full",
                    "bg-blue-600 text-white font-medium rounded-xl",
                    "hover:bg-blue-700 active:scale-95 transition-transform"
                  )}
                >
                  Create GitHub Issue
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
