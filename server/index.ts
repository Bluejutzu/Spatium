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
        const geoRes = await axios.get(
            "https://corsproxy.io/?https://nominatim.openstreetmap.org/search?q=90420&format=jsonv2&limit=1&key=405e56db",
            {
                params: {
                    q: query,
                    format: "json",
                    limit: 1
                },
                headers: {
                    "User-Agent": "SpatiumApp/1.0 (kalebdaniel98@gmail.com)"
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
