import axios from "axios";
import { Hono } from "hono";
import { cors } from "hono/cors";

const app = new Hono();

app.use("*", cors());

app.get("/geocode", async c => {
    const query = c.req.query("q");

    if (!query) {
        return c.json({ error: "Missing query parameter `q`" }, 400);
    }

    try {
        const geoRes = await axios.get("https://nominatim.openstreetmap.org/search", {
            params: {
                q: query,
                format: "json",
                limit: 1
            },
            headers: {
                "User-Agent": "TravelApp/1.0 (kalebdaniel98@gmail.com)",
                Accept: "application/json"
            }
        });

        if (!Array.isArray(geoRes.data)) {
            throw new Error("Invalid response format");
        }

        return c.json(geoRes.data);
    } catch (error) {
        console.error("Geocoding error:", error);
        return c.json({ error: "Failed to fetch geocode data" }, 500);
    }
});

export default app;
