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
            center: [51.505, -0.09],  // Default center
            zoom: 13,
            zoomControl: true,
            attributionControl: true
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap contributors',
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
        } catch (err) {
            console.error(err);
            setError("Error fetching location or drawing map.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
            {error && <div className={`error-message ${error ? 'visible' : ''}`}>{error}</div>}
            <div className={`control-panel ${isLoading ? 'loading' : ''}`}>
                <input
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    placeholder="City, ZIP or “lat,lon”"
                    disabled={isLoading}
                />
                <select
                    value={transport}
                    onChange={e => setTransport(e.target.value)}
                    disabled={isLoading}
                >
                    <option value="walking">Walking</option>
                    <option value="cycling">Cycling</option>
                    <option value="driving">Driving</option>
                    <option value="bus">Bus</option>
                </select>
                <input
                    value={timeInput}
                    onChange={e => setTimeInput(e.target.value)}
                    placeholder="e.g. 10m, 1.5h, 30s"
                    disabled={isLoading}
                />
                <button
                    onClick={drawIsochrone}
                    disabled={isLoading}
                >
                    {isLoading ? 'Loading...' : 'Go'}
                </button>
            </div>
            <div ref={mapContainer} className="map-container" />
        </div>
    );
};

export default App;
