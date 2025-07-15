"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function ModeToggle() {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <Button
      variant="outline"
      size="icon"
      aria-label="Toggle dark mode"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="relative"
    >
      <Sun className={`h-[1.2rem] w-[1.2rem] transition-all ${isDark ? 'opacity-100 scale-100' : 'opacity-0 scale-0'} absolute`} />
      <Moon className={`h-[1.2rem] w-[1.2rem] transition-all ${isDark ? 'opacity-0 scale-0' : 'opacity-100 scale-100'}`} />
    </Button>
  );
}
