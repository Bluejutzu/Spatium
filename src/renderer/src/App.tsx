import axios from "axios";
import type { Circle, Map as LeafletMap } from "leaflet";
import L from "leaflet";
import { type JSX, useEffect, useRef, useState } from "react";

const speeds: Record<string, number> = {
    walking: 1.4,
    cycling: 5.5,
    driving: 13.9,
    bus: 8
};

function App(): JSX.Element {
    const mapRef = useRef<LeafletMap>(null);
    const circleRef = useRef<Circle>(null);
    const mapContainer = useRef<HTMLDivElement>(null);

    const [location, setLocation] = useState("");
    const [transport, setTransport] = useState("walking");
    const [timeInput, setTimeInput] = useState("");

    useEffect(() => {
        if (!mapContainer.current) return;
        mapRef.current = L.map(mapContainer.current).setView([0, 0], 2);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: "© OpenStreetMap contributors"
        }).addTo(mapRef.current);
    }, []);

    const drawIsochrone = async (): Promise<void> => {
        if (!location.trim() || !timeInput.trim()) {
            return alert("Please enter both a location and a time (e.g. “10m”).");
        }

        const m = timeInput.match(/^(\d+(?:\.\d+)?)([hms])$/i);
        if (!m) return alert("Invalid time format. Use e.g. 10m, 1.5h, or 30s.");

        const value = parseFloat(m[1]);
        const unit = m[2].toLowerCase();
        const seconds = unit === "h" ? value * 3600 : unit === "m" ? value * 60 : value;

        const speed = speeds[transport];
        if (!speed) return alert("Unknown transport mode.");

        const radius = speed * seconds;

        try {
            const res = await axios.get(`http://localhost:4000/geocode`, {
                params: {
                    q: location
                }
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
            alert("Error fetching location or drawing map.");
        }
    };
    alert("something");
    return (
        <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
            <div
                style={{
                    padding: "8px",
                    background: "#fafafa",
                    display: "flex",
                    gap: "8px",
                    alignItems: "center"
                }}
            >
                <input
                    style={{ flex: 2, padding: "4px 8px" }}
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    placeholder="City, ZIP or “lat,lon”"
                />
                <select style={{ padding: "4px 8px" }} value={transport} onChange={e => setTransport(e.target.value)}>
                    <option value="walking">Walking</option>
                    <option value="cycling">Cycling</option>
                    <option value="driving">Driving</option>
                    <option value="bus">Bus</option>
                </select>
                <input
                    style={{ width: "120px", padding: "4px 8px" }}
                    value={timeInput}
                    onChange={e => setTimeInput(e.target.value)}
                    placeholder="e.g. 10m, 1.5h, 30s"
                />
                <button onClick={drawIsochrone}>Go</button>
            </div>
            <div ref={mapContainer} className="map-container" style={{ flex: 1 }} />
        </div>
    );
}

export default App;
