import { Hono } from "hono";
import { cors } from "hono/cors";
import axios, { AxiosError } from "axios";

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
                "User-Agent": "SpatiumApp/1.0 (kalebdaniel98@gmail.com)"
            }
        });

        return c.json(geoRes.data);
    } catch (error: AxiosError | any) {
        console.error(error?.config.data);
        return c.json({ error: "Failed to fetch geocode data" }, 500);
    }
});

export default app;
