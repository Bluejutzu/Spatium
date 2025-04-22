import axios from "axios";
import type { Circle, Map as LeafletMap } from "leaflet";
import L from "leaflet";
import { type JSX, useEffect, useRef, useState } from "react";

import { CreditsModal } from "./components/CreditsModal";
import { HelpModal } from "./components/HelpModal";
import { HistoryModal } from "./components/HistoryModal";
import { PlaceDetails } from "./components/PlaceDetails";
import { Toast } from "./components/Toast";
import { Button } from "./components/ui/Button";
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
    const [isHelpOpen, setIsHelpOpen] = useState(false);
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [selectedPlace, setSelectedPlace] = useState<{
        name: string;
        displayName: string;
        lat: number;
        lon: number;
        radius?: number;
        transport?: string;
        time?: string;
    } | null>(null);
    const [toast, setToast] = useState<{
        message: string;
        title?: string;
        action?: { label: string; onClick: () => void };
    } | null>(null);

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

        setHistory(getHistory());

        return () => {
            mapRef.current?.remove();
            mapRef.current = null;
        };
    }, []);

    const showToast = (message: string, title?: string, action?: { label: string; onClick: () => void }): void => {
        setToast({ message, title, action });
    };

    const handleHistorySelect = (item: HistoryItem): void => {
        setIsHistoryOpen(false);
        drawIsochroneWithValues(item.location, item.transport, item.time);
    };

    const handleExampleSelect = (example: { location: string; transport: string; time: string }): void => {
        setLocation(example.location);
        setTransport(example.transport);
        setTimeInput(example.time);
    };

    const drawIsochroneWithValues = async (loc: string, mode: string, time: string): Promise<void> => {
        if (!loc.trim() || !time.trim()) {
            return showToast("Please provide both location and time values.", "Invalid Input");
        }

        const m = time.match(/^(\d+(?:\.\d+)?)([hms])$/i);
        if (!m) return showToast("Time should be in format: 10m, 1.5h, or 30s", "Invalid Time Format");

        const value = parseFloat(m[1]);
        const unit = m[2].toLowerCase();
        const seconds = unit === "h" ? value * 3600 : unit === "m" ? value * 60 : value;

        const speed = speeds[mode];
        if (!speed) return showToast("Selected transport mode is not supported.", "Invalid Transport");

        const radius = speed * seconds;

        try {
            const res = await axios.get(`http://127.0.0.1:3000/geocode`, {
                params: { q: loc }
            });

            if (!res.data.length)
                return showToast(
                    "Could not find the specified location. Try a different search term.",
                    "Location Not Found",
                    {
                        label: "Clear Input",
                        onClick: () => setLocation("")
                    }
                );

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
            })
                .addTo(mapRef.current!)
                .on("click", () => {
                    setSelectedPlace({
                        name: loc,
                        displayName: display_name,
                        lat: latNum,
                        lon: lonNum,
                        radius,
                        transport: mode,
                        time
                    });
                });

            // Show the place details panel
            setSelectedPlace({
                name: loc,
                displayName: display_name,
                lat: latNum,
                lon: lonNum,
                radius,
                transport: mode,
                time
            });
        } catch (err) {
            console.error(err);
            showToast("Could not fetch location data. Please try again.", "Network Error", {
                label: "Retry",
                onClick: () => drawIsochroneWithValues(loc, mode, time)
            });
        }
    };

    const drawIsochrone = async (): Promise<void> => {
        if (!location.trim() || !timeInput.trim()) {
            return showToast("Please enter both a location and a time value.", "Missing Input", {
                label: "See Examples",
                onClick: () =>
                    showToast(
                        "Try formats like: '10m' for 10 minutes, '1.5h' for 1.5 hours, or '30s' for 30 seconds",
                        "Input Examples"
                    )
            });
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
                <Button onClick={drawIsochrone} size="default">
                    Go
                </Button>
                <Button onClick={handleClear} variant="destructive" size="default">
                    Clear
                </Button>
                <Button onClick={() => setIsHistoryOpen(true)} variant="outline" size="default">
                    History
                </Button>
                <Button
                    onClick={() => setIsCreditsOpen(true)}
                    variant="ghost"
                    size="icon"
                    className="github-button"
                    title="View Credits"
                >
                    <svg viewBox="0 0 16 16" fill="currentColor">
                        <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
                    </svg>
                </Button>
                <Button
                    onClick={() => setIsHelpOpen(true)}
                    variant="ghost"
                    size="icon"
                    className="help-button"
                    title="Help & Examples"
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                        <path d="M12 17h.01" />
                    </svg>
                </Button>
            </div>
            <div className="map-wrapper">
                <div ref={mapContainer} className="map" />
                <PlaceDetails place={selectedPlace} onClose={() => setSelectedPlace(null)} />
            </div>
            <HistoryModal
                isOpen={isHistoryOpen}
                onClose={() => setIsHistoryOpen(false)}
                history={history}
                onItemSelect={handleHistorySelect}
                onHistoryChange={() => setHistory(getHistory())}
            />
            <CreditsModal isOpen={isCreditsOpen} onClose={() => setIsCreditsOpen(false)} />
            <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} onExampleSelect={handleExampleSelect} />
            {toast && (
                <Toast
                    message={toast.message}
                    title={toast.title}
                    action={toast.action}
                    onClose={() => setToast(null)}
                />
            )}
        </div>
    );
}

export default App;
