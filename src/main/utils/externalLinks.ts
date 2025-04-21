import { type BrowserWindow, shell } from "electron";

export function handleExternalUrl(url: string): { action: "deny" | "allow" } {
    try {
        const { protocol } = new URL(url);

        switch (protocol) {
            case "http:":
            case "https:":
                shell.openExternal(url);
                break;
        }
    } catch (err) {
        console.error("Error handling external URL:", err);
    }

    return { action: "deny" };
}

export function makeLinksOpenExternally(win: BrowserWindow): void {
    win.webContents.setWindowOpenHandler(({ url }) => {
        return handleExternalUrl(url);
    });
}
