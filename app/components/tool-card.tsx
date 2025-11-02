import Link from "next/link";
import * as Icons from "lucide-react";
import { LucideIcon } from "lucide-react";
import { Tool } from "@/lib/tools";
import { cn } from "@/lib/utils";

interface ToolCardProps {
  tool: Tool;
}

export function ToolCard({ tool }: ToolCardProps) {
  // Dynamically get the icon component from lucide-react
  const iconMap = Icons as unknown as Record<string, LucideIcon>;
  const IconComponent = iconMap[tool.icon] || Icons.Wrench;

  return (
    <Link
      href={tool.href}
      className={cn(
        "group relative flex flex-col items-center gap-4 rounded-lg border border-border bg-card p-6 transition-all duration-300",
        "hover:border-primary hover:shadow-xl hover:shadow-primary/10 hover:scale-105 hover:-translate-y-1",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "dark:hover:border-primary dark:hover:shadow-primary/30"
      )}
      aria-label={`${tool.name}: ${tool.description}`}
    >
      <div className="flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground group-hover:shadow-lg group-hover:shadow-primary/30 dark:bg-primary/20 dark:group-hover:bg-primary">
        <IconComponent className="size-8" aria-hidden="true" />
      </div>

      <div className="flex flex-col items-center gap-2 text-center">
        <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors duration-300">
          {tool.name}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {tool.description}
        </p>
      </div>

      {tool.category && (
        <span className="absolute top-3 right-3 rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground border border-border/50">
          {tool.category}
        </span>
      )}
    </Link>
  );
}
