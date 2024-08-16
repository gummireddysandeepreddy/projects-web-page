  "use client";

  import { Laptop, Moon, Sun } from "lucide-react";
  import { useTheme } from "next-themes";
  import { Button } from "@/components/ui/button";
  import { useMounted } from "@/hooks/use-mounted";
  import { cn } from "@/lib/utils";
  import { Popover, PopoverTrigger, PopoverContent } from "./ui/popover";

  const OptionMode = [
    {
      value: "light",
      label: "Light",
      icon: Sun,
    },
    {
      value: "dark",
      label: "Dark",
      icon: Moon,
    },
    {
      value: "system",
      label: "System",
      icon: Laptop,
    },
  ] satisfies { value: string; label: string; icon: any }[];

  type ModeToggleProps = {
    isDesktop?: boolean;
  };

  export function ModeToggle({ isDesktop = true }: ModeToggleProps) {
    const { theme, setTheme } = useTheme();
    const mounted = useMounted();
    return mounted ? (
      isDesktop ? (
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="size-9">
              <Sun className="rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-full p-1">
            {OptionMode.map((option) => {
              const Icon = option.icon;
              return (
                <button
                  type="button"
                  key={option.value}
                  onClick={() => setTheme(option.value)}
                  className={cn(
                    "relative flex w-full cursor-default select-none items-center gap-2 rounded-sm px-3 py-1.5 text-sm outline-none transition-colors focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
                    theme === option.value && "bg-accent",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{option.label}</span>
                </button>
              );
            })}
          </PopoverContent>
        </Popover>
      ) : (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="flex size-9 w-full justify-start gap-2"
        >
          <Sun className="size-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute size-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span>{theme}</span>
        </Button>
      )
    ) : (
      <div className="size-9 animate-pulse rounded-md bg-primary/10" />
    );
  }