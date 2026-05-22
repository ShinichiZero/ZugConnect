"use client";

import { useQuery } from "@tanstack/react-query";
import RouteCard from "@/components/RouteCard";
import LayoutSkeleton from "@/components/LayoutSkeleton";
import { Train, AlertTriangle, RefreshCw } from "lucide-react";
import { useState } from "react";
import { fetchDepartures, DBDeparture } from "../lib/api";

const STATIONS = [
  { id: "8011160", name: "Berlin Hbf" },
  { id: "8002549", name: "Hamburg Hbf" },
  { id: "8000261", name: "München Hbf" }
];

export default function Home() {
  const [stationId, setStationId] = useState(STATIONS[0].id);

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["departures", stationId],
    queryFn: () => fetchDepartures(stationId),
  });

  return (
    <div className="flex flex-col w-full flex-1">
      <header className="mb-6 mt-2 flex justify-between items-start">
        <div className="flex items-start gap-3 relative z-10 w-full">
          <div className="p-2 mb-2 bg-blue-100 text-blue-600 rounded-xl dark:bg-blue-900/30 dark:text-blue-400">
            <Train size={28} />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold tracking-tight">ZugConnect</h1>
            <select 
              className="mt-1 block w-full max-w-[200px] bg-gray-50 border border-gray-200 text-gray-700 py-1 px-2 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300"
              value={stationId}
              onChange={(e) => setStationId(e.target.value)}
              aria-label="Select Station"
            >
              {STATIONS.map((st) => (
                <option key={st.id} value={st.id}>{st.name}</option>
              ))}
            </select>
          </div>
          <button 
            onClick={() => refetch()} 
            disabled={isFetching}
            className="tap-target p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors disabled:opacity-50"
            aria-label="Refresh departures"
          >
            <RefreshCw size={20} className={isFetching ? "animate-spin" : ""} />
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto pb-24 relative z-0">
        <div className="flex justify-between items-center mb-4 px-1">
          <h2 className="text-lg font-semibold">Live Departures</h2>
          {data?.isOffline && (
            <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-500 px-2 py-1 rounded-md" aria-live="polite">
              <AlertTriangle size={14} />
              <span>Offline / Mock Mode</span>
            </div>
          )}
        </div>
        
        {isLoading && <LayoutSkeleton />}
        
        {isError && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-sm" aria-live="polite">
            <p className="font-semibold">Unable to fetch routes</p>
            <p>{(error as Error).message}</p>
          </div>
        )}

        {data?.departures && data.departures.length === 0 && (
          <p className="text-gray-500 py-4 px-1" aria-live="polite">No departures found in the next 30 minutes.</p>
        )}

        <div className="flex flex-col gap-1">
          {data?.departures?.map((dep) => {
            const time = new Date(dep.when).toLocaleTimeString(undefined, {
              hour: "2-digit",
              minute: "2-digit",
            });
            const delayMin = dep.delay ? Math.round(dep.delay / 60) : 0;
            
            // Map stopovers gracefully if they exist
            const stops = (dep.stopovers || []).slice(1, 5).map(s => ({
              name: s.stop?.name || "Unknown Station",
              time: s.departure ? new Date(s.departure).toLocaleTimeString(undefined, {
                hour: "2-digit",
                minute: "2-digit",
              }) : "--:--",
            }));

            // Fallback stops if stopovers not provided
            if (stops.length === 0) {
              stops.push({ name: dep.direction, time: "End" });
            }

            return (
              <RouteCard
                key={dep.tripId}
                route={{
                  id: dep.tripId,
                  destination: dep.direction,
                  departure: time,
                  delay: delayMin > 0 ? delayMin : undefined,
                  stops: stops,
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
