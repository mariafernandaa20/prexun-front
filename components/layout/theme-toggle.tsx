"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ThemeToggle() {
  const { setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="relative z-50">
          <Sun />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="z-50">
        <DropdownMenuItem
          onClick={() => setTheme("light")}
          className="hover:cursor-pointer"
        >
          Light
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("dark")}
          className="hover:cursor-pointer"
        >
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("system")}
          className="hover:cursor-pointer"
        >
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function ThemeToggleSidebar() {
  const { theme, setTheme } = useTheme();
  return (
    <div className="flex gap-2 group-data-[collapsible=icon]:flex-col">
      <button onClick={() => setTheme("light")} className={`p-2 rounded-md text-white ${theme === "light" ? "bg-primary text-white" : ""}`}>
        <Sun className="w-4 h-4"/>
      </button>
      <button onClick={() => setTheme("dark")} className={`p-2 rounded-md text-white ${theme === "dark" ? "bg-primary text-white" : ""}`}>
        <Moon className="w-4 h-4"/>
      </button>
      <button onClick={() => setTheme("system")} className={`p-2 rounded-md text-white ${theme === "system" ? "bg-primary text-white" : ""}`}>
        <Monitor className="w-4 h-4"/>
      </button>
    </div>
  );
}
