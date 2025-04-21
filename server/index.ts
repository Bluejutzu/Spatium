import axios from "axios";
import { Hono } from "hono";
import { cors } from "hono/cors";

const app = new Hono();
const NOMINATIM_API_KEY = process.env.NOMINATIM_API_KEY || "";

app.use("*", cors());

app.get("/geocode", async c => {
    const query = c.req.query("q");

    if (!query) {
        return c.json({ error: "Missing query parameter `q`" }, 400);
    }

    try {
        const geoRes = await axios.get(
            "https://nominatim.openstreetmap.org/search",
            {
                params: {
                    q: query,
                    format: "json",
                    limit: 1,
                    key: NOMINATIM_API_KEY
                },
                headers: {
                    "User-Agent": "TravelApp/1.0 (support@bmc-company.com)"
                }
            }
        );

        return c.json(geoRes.data);
    } catch (error) {
        console.error(error);
        return c.json({ error: "Failed to fetch geocode data" }, 500);
    }
});

export default app;
