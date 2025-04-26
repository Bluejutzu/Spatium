import { z } from "zod";

const TransportMode = z.enum(["walking", "cycling", "driving", "bus"]);

const TimePattern = z.string().regex(/^(\d+(?:\.\d+)?)[hms]$/i, "Time should be in format: 10m, 1.5h, or 30s");

const IsochroneSchema = z.object({
    location: z.string().min(1, "Location is required"),
    transport: TransportMode,
    time: TimePattern
});

export { IsochroneSchema, TimePattern, TransportMode };
