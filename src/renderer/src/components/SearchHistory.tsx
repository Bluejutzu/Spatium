import { useAuth0 } from "@auth0/auth0-react";
import { History } from "lucide-react";
import type { JSX } from "react";

import { Button } from "@/renderer/src/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/renderer/src/components/ui/dropdown-menu";

interface SearchHistoryItem {
    location: string;
    transport: string;
    time: string;
    timestamp: string;
}

interface SearchHistoryProps {
    history: SearchHistoryItem[];
    onSelectHistory: (item: SearchHistoryItem) => void;
}

export function SearchHistory({ history, onSelectHistory }: SearchHistoryProps): JSX.Element | null {
    const { isAuthenticated } = useAuth0();

    if (!isAuthenticated || history.length === 0) {
        return null;
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="w-9 h-9">
                    <History className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[300px]">
                <DropdownMenuLabel>Recent Searches</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {history.map((item, index) => (
                    <DropdownMenuItem
                        key={index}
                        onClick={() => onSelectHistory(item)}
                        className="flex flex-col items-start gap-1 py-2"
                    >
                        <div className="font-medium">{item.location}</div>
                        <div className="text-sm text-muted-foreground">
                            {item.transport} - {item.time}
                            <span className="ml-2 opacity-50">{item.timestamp}</span>
                        </div>
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
