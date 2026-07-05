"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon, Laptop } from "lucide-react";

export function ThemeSwitcher() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-9 w-24 border border-border rounded-md bg-muted/50 animate-pulse"></div>;
  }

  return (
    <div className="flex items-center gap-1 border border-border rounded-md p-1 bg-card h-9">
      <button
        onClick={() => setTheme("light")}
        className={`p-1 rounded-sm transition-colors ${theme === "light" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-muted"}`}
        title="Giao diện Sáng"
      >
        <Sun className="h-4 w-4" />
      </button>
      <button
        onClick={() => setTheme("system")}
        className={`p-1 rounded-sm transition-colors ${theme === "system" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-muted"}`}
        title="Theo Hệ thống"
      >
        <Laptop className="h-4 w-4" />
      </button>
      <button
        onClick={() => setTheme("dark")}
        className={`p-1 rounded-sm transition-colors ${theme === "dark" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-muted"}`}
        title="Giao diện Tối"
      >
        <Moon className="h-4 w-4" />
      </button>
    </div>
  );
}
