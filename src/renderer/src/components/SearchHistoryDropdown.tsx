/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { useAuth0 } from "@auth0/auth0-react";
import { useSearchHistory } from "@renderer/hooks/useSearchHistory";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

interface SearchHistoryDropdownProps {
    onSelect: (query: string) => void;
}

export function SearchHistoryDropdown({ onSelect }: SearchHistoryDropdownProps) {
    const { searchHistory } = useSearchHistory();
    const { isAuthenticated, loginWithRedirect } = useAuth0();

    if (!isAuthenticated) {
        return (
            <button
                onClick={() => loginWithRedirect()}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
                Sign in to view search history
            </button>
        );
    }

    if (searchHistory.length === 0) {
        return <p className="text-sm text-muted-foreground">No recent searches</p>;
    }

    return (
        <Select onValueChange={onSelect}>
            <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Recent searches" />
            </SelectTrigger>
            <SelectContent>
                {searchHistory.map(item => (
                    <SelectItem key={item.timestamp} value={item.query}>
                        {item.query}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
