import "../styles/components/PlaceDetails.css";

import type { JSX } from "react";

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

export function PlaceDetails({ place, onClose }: PlaceDetailsProps): JSX.Element {
    if (!place) return <></>;

    return (
        <div className="place-details">
            <div className="place-details-header">
                <h2 className="place-details-title">{place.name}</h2>
                <Button onClick={onClose} variant="ghost" size="icon" className="place-details-close">
                    ✕
                </Button>
            </div>
            <div className="place-details-content">
                <div className="place-details-info">
                    <p className="place-details-address">{place.displayName}</p>
                    {place.radius && (
                        <div className="place-details-stats">
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
                    <div className="place-details-coordinates">
                        <p>
                            <span className="coordinate-label">Lat:</span> {place.lat.toFixed(6)}
                        </p>
                        <p>
                            <span className="coordinate-label">Lon:</span> {place.lon.toFixed(6)}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
