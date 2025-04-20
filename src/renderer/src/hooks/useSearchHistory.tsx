/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useState } from "react";

interface SearchHistoryItem {
    query: string;
    timestamp: number;
}

export function useSearchHistory() {
    const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
    const { isAuthenticated } = useAuth0();

    useEffect(() => {
        if (isAuthenticated) {
            loadSearchHistory();
        }
    }, [isAuthenticated]);

    const loadSearchHistory = async () => {
        try {
            // const token = await getAccessTokenSilently();
            // Here you would typically fetch from your backend API
            // For now, we'll use localStorage as a placeholder
            const history = JSON.parse(localStorage.getItem("searchHistory") || "[]");
            setSearchHistory(history);
        } catch (error) {
            console.error("Error loading search history:", error);
        }
    };

    const addSearchQuery = async (query: string) => {
        if (!isAuthenticated) return;

        try {
            const newHistory = [{ query, timestamp: Date.now() }, ...searchHistory].slice(0, 10); // Keep only last 10 searches

            setSearchHistory(newHistory);
            localStorage.setItem("searchHistory", JSON.stringify(newHistory));

            // Here you would typically sync with your backend API
            // const token = await getAccessTokenSilently();
            // await syncWithBackend(token, newHistory);
        } catch (error) {
            console.error("Error saving search:", error);
        }
    };

    return {
        searchHistory,
        addSearchQuery
    };
}
