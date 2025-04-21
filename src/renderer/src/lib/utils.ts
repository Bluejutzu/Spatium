import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
    return twMerge(clsx(inputs));
}

export interface HistoryItem {
    location: string;
    transport: string;
    time: string;
    timestamp: number;
}

export const isExpired = (timestamp: number): boolean => {
    const threeDaysInMs = 3 * 24 * 60 * 60 * 1000;
    return Date.now() - timestamp > threeDaysInMs;
};

export const saveToHistory = (item: Omit<HistoryItem, "timestamp">): void => {
    const history = getHistory();
    const newItem = { ...item, timestamp: Date.now() };
    localStorage.setItem("searchHistory", JSON.stringify([newItem, ...history]));
};

export const getHistory = (): HistoryItem[] => {
    const history = localStorage.getItem("searchHistory");
    if (!history) return [];

    const items: HistoryItem[] = JSON.parse(history);
    const validItems = items.filter(item => !isExpired(item.timestamp));

    if (validItems.length !== items.length) {
        localStorage.setItem("searchHistory", JSON.stringify(validItems));
    }

    return validItems;
};

export const deleteHistoryItem = (timestamp: number): void => {
    const history = getHistory();
    const filtered = history.filter(item => item.timestamp !== timestamp);
    localStorage.setItem("searchHistory", JSON.stringify(filtered));
};

export const clearHistory = (): void => {
    localStorage.removeItem("searchHistory");
};
