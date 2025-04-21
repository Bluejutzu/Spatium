/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { useAuth0 } from "@auth0/auth0-react";
import { UserCircle } from "lucide-react";

import { Button } from "../ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "../ui/dropdown-menu";

export function AuthMenu() {
    const { isAuthenticated, loginWithRedirect, logout, user } = useAuth0();

    if (!isAuthenticated) {
        return (
            <Button onClick={() => loginWithRedirect()} variant="outline" className="bg-white/90 backdrop-blur-sm">
                Sign In
            </Button>
        );
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="bg-white/90 backdrop-blur-sm">
                    <UserCircle className="mr-2 h-4 w-4" />
                    {user?.name || user?.email}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
                    className="text-red-600 cursor-pointer"
                >
                    Sign Out
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
