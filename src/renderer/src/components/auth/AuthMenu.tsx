/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { useAuth0 } from "@auth0/auth0-react";
import { LogOut, User } from "lucide-react";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/renderer/src/components/ui/dropdown-menu";

import { Button } from "../ui/button";

export function AuthMenu() {
    const { loginWithRedirect, logout, user, isAuthenticated, isLoading } = useAuth0();

    if (isLoading) {
        return (
            <Button variant="ghost" size="sm">
                Loading...
            </Button>
        );
    }

    if (!isAuthenticated) {
        return (
            <Button onClick={() => loginWithRedirect()} size="sm">
                Sign In
            </Button>
        );
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center gap-2">
                    {user?.picture ? (
                        <img src={user.picture} alt={user.name} className="w-6 h-6 rounded-full" />
                    ) : (
                        <User className="w-4 h-4" />
                    )}
                    {user?.name}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="flex items-center gap-2" onClick={() => logout()}>
                    <LogOut className="w-4 h-4" />
                    <span>Log out</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
