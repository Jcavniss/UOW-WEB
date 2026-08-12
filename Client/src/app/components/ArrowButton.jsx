import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "./ui/utils";
export function ArrowButton({ direction, enabled, onClick }) {
  const Icon = direction === "left" ? ChevronLeft : ChevronRight;
  return (
    <button
      onClick={onClick}
      disabled={!enabled}
      aria-label={direction === "left" ? "Go back" : "Go forward"}
      className={cn(
        "size-9 rounded-full border flex items-center justify-center transition-all duration-200",
        enabled
          ? "border-border hover:border-primary/60 hover:bg-primary/10 text-foreground cursor-pointer"
          : "border-border/30 text-muted-foreground/25 cursor-not-allowed",
      )}
    >
      <Icon className="size-4" />
    </button>
  );
}
