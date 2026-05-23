export interface DBDeparture {
  tripId: string;
  direction: string;
  when: string;
  plannedWhen?: string;
  delay: number | null;
  line: {
    name: string;
    longName?: string;
    product?: string;
  };
  operator?: string;
  platform?: string;
  plannedPlatform?: string;
  isCancelled?: boolean;
  stopovers?: {
    stop: { name: string };
    departure: string;
    plannedDeparture?: string;
    platform?: string;
    plannedPlatform?: string;
  }[];
}

interface TransitousPlace {
  name?: string;
  departure?: string;
  scheduledDeparture?: string;
  arrival?: string;
  scheduledArrival?: string;
  track?: string;
  scheduledTrack?: string;
}

interface TransitousStopTime {
  place: TransitousPlace;
  headsign?: string;
  tripId?: string;
  routeShortName?: string;
  displayName?: string;
  tripShortName?: string;
  routeLongName?: string;
  mode?: string;
  agencyName?: string;
  realTime?: boolean;
  cancelled?: boolean;
  tripCancelled?: boolean;
  nextStops?: TransitousPlace[];
}

interface TransitousStopTimesResponse {
  stopTimes: TransitousStopTime[];
}

const TRANSITOUS_API_BASE = "https://api.transitous.org/api";
const TRAIN_MODES = [
  "HIGHSPEED_RAIL",
  "LONG_DISTANCE",
  "NIGHT_RAIL",
  "REGIONAL_RAIL",
  "SUBURBAN",
];

function eventTime(place: TransitousPlace): string | undefined {
  return (
    place.departure ||
    place.scheduledDeparture ||
    place.arrival ||
    place.scheduledArrival
  );
}

function delaySeconds(place: TransitousPlace): number | null {
  const actual = place.departure || place.arrival;
  const scheduled = place.scheduledDeparture || place.scheduledArrival;
  if (!actual || !scheduled) return null;
  const diff = Math.round((Date.parse(actual) - Date.parse(scheduled)) / 1000);
  return Number.isFinite(diff) && diff !== 0 ? diff : null;
}

function toDeparture(
  stopTime: TransitousStopTime,
  fallbackIndex: number
): DBDeparture | null {
  const when = eventTime(stopTime.place);
  if (!when) return null;

  const plannedWhen =
    stopTime.place.scheduledDeparture || stopTime.place.scheduledArrival;

  const stopovers = stopTime.nextStops
    ?.map((stop) => {
      const departure = eventTime(stop);
      if (!departure) return null;
      return {
        stop: { name: stop.name || "Unknown station" },
        departure,
        plannedDeparture: stop.scheduledDeparture || stop.scheduledArrival,
        platform: stop.track || stop.scheduledTrack,
        plannedPlatform: stop.scheduledTrack,
      };
    })
    .filter((s): s is NonNullable<typeof s> => Boolean(s));

  return {
    tripId:
      stopTime.tripId ||
      `${stopTime.routeShortName || "trip"}-${when}-${fallbackIndex}`,
    direction:
      stopTime.headsign ||
      stopTime.nextStops?.at(-1)?.name ||
      "Unknown destination",
    when,
    plannedWhen,
    delay: delaySeconds(stopTime.place),
    line: {
      name:
        stopTime.displayName ||
        stopTime.routeShortName ||
        stopTime.tripShortName ||
        "Train",
      longName: stopTime.routeLongName,
      product: stopTime.mode,
    },
    operator: stopTime.agencyName,
    platform: stopTime.place.track || stopTime.place.scheduledTrack,
    plannedPlatform: stopTime.place.scheduledTrack,
    isCancelled: stopTime.cancelled || stopTime.tripCancelled,
    stopovers,
  };
}

export async function fetchDepartures(
  stationId: string
): Promise<{ departures: DBDeparture[]; isOffline: boolean }> {
  const params = new URLSearchParams({
    stopId: stationId,
    n: "150",
    mode: TRAIN_MODES.join(","),
    fetchStops: "true",
    withAlerts: "false",
    language: "en",
  });

  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), 10_000);

  try {
    const response = await fetch(
      `${TRANSITOUS_API_BASE}/v5/stoptimes?${params}`,
      { signal: controller.signal }
    );
    if (!response.ok) throw new Error(`Transitous returned ${response.status}`);

    const data = (await response.json()) as TransitousStopTimesResponse;
    const departures = data.stopTimes
      .map((st, i) => toDeparture(st, i))
      .filter((d): d is DBDeparture => Boolean(d));

    return { departures, isOffline: false };
  } finally {
    window.clearTimeout(timeoutId);
  }
}