import "./assets/main.css";

import { Auth0Provider } from "@auth0/auth0-react";
import { createRoot } from "react-dom/client";

import App from "./App";

createRoot(document.getElementById("root")!).render(
    <Auth0Provider
        domain="your-auth0-domain.auth0.com"
        clientId="your-client-id"
        authorizationParams={{
            redirect_uri: window.location.origin
        }}
    >
        <App />
    </Auth0Provider>
);
