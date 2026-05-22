"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface Stop {
  name: string;
  time: string;
}

interface RouteProps {
  id: string;
  destination: string;
  departure: string;
  delay?: number;
  stops: Stop[];
}

export default function RouteCard({ route }: { route: RouteProps }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div
      layoutId={`route-card-${route.id}`}
      className={cn(
        "bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden mb-4",
        "cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
      )}
      onClick={() => setIsExpanded(!isExpanded)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") setIsExpanded(!isExpanded);
      }}
      tabIndex={0}
      role="button"
      aria-expanded={isExpanded}
      aria-controls={`route-details-${route.id}`}
    >
      <motion.div
        layoutId={`route-header-${route.id}`}
        className="p-4 tap-target flex items-center justify-between"
      >
        <div className="flex flex-col">
          <span className="text-sm text-gray-500 font-medium">To</span>
          <span className="text-xl font-bold flex items-center gap-2">
            {route.destination}
          </span>
        </div>
        <div className="text-right flex flex-col items-end">
          <span className="text-sm text-gray-500 font-medium font-mono">
            {route.departure}
          </span>
          {route.delay ? (
            <span
              className="text-sm font-semibold text-red-500"
              aria-live="polite"
            >
              +{route.delay} min
            </span>
          ) : (
            <span
              className="text-sm font-semibold text-green-500"
              aria-live="polite"
            >
              On time
            </span>
          )}
        </div>
      </motion.div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            id={`route-details-${route.id}`}
            layoutId={`route-content-${route.id}`}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="px-4 pb-4 border-t border-gray-100 dark:border-gray-800"
          >
            <div className="pt-4 flex flex-col gap-4 relative">
              {/* Vertical line connecting stops */}
              <div className="absolute left-[11px] top-6 bottom-2 w-0.5 bg-gray-200 dark:bg-gray-800" />
              
              {route.stops.map((stop, i) => (
                <div key={i} className="flex relative z-10 items-start gap-4">
                  <div className="bg-white dark:bg-gray-900 p-1 mt-0.5 rounded-full border-2 border-blue-500">
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold">{stop.name}</span>
                    <span className="text-sm text-gray-500 font-mono">
                      {stop.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}