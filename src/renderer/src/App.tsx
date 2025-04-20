import { useAuth0 } from "@auth0/auth0-react";
import axios from "axios";
import type { Circle, Map as LeafletMap } from "leaflet";
import L from "leaflet";
import { type JSX, useEffect, useRef, useState } from "react";

import { AuthMenu } from "./components/auth/AuthMenu";
import { SearchHistory } from "./components/SearchHistory";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./components/ui/select";

const speeds: Record<string, number> = {
    walking: 1.4,
    cycling: 5.5,
    driving: 13.9,
    bus: 8
};

interface SearchHistoryItem {
    location: string;
    transport: string;
    time: string;
    timestamp: string;
}

const App = (): JSX.Element => {
    const { isAuthenticated } = useAuth0();
    const mapRef = useRef<LeafletMap>(null);
    const circleRef = useRef<Circle>(null);
    const mapContainer = useRef<HTMLDivElement>(null);

    const [location, setLocation] = useState("");
    const [transport, setTransport] = useState("walking");
    const [timeInput, setTimeInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);

    useEffect(() => {
        if (!mapContainer.current || mapRef.current) return;

        const map = L.map(mapContainer.current, {
            center: [51.505, -0.09], // Default center
            zoom: 13,
            zoomControl: true,
            attributionControl: true
        });

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            maxZoom: 19,
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

    return (
        <div className="w-full h-full relative">
            <div className="absolute top-4 right-4 z-[1000] flex items-center gap-2">
                <SearchHistory history={searchHistory} onSelectHistory={handleHistorySelect} />
                <AuthMenu />
            </div>

            {error && (
                <div className="absolute top-4 left-4 z-[1000] bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded">
                    {error}
                </div>
            )}

            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-white/90 backdrop-blur-sm p-4 rounded-lg shadow-lg flex gap-3 items-end">
                <div className="flex flex-col gap-2">
                    <label className="text-sm">Location</label>
                    <Input
                        value={location}
                        onChange={e => setLocation(e.target.value)}
                        placeholder="City, ZIP or lat,lon"
                        disabled={isLoading}
                        className="w-48"
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-sm">Transport</label>
                    <Select value={transport} onValueChange={setTransport} disabled={isLoading}>
                        <SelectTrigger className="w-32">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="walking">Walking</SelectItem>
                            <SelectItem value="cycling">Cycling</SelectItem>
                            <SelectItem value="driving">Driving</SelectItem>
                            <SelectItem value="bus">Bus</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-sm">Time</label>
                    <Input
                        value={timeInput}
                        onChange={e => setTimeInput(e.target.value)}
                        placeholder="e.g. 10m, 1.5h, 30s"
                        disabled={isLoading}
                        className="w-36"
                    />
                </div>

                <Button onClick={drawIsochrone} disabled={isLoading} className="self-end">
                    {isLoading ? "Loading..." : "Calculate"}
                </Button>
            </div>

            <div ref={mapContainer} className="w-full h-full" />
        </div>
    );
};

export default App;
