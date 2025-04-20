import "./assets/main.css";

import { Auth0Provider } from "@auth0/auth0-react";
import { createRoot } from "react-dom/client";

import App from "./App";

const root = createRoot(document.getElementById("root")!);

root.render(
    <Auth0Provider
        domain="your-auth0-domain.auth0.com" // Replace with your Auth0 domain
        clientId="your-client-id" // Replace with your Auth0 client ID
        authorizationParams={{
            redirect_uri: window.location.origin
        }}
    >
        <App />
    </Auth0Provider>
);
