export interface DBDeparture {
  tripId: string;
  direction: string;
  when: string;
  delay: number | null;
  line: {
    name: string;
  };
  stopovers?: {
    stop: { name: string };
    departure: string;
  }[];
}

export async function fetchDepartures(stationId: string): Promise<{ departures: DBDeparture[], isOffline: boolean }> {
  try {
    // According to the prompt context, we can use 
    // Transitous, GTFS feeds, or motis APIs, but to stay compatible
    // with DB Navigator data directly in a purely frontend web app (Github Pages = STATIC),
    // hafas-client and db-vendo-client fail because of CORS / fetch blocks / browser unsupported protocols like `net`.
    
    // As suggested by the prompt, for purely browser compatibility where db.transport.rest is down,
    // the only truly robust, client side accessible data without a proxy server is either GTFS from Transitous,
    // or routing it through an API proxy if possible.
    
    // We will attempt to fetch from Motis API (transitous) if possible, but motis uses websockets/POST usually.
    // Let's implement a fallback API utilizing an alternative public endpoints if available, otherwise graceful degradation.
    
    const res = await fetch(`https://europe.motis-project.de/api/stopPlace/v1/departures/${stationId}`, {
      // Trying something new based on common patterns
    }).catch(() => null);

    if (!res || !res.ok) {
       throw new Error('API not available directly from browser CORS');
    }
    const data = await res.json();
    return { departures: data, isOffline: false };
  } catch (error) {
    console.error("Fetch failed, using mock data:", error);
    
    const STATIONS = [
      { id: "8011160", name: "Berlin Hbf" },
      { id: "8002549", name: "Hamburg Hbf" },
      { id: "8000261", name: "München Hbf" }
    ];
    
    return {
      departures: [
        {
          tripId: `mock-1-${stationId}`,
          direction: stationId === "8002549" ? "Hannover Hbf" : "Hamburg Hbf",
          when: new Date(Date.now() + 5 * 60000).toISOString(),
          delay: 10,
          line: { name: "ICE 100" },
          stopovers: [
            { stop: { name: STATIONS.find(s => s.id === stationId)?.name || "Origin" }, departure: new Date(Date.now() + 5 * 60000).toISOString() },
            { stop: { name: "Intermediate Station A" }, departure: new Date(Date.now() + 15 * 60000).toISOString() },
            { stop: { name: stationId === "8002549" ? "Hannover Hbf" : "Hamburg Hbf" }, departure: new Date(Date.now() + 105 * 60000).toISOString() }
          ]
        },
        {
          tripId: `mock-2-${stationId}`,
          direction: stationId === "8000261" ? "Stuttgart Hbf" : "München Hbf",
          when: new Date(Date.now() + 12 * 60000).toISOString(),
          delay: null,
          line: { name: "ICE 200" },
          stopovers: [
            { stop: { name: STATIONS.find(s => s.id === stationId)?.name || "Origin" }, departure: new Date(Date.now() + 12 * 60000).toISOString() },
            { stop: { name: "Intermediate Station B" }, departure: new Date(Date.now() + 72 * 60000).toISOString() },
            { stop: { name: stationId === "8000261" ? "Stuttgart Hbf" : "München Hbf" }, departure: new Date(Date.now() + 200 * 60000).toISOString() }
          ]
        }
      ] as DBDeparture[],
      isOffline: true
    };
  }
}
