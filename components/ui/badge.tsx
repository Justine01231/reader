import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-zinc-900 text-zinc-50 dark:bg-zinc-50 dark:text-zinc-900",
        secondary:
          "border-transparent bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100",
        outline:
          "border-zinc-300 text-zinc-900 dark:border-zinc-700 dark:text-zinc-100",
        accent:
          "border-transparent bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300",
        success:
          "border-transparent bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300",
        warning:
          "border-transparent bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };