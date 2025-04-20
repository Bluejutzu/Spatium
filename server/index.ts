import "dotenv/config";

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
    const endpoint = "https://nominatim.openstreetmap.org/search";
    try {
        const geoRes = await axios.get(process.env.API_CORS_PROXY + encodeURIComponent(endpoint), {
            params: {
                q: query,
                format: "json",
                limit: 1
            },
            headers: {
                "User-Agent": "SpatiumApp/1.0 (kalebdaniel98@gmail.com)"
            }
        });

        return c.json(geoRes.data);
    } catch (error) {
        console.error(error);
        return c.json({ error: "Failed to fetch geocode data" }, 500);
    }
});

export default app;
