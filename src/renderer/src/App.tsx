import "animate.css";

import axios from "axios";
import type { Circle, Map as LeafletMap } from "leaflet";
import L from "leaflet";
import { type JSX, useEffect, useRef, useState } from "react";

import { IsochroneSchema } from "../../../schema/zod";
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
    const [isLoading2, setIsLoading] = useState(false);

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
        try {
            const result = IsochroneSchema.safeParse({
                location: loc,
                transport: mode,
                time: time
            });

            if (!result.success) {
                const error = result.error.errors[0];
                return showToast(error.message, "Validation Error");
            }

            setIsLoading(true);
            const m = time.match(/^(\d+(?:\.\d+)?)([hms])$/i);
            const value = parseFloat(m![1]);
            const unit = m![2].toLowerCase();
            const seconds = unit === "h" ? value * 3600 : unit === "m" ? value * 60 : value;

            const speed = speeds[mode];
            const radius = speed * seconds;

            const res = await axios.get(`http://127.0.0.1:3000/geocode`, {
                params: { q: loc }
            });

            if (!res.data.length) {
                setIsLoading(false);
                showToast("Could not find the specified location. Try a different search term.", "Location Not Found");
                setLocation("");
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
                color: "#3b82f6",
                fillColor: "#3b82f6",
                fillOpacity: 0.2,
                className: "animated-circle"
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
        } finally {
            setIsLoading(false);
        }
    };

    const drawIsochrone = async (): Promise<void> => {
        const button = document.querySelector(".btn-default") as HTMLElement;
        if (button) button.classList.add("clicked");

        try {
            if (!location.trim() || !timeInput.trim()) {
                showToast("Try formats like: '10m' for 10 minutes, '1.5h' for 1.5 hours", "Input Examples");
                return;
            }

            // Validate input using schema
            const result = IsochroneSchema.safeParse({
                location,
                transport,
                time: timeInput
            });

            if (!result.success) {
                const error = result.error.errors[0];
                showToast(error.message, "Validation Error");
                return;
            }

            // Save to history before drawing
            saveToHistory({ location, transport, time: timeInput });
            setHistory(getHistory());

            // Use the shared drawing logic
            await drawIsochroneWithValues(location, transport, timeInput);
        } finally {
            // Ensure the clicked class is always removed
            if (button) {
                setTimeout(() => {
                    button.classList.remove("clicked");
                }, 600);
            }
        }
    };

    const handleClear = (): void => {
        setLocation("");
        setTransport("walking");
        setTimeInput("");
    };

    return (
        <div className="app-container">
            <div className="header animate__animated animate__fadeIn">
                <div className="search-container">
                    <input
                        className={`search-input text-sm ${isLoading2 ? "loading animate__animated animate__pulse animate__infinite" : ""}`}
                        value={location}
                        onChange={e => setLocation(e.target.value)}
                        placeholder="City, ZIP or “lat,lon”"
                        disabled={isLoading2}
                    />
                </div>
                <select
                    className={`transport-select text-sm ${isLoading2 ? "loading animate__animated animate__pulse animate__infinite" : ""}`}
                    value={transport}
                    onChange={e => setTransport(e.target.value)}
                    disabled={isLoading2}
                >
                    <option value="walking">Walking</option>
                    <option value="cycling">Cycling</option>
                    <option value="driving">Driving</option>
                    <option value="bus">Bus</option>
                </select>
                <input
                    className={`time-input text-sm ${isLoading2 ? "loading animate__animated animate__pulse animate__infinite" : ""}`}
                    value={timeInput}
                    onChange={e => setTimeInput(e.target.value)}
                    placeholder="e.g. 10m, 1.5h"
                    disabled={isLoading2}
                />
                <div className="action-buttons">
                    <Button
                        onClick={drawIsochrone}
                        size="default"
                        disabled={isLoading2}
                        className={`animate__animated ${isLoading2 ? "loading animate__pulse animate__infinite" : "animate__fadeIn"}`}
                    >
                        {isLoading2 ? "Loading..." : "Go"}
                    </Button>
                    <Button
                        onClick={handleClear}
                        variant="destructive"
                        size="default"
                        disabled={isLoading2}
                        className="animate__animated animate__fadeIn"
                    >
                        Clear
                    </Button>
                    <Button
                        onClick={() => setIsHistoryOpen(true)}
                        variant="outline"
                        size="default"
                        disabled={isLoading2}
                    >
                        History
                    </Button>
                    <Button
                        onClick={() => setIsCreditsOpen(true)}
                        variant="ghost"
                        size="icon"
                        className="github-button"
                        title="View Credits"
                        disabled={isLoading2}
                    >
                        <svg viewBox="0 0 16 16" fill="currentColor">
                            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12" />
                        </svg>
                    </Button>
                    <Button
                        onClick={() => setIsHelpOpen(true)}
                        variant="ghost"
                        size="icon"
                        className="help-button"
                        title="Help & Examples"
                        disabled={isLoading2}
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                            <path d="M12 17h.01" />
                        </svg>
                    </Button>
                </div>
            </div>
            <div
                className={`map-wrapper ${isLoading2 ? "loading animate__animated animate__fadeOut animate__faster" : "animate__animated animate__fadeIn"}`}
            >
                <div ref={mapContainer} className="map" />
                <PlaceDetails place={selectedPlace} onClose={() => setSelectedPlace(null)} />
            </div>
            <HistoryModal
                isOpen={isHistoryOpen}
                onClose={() => setIsHistoryOpen(false)}
                history={history}
                onItemSelect={handleHistorySelect}
                onHistoryChange={() => setHistory(getHistory())}
                showToast={showToast}
            />
            <CreditsModal isOpen={isCreditsOpen} onClose={() => setIsCreditsOpen(false)} />
            <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} onExampleSelect={handleExampleSelect} />
            {toast && (
                <div className="toast-overlay">
                    <Toast message={toast.message} title={toast.title} onClose={() => setToast(null)} />
                </div>
            )}
        </div>
    );
}

export default App;
