"use client";

import { useQuery } from "@tanstack/react-query";
import RouteCard from "@/components/RouteCard";
import LayoutSkeleton from "@/components/LayoutSkeleton";
import { Train, RefreshCw, Search } from "lucide-react";
import GuideModal from "@/components/GuideModal";
import { useEffect, useMemo, useState } from "react";
import { fetchDepartures } from "../lib/api";
import { MAJOR_DB_STATIONS, searchStations, Station } from "../lib/stations";

const SERVICE_TIME_ZONE = "Europe/Berlin";

const serviceDateFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: SERVICE_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const labelDateFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: SERVICE_TIME_ZONE,
  weekday: "short",
  day: "numeric",
  month: "short",
});

const formatServiceDate = (isoString: string) =>
  serviceDateFormatter.format(new Date(isoString));

const diffServiceDays = (a: string, b: string) => {
  const [ay, am, ad] = a.split("-").map(Number);
  const [by, bm, bd] = b.split("-").map(Number);
  const aUtc = Date.UTC(ay, am - 1, ad);
  const bUtc = Date.UTC(by, bm - 1, bd);
  return Math.round((aUtc - bUtc) / 86_400_000);
};

const makeDateLabel = (isoString: string) => {
  const depDate = formatServiceDate(isoString);
  const nowDate = serviceDateFormatter.format(new Date());
  const diffDays = diffServiceDays(depDate, nowDate);

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  return labelDateFormatter.format(new Date(isoString));
};

export default function Home() {
  const [selectedStation, setSelectedStation] = useState<Station>(
    MAJOR_DB_STATIONS[0]
  );
  const [stationQuery, setStationQuery] = useState(MAJOR_DB_STATIONS[0].name);
  const [isAutocompleteOpen, setIsAutocompleteOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");

  const stationMatches = useMemo(
    () => searchStations(stationQuery),
    [stationQuery]
  );

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["departures", selectedStation.id],
    queryFn: () => fetchDepartures(selectedStation.id),
  });

  const departures = useMemo(() => data?.departures ?? [], [data?.departures]);

  const dateOptions = useMemo(() => {
    const seen = new Map<string, string>();
    departures.forEach((dep) => {
      const key = formatServiceDate(dep.when);
      if (!seen.has(key)) {
        seen.set(key, makeDateLabel(dep.when));
      }
    });
    return Array.from(seen, ([value, label]) => ({ value, label }));
  }, [departures]);

  useEffect(() => {
    if (!dateOptions.length) return;
    if (!dateOptions.some((option) => option.value === selectedDate)) {
      setSelectedDate(dateOptions[0].value);
    }
  }, [dateOptions, selectedDate]);

  const trainsForDay = useMemo(() => {
    if (!selectedDate) return departures;
    return departures.filter(
      (dep) => formatServiceDate(dep.when) === selectedDate
    );
  }, [departures, selectedDate]);

  function selectStation(station: Station) {
    setSelectedStation(station);
    setStationQuery(station.name);
    setIsAutocompleteOpen(false);
  }

  return (
    <div className="flex flex-col w-full flex-1">
      <header className="mb-6 mt-2 flex justify-between items-start">
        <div className="flex items-start gap-3 relative z-10 w-full">
          <div className="p-2 mb-2 bg-blue-100 text-blue-600 rounded-xl dark:bg-blue-900/30 dark:text-blue-400">
            <Train size={28} />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold tracking-tight">ZugConnect</h1>
            <div className="relative mt-2 max-w-[260px]">
              <Search
                size={16}
                className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                className="block w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-8 pr-3 text-sm text-gray-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:focus:ring-blue-900/40"
                value={stationQuery}
                onChange={(event) => {
                  setStationQuery(event.target.value);
                  setIsAutocompleteOpen(true);
                }}
                onFocus={() => setIsAutocompleteOpen(true)}
                onBlur={() =>
                  window.setTimeout(() => setIsAutocompleteOpen(false), 120)
                }
                aria-autocomplete="list"
                aria-controls="station-autocomplete"
                aria-expanded={isAutocompleteOpen}
                aria-label="Search station"
                role="combobox"
              />
              {isAutocompleteOpen && stationMatches.length > 0 && (
                <div
                  id="station-autocomplete"
                  className="absolute left-0 right-0 top-[calc(100%+6px)] z-20 max-h-64 overflow-y-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-700 dark:bg-gray-900"
                  role="listbox"
                >
                  {stationMatches.map((station) => (
                    <button
                      key={station.id}
                      className="flex w-full flex-col px-3 py-2 text-left text-sm hover:bg-blue-50 focus:bg-blue-50 focus:outline-none dark:hover:bg-blue-900/20 dark:focus:bg-blue-900/20"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => selectStation(station)}
                      role="option"
                      aria-selected={station.id === selectedStation.id}
                    >
                      <span className="font-medium text-gray-800 dark:text-gray-100">
                        {station.name}
                      </span>
                      <span className="text-xs text-gray-500">
                        EVA {station.evaId}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <GuideModal />
            <button
              onClick={() => refetch()}
              disabled={isFetching}
              className="tap-target p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors disabled:opacity-50"
              aria-label="Refresh departures"
            >
              <RefreshCw size={20} className={isFetching ? "animate-spin" : ""} />
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto pb-24 relative z-0" aria-busy={isFetching}>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4 px-1">
          <h2 className="text-lg font-semibold">Live Departures</h2>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-500">
              {selectedStation.name}
            </span>
            {dateOptions.length > 0 && (
              <>
                <label htmlFor="date-select" className="sr-only">Select travel day</label>
                <select
                className="rounded-md border border-gray-200 bg-white px-2 py-1 text-xs text-gray-600 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:focus:ring-blue-900/40"
                  id="date-select"
                value={selectedDate}
                onChange={(event) => setSelectedDate(event.target.value)}
                aria-label="Select travel day"
              >
                {dateOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
                </select>
              </>
            )}
          </div>
        </div>

        {/* Live region for refresh/update announcements for assistive tech */}
        <div aria-live="polite" aria-atomic="true" className="sr-only">
          {isFetching ? "Refreshing departures" : ""}
        </div>

        {isLoading && <LayoutSkeleton />}

        {isError && (
          <div
            className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-sm"
            aria-live="polite"
          >
            <p className="font-semibold">Unable to fetch routes</p>
            <p>{(error as Error).message}</p>
          </div>
        )}

        {trainsForDay.length === 0 && !isLoading && !isError && (
          <p className="text-gray-500 py-4 px-1" aria-live="polite">
            No departures found for this day.
          </p>
        )}

        <div className="flex flex-col gap-1">
          {trainsForDay.map((dep) => {
            const time = new Date(dep.when).toLocaleTimeString(undefined, {
              hour: "2-digit",
              minute: "2-digit",
            });
            const plannedTime = dep.plannedWhen
              ? new Date(dep.plannedWhen).toLocaleTimeString(undefined, {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : undefined;
            const delayMin = dep.delay ? Math.round(dep.delay / 60) : 0;

            const stops = (dep.stopovers || []).map((s) => ({
              name: s.stop?.name || "Unknown Station",
              time: s.departure
                ? new Date(s.departure).toLocaleTimeString(undefined, {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "--:--",
              plannedTime: s.plannedDeparture
                ? new Date(s.plannedDeparture).toLocaleTimeString(undefined, {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : undefined,
              platform: s.platform,
              plannedPlatform: s.plannedPlatform,
            }));

            if (stops.length === 0) {
              stops.push({
                name: dep.direction,
                time: "End",
                plannedTime: undefined,
                platform: undefined,
                plannedPlatform: undefined,
              });
            }

            return (
              <RouteCard
                key={dep.tripId}
                route={{
                  id: dep.tripId,
                  destination: dep.direction,
                  departure: time,
                  plannedDeparture: plannedTime,
                  delay: delayMin > 0 ? delayMin : undefined,
                  lineName: dep.line?.name,
                  operator: dep.operator,
                  platform: dep.platform,
                  plannedPlatform: dep.plannedPlatform,
                  isCancelled: dep.isCancelled,
                  stops,
                }}
              />
            );
          })}
        </div>

        <section
          aria-labelledby="about-zugconnect"
          className="mt-8 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-4"
        >
          <h2 id="about-zugconnect" className="text-lg font-semibold">
            About ZugConnect
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            ZugConnect is an unofficial, open source assistant for train departures. It is
            provided as-is and is not affiliated with Deutsche Bahn.
          </p>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            Data is provided by the Transitous API. Use the guide button for step-by-step
            planning help if you need extra support.
          </p>
          <div className="mt-3">
            <a
              href="https://github.com/ShinichiZero/ZugConnect"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-semibold text-blue-600 hover:underline"
            >
              View the source on GitHub
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}