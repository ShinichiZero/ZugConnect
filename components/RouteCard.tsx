"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface Stop {
  name: string;
  time: string;
  plannedTime?: string;
  platform?: string;
  plannedPlatform?: string;
}

interface RouteProps {
  id: string;
  destination: string;
  departure: string;
  plannedDeparture?: string;
  delay?: number;
  lineName?: string;
  operator?: string;
  platform?: string;
  plannedPlatform?: string;
  isCancelled?: boolean;
  stops: Stop[];
}

export default function RouteCard({ route }: { route: RouteProps }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const ariaLabel = `${route.isCancelled ? "Cancelled " : ""}Departure to ${route.destination} at ${route.departure}${route.platform ? `, platform ${route.platform}` : ""}${route.delay && route.delay > 0 ? `, delayed ${route.delay} minutes` : ", on time"}`;

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
      aria-label={ariaLabel}
    >
      <motion.div
        layoutId={`route-header-${route.id}`}
        className="p-4 tap-target flex items-start justify-between"
      >
        <div className="flex flex-col flex-1 min-w-0 pr-4">
          <span className="text-sm text-gray-500 font-medium">To</span>
          <h3
            className={cn(
              "text-xl font-bold flex items-center gap-2 truncate",
              route.isCancelled && "line-through text-gray-400"
            )}
          >
            {route.destination}
          </h3>
          {route.stops && route.stops.length > 0 && (
            <div className="mt-1 text-sm text-gray-600 dark:text-gray-400 truncate">
              <span className="opacity-75">via </span>
              {route.stops
                .filter(s => s.name !== route.destination)
                .map(s => s.name)
                .join(" - ")}
            </div>
          )}
          {(route.lineName || route.operator) && (
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-500">
              {route.lineName && (
                <span className="rounded-full bg-blue-50 px-2 py-0.5 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                  {route.lineName}
                </span>
              )}
              {route.operator && <span>{route.operator}</span>}
            </div>
          )}
        </div>
        <div className="text-right flex flex-col items-end flex-shrink-0">
          <span className="text-sm text-gray-500 font-medium font-mono">
            {route.departure}
          </span>
          {route.plannedDeparture &&
            route.plannedDeparture !== route.departure && (
              <span className="text-xs text-gray-400 line-through font-mono">
                {route.plannedDeparture}
              </span>
            )}
          {route.isCancelled ? (
            <span className="text-sm font-semibold text-red-500" aria-live="polite">
              Cancelled
            </span>
          ) : route.delay && route.delay > 0 ? (
            <span className="text-sm font-semibold text-red-500" aria-live="polite">
              +{route.delay} min
            </span>
          ) : (
            <span className="text-sm font-semibold text-green-500" aria-live="polite">
              On time
            </span>
          )}
          {route.platform && (
            <span className="text-xs font-semibold text-gray-500">
              Pl. {route.platform}
              {route.plannedPlatform && route.plannedPlatform !== route.platform
                ? ` (sched ${route.plannedPlatform})`
                : ""}
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
              {/* Vertical line connecting stops (decorative) */}
              <div aria-hidden className="absolute left-[11px] top-6 bottom-2 w-0.5 bg-gray-200 dark:bg-gray-800" />

              <ol className="relative z-10 flex flex-col gap-3 list-none" aria-label="Stops along this route">
                {route.stops.map((stop, i) => (
                  <li key={i} className="flex relative items-start gap-4">
                    <div className="bg-white dark:bg-gray-900 p-1 mt-0.5 rounded-full border-2 border-blue-500" aria-hidden>
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-semibold truncate">{stop.name}</span>
                      <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500 font-mono">
                        <span>{stop.time}</span>
                        {stop.plannedTime && stop.plannedTime !== stop.time && (
                          <span className="text-gray-400 line-through">
                            {stop.plannedTime}
                          </span>
                        )}
                        {stop.platform && (
                          <span className="text-xs font-semibold text-gray-500">
                            Pl. {stop.platform}
                            {stop.plannedPlatform && stop.plannedPlatform !== stop.platform
                              ? ` (sched ${stop.plannedPlatform})`
                              : ""}
                          </span>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}