/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { Moon, Sun } from "lucide-react";
import { type HTMLAttributes } from "react";

import { useTheme } from "../theme-provider";
import { Button } from "./button";

export function ThemeToggle({ className }: HTMLAttributes<HTMLButtonElement>) {
    const { theme, setTheme } = useTheme();

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            className={className}
        >
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
        </Button>
    );
}
