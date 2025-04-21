import axios from "axios";
import type { Circle, Map as LeafletMap } from "leaflet";
import L from "leaflet";
import { type JSX, useEffect, useRef, useState } from "react";

import { CreditsModal } from "./components/CreditsModal";
import { HistoryModal } from "./components/HistoryModal";
import { getHistory, type HistoryItem, saveToHistory } from "./lib/utils";

const speeds: Record<string, number> = {
    walking: 1.4,
    cycling: 5.5,
    driving: 13.9,
    bus: 8
};

function App(): JSX.Element {
    const mapRef = useRef<LeafletMap | null>(null);
    const circleRef = useRef<Circle | null>(null);
    const mapContainer = useRef<HTMLDivElement>(null);

    const [location, setLocation] = useState("");
    const [transport, setTransport] = useState("walking");
    const [timeInput, setTimeInput] = useState("");
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [isCreditsOpen, setIsCreditsOpen] = useState(false);
    const [history, setHistory] = useState<HistoryItem[]>([]);

    useEffect(() => {
        if (!mapContainer.current || mapRef.current) return;

        // Initialize map with dark mode
        mapRef.current = L.map(mapContainer.current, {
            center: [51.505, -0.09],
            zoom: 13,
            zoomControl: false
        });

        // Add zoom control to top-right corner
        L.control
            .zoom({
                position: "topright"
            })
            .addTo(mapRef.current);

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            maxZoom: 19,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(mapRef.current);

        // Load initial history
        setHistory(getHistory());

        return () => {
            mapRef.current?.remove();
            mapRef.current = null;
        };
    }, []);

    const handleHistorySelect = (item: HistoryItem): void => {
        // Skip setting input values and directly draw with the history item values
        setIsHistoryOpen(false);

        // Reuse drawIsochrone logic but with direct values
        drawIsochroneWithValues(item.location, item.transport, item.time);
    };

    const drawIsochroneWithValues = async (loc: string, mode: string, time: string): Promise<void> => {
        if (!loc.trim() || !time.trim()) {
            return alert("Invalid history item.");
        }

        const m = time.match(/^(\d+(?:\.\d+)?)([hms])$/i);
        if (!m) return alert("Invalid time format in history item.");

        const value = parseFloat(m[1]);
        const unit = m[2].toLowerCase();
        const seconds = unit === "h" ? value * 3600 : unit === "m" ? value * 60 : value;

        const speed = speeds[mode];
        if (!speed) return alert("Unknown transport mode in history item.");

        const radius = speed * seconds;

        try {
            const res = await axios.get(`http://127.0.0.1:8787/geocode`, {
                params: { q: loc }
            });

            if (!res.data.length) return alert("Location not found.");
            const { lat, lon, display_name } = res.data[0];
            const latNum = parseFloat(lat);
            const lonNum = parseFloat(lon);

            mapRef.current!.setView([latNum, lonNum], 13);

            if (circleRef.current) {
                circleRef.current.remove();
            }

            circleRef.current = L.circle([latNum, lonNum], {
                radius,
                color: "#3b82f6",
                fillColor: "#3b82f6",
                fillOpacity: 0.2
            }).addTo(mapRef.current!);

            L.popup()
                .setLatLng([latNum, lonNum])
                .setContent(
                    `<div class="popup-content">
                        <strong>${display_name}</strong><br>
                        ~ ${(radius / 1000).toFixed(2)}km radius
                    </div>`
                )
                .openOn(mapRef.current!);
        } catch (err) {
            console.error(err);
            alert("Error fetching location or drawing map.");
        }
    };

    const drawIsochrone = async (): Promise<void> => {
        if (!location.trim() || !timeInput.trim()) {
            return alert("Please enter both a location and a time (e.g. “10m”).");
        }

        // Save to history before drawing
        saveToHistory({ location, transport, time: timeInput });
        setHistory(getHistory());

        // Use the shared drawing logic
        await drawIsochroneWithValues(location, transport, timeInput);
    };

    const handleClear = (): void => {
        setLocation("");
        setTransport("walking");
        setTimeInput("");
    };

    return (
        <div className="app-container">
            <div className="header">
                <input
                    className="search-input text-sm"
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    placeholder="City, ZIP or “lat,lon”"
                />
                <select
                    className="transport-select text-sm"
                    value={transport}
                    onChange={e => setTransport(e.target.value)}
                >
                    <option value="walking">Walking</option>
                    <option value="cycling">Cycling</option>
                    <option value="driving">Driving</option>
                    <option value="bus">Bus</option>
                </select>
                <input
                    className="time-input text-sm"
                    value={timeInput}
                    onChange={e => setTimeInput(e.target.value)}
                    placeholder="e.g. 10m, 1.5h"
                />
                <button onClick={drawIsochrone} className="go-button text-sm font-medium">
                    Go
                </button>
                <button onClick={handleClear} className="clear-button text-sm font-medium">
                    Clear
                </button>
                <button onClick={() => setIsHistoryOpen(true)} className="history-button text-sm font-medium">
                    History
                </button>
                <button onClick={() => setIsCreditsOpen(true)} className="github-button" title="View Credits">
                    <svg viewBox="0 0 16 16" fill="currentColor">
                        <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
                    </svg>
                </button>
            </div>
            <div className="map-wrapper">
                <div ref={mapContainer} className="map" />
            </div>
            <HistoryModal
                isOpen={isHistoryOpen}
                onClose={() => setIsHistoryOpen(false)}
                history={history}
                onItemSelect={handleHistorySelect}
                onHistoryChange={() => setHistory(getHistory())}
            />
            <CreditsModal isOpen={isCreditsOpen} onClose={() => setIsCreditsOpen(false)} />
        </div>
    );
}

export default App;
