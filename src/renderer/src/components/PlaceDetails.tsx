import "../styles/components/PlaceDetails.css";

import { type JSX, useState } from "react";

import { Button } from "./ui/Button";

interface PlaceDetailsProps {
    place: {
        name: string;
        displayName: string;
        lat: number;
        lon: number;
        radius?: number;
        transport?: string;
        time?: string;
    } | null;
    onClose: () => void;
}

export function PlaceDetails({ place, onClose }: PlaceDetailsProps): JSX.Element | null {
    const [copiedField, setCopiedField] = useState<string | null>(null);

    if (!place) return null;

    // Update handleCopy to show "Copied (checkmark)"
    const handleCopy = async (text: string, field: string, e: React.MouseEvent): Promise<void> => {
        try {
            await navigator.clipboard.writeText(text);
            const element = e.currentTarget;
            element.classList.add("copied");
            setCopiedField(field);
            setTimeout(() => {
                element.classList.remove("copied");
                setCopiedField(null);
            }, 2000);
        } catch (err) {
            console.error("Failed to copy:", err);
        }
    };

    return (
        <div className="place-details animate__animated animate__slideInLeft">
            <div className="place-details-header">
                <h2 className="place-details-title animate__animated animate__fadeIn">{place.name}</h2>
                <Button
                    onClick={onClose}
                    variant="ghost"
                    size="icon"
                    className="place-details-close animate__animated animate__fadeIn"
                >
                    ✕
                </Button>
            </div>
            <div className="place-details-content">
                <div className="place-details-info">
                    <p className="place-details-address animate__animated animate__fadeIn animate__delay-1s">
                        {place.displayName}
                    </p>
                    {place.radius && (
                        <div className="place-details-stats animate__animated animate__fadeIn animate__delay-2s">
                            <div className="stat">
                                <span className="stat-label">Distance</span>
                                <span className="stat-value">{(place.radius / 1000).toFixed(2)} km</span>
                            </div>
                            {place.transport && (
                                <div className="stat">
                                    <span className="stat-label">Transport</span>
                                    <span className="stat-value">{place.transport}</span>
                                </div>
                            )}
                            {place.time && (
                                <div className="stat">
                                    <span className="stat-label">Time</span>
                                    <span className="stat-value">{place.time}</span>
                                </div>
                            )}
                        </div>
                    )}
                    <div className="place-details-coordinates animate__animated animate__fadeIn animate__delay-3s">
                        <p>
                            <span className="coordinate-label">Lat:</span>
                            <span
                                className="copyable-text"
                                onClick={e => handleCopy(place.lat.toFixed(6), "lat", e)}
                                title="Click to copy"
                            >
                                {place.lat.toFixed(6)}
                                <span className="copy-indicator">{copiedField === "lat" ? "Copied!" : "Copy"}</span>
                            </span>
                        </p>
                        <p>
                            <span className="coordinate-label">Lon:</span>
                            <span
                                className="copyable-text"
                                onClick={e => handleCopy(place.lon.toFixed(6), "lon", e)}
                                title="Click to copy"
                            >
                                {place.lon.toFixed(6)}
                                <span className="copy-indicator">{copiedField === "lon" ? "Copied!" : "Copy"}</span>
                            </span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
