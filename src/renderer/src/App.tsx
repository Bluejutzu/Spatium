/* eslint-disable @typescript-eslint/explicit-function-return-type */
import axios from "axios";
import type { Circle, Map as LeafletMap } from "leaflet";
import L from "leaflet";
import { useEffect, useRef, useState } from "react";

const speeds: Record<string, number> = {
    walking: 1.4,
    cycling: 5.5,
    driving: 13.9,
    bus: 8
};

const App = () => {
    const mapRef = useRef<LeafletMap>(null);
    const circleRef = useRef<Circle>(null);
    const mapContainer = useRef<HTMLDivElement>(null);

    const [location, setLocation] = useState("");
    const [transport, setTransport] = useState("walking");
    const [timeInput, setTimeInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!mapContainer.current || mapRef.current) return;

        const map = L.map(mapContainer.current, {
            center: [51.505, -0.09], // Default center
            center: [51.505, -0.09], // Default center
            zoom: 13,
            zoomControl: true,
            attributionControl: true
        });

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            maxZoom: 19,
            attribution: "© OpenStreetMap contributors",
            attribution: "© OpenStreetMap contributors",
            tileSize: 256,
            zoomOffset: 0
        }).addTo(map);

        mapRef.current = map;

        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, []);

    useEffect(() => {
        if (isAuthenticated) {
            const savedHistory = localStorage.getItem("searchHistory");
            if (savedHistory) {
                setSearchHistory(JSON.parse(savedHistory));
            }
        }
    }, [isAuthenticated]);

    const addToHistory = (): void => {
        if (!isAuthenticated) return;

        const newHistoryItem: SearchHistoryItem = {
            location,
            transport,
            time: timeInput,
            timestamp: new Date().toLocaleString()
        };

        const updatedHistory = [newHistoryItem, ...searchHistory].slice(0, 10); // Keep last 10 searches
        setSearchHistory(updatedHistory);
        localStorage.setItem("searchHistory", JSON.stringify(updatedHistory));
    };

    const handleHistorySelect = (item: SearchHistoryItem): void => {
        setLocation(item.location);
        setTransport(item.transport);
        setTimeInput(item.time);
        drawIsochrone();
    };

    const drawIsochrone = async (): Promise<void> => {
        if (!location.trim() || !timeInput.trim()) {
            setError("Please enter both a location and a time (e.g. “10m”).");
            return;
        }

        const m = timeInput.match(/^(\d+(?:\.\d+)?)([hms])$/i);
        if (!m) {
            setError("Invalid time format. Use e.g. 10m, 1.5h, or 30s.");
            return;
        }

        setError("");
        setIsLoading(true);

        const value = parseFloat(m[1]);
        const unit = m[2].toLowerCase();
        const seconds = unit === "h" ? value * 3600 : unit === "m" ? value * 60 : value;

        const speed = speeds[transport];
        if (!speed) {
            setError("Unknown transport mode.");
            setIsLoading(false);
            return;
        }

        const radius = speed * seconds;

        try {
            const res = await axios.get(`http://localhost:3000/geocode`, {
                params: {
                    q: location
                }
            });

            if (!res.data.length) {
                setError("Location not found.");
                return;
            }
            const { lat, lon, display_name } = res.data[0];
            const latNum = parseFloat(lat);
            const lonNum = parseFloat(lon);

            mapRef.current!.setView([latNum, lonNum], 13);

            if (circleRef.current) {
                circleRef.current.remove();
            }

            circleRef.current = L.circle([latNum, lonNum], {
                radius,
                color: "blue",
                fillColor: "#3f51b5",
                fillOpacity: 0.4
            }).addTo(mapRef.current!);

            L.popup()
                .setLatLng([latNum, lonNum])
                .setContent(`<strong>${display_name}</strong><br>` + `~ ${(radius / 1000).toFixed(2)}km radius`)
                .openOn(mapRef.current!);

            addToHistory();
        } catch (err) {
            console.error(err);
            setError("Error fetching location or drawing map.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = async () => {
        if (location.trim()) {
            addSearchQuery(location);
        }
        await drawIsochrone();
    };

    const handleHistorySelect = (query: string) => {
        setLocation(query);
    };

    return (
        <ThemeProvider>
            <div className="w-screen h-screen overflow-hidden relative bg-background text-foreground">
                <ThemeToggle className="absolute top-4 right-4 z-50" />

                {error && (
                    <div className="fixed top-16 left-1/2 transform -translate-x-1/2 z-50 bg-destructive/90 text-destructive-foreground px-4 py-2 rounded-lg shadow-lg backdrop-blur-sm">
                        {error}
                    </div>
                )}

                <div
                    className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 p-4 rounded-2xl shadow-lg backdrop-blur-md bg-background/90 flex flex-col gap-4 min-w-[320px] ${isLoading ? "opacity-50" : ""}`}
                >
                    <div className="flex flex-col gap-2">
                        <input
                            className="w-full px-3 py-2 rounded-lg border border-input bg-transparent focus:outline-none focus:ring-2 focus:ring-ring"
                            value={location}
                            onChange={e => setLocation(e.target.value)}
                            placeholder="City, ZIP or “lat,lon”"
                            disabled={isLoading}
                        />
                        <SearchHistoryDropdown onSelect={handleHistorySelect} />
                    </div>

                    <div className="flex gap-2">
                        <Select value={transport} onValueChange={setTransport}>
                            <SelectTrigger className="w-[120px]">
                                <SelectValue placeholder="Transport" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="walking">Walking</SelectItem>
                                <SelectItem value="cycling">Cycling</SelectItem>
                                <SelectItem value="driving">Driving</SelectItem>
                                <SelectItem value="bus">Bus</SelectItem>
                            </SelectContent>
                        </Select>

                        <input
                            className="flex-1 px-3 py-2 rounded-lg border border-input bg-transparent focus:outline-none focus:ring-2 focus:ring-ring"
                            value={timeInput}
                            onChange={e => setTimeInput(e.target.value)}
                            placeholder="e.g. 10m, 1.5h, 30s"
                            disabled={isLoading}
                        />

                        <Button onClick={handleSearch} disabled={isLoading} className="w-20">
                            {isLoading ? "..." : "Go"}
                        </Button>
                    </div>
                </div>

                <div ref={mapContainer} className="w-full h-full" />
            </div>
            <div ref={mapContainer} className="map-container" />
        </div>
    );
};

export default App;
