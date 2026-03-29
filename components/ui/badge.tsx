import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full border-2 px-3 py-1.5 text-xs font-semibold w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 aria-invalid:ring-red-500/20 dark:aria-invalid:ring-red-500/40 aria-invalid:border-red-500 transition-all duration-200 overflow-hidden",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-indigo-100 to-indigo-200 border-indigo-300 text-indigo-700 shadow-sm [a&]:hover:shadow-md [a&]:hover:scale-105",
        secondary:
          "bg-gradient-to-r from-slate-100 to-slate-200 border-slate-300 text-slate-700 shadow-sm [a&]:hover:shadow-md [a&]:hover:scale-105",
        destructive:
          "bg-gradient-to-r from-red-100 to-red-200 border-red-300 text-red-700 shadow-sm [a&]:hover:shadow-md [a&]:hover:scale-105",
        outline:
          "border-indigo-300 bg-white/50 backdrop-blur text-indigo-700 [a&]:hover:bg-indigo-50/70 [a&]:hover:shadow-md",
        ghost: "border-transparent text-indigo-700 [a&]:hover:bg-indigo-100/50 [a&]:hover:shadow-sm",
        link: "text-indigo-600 underline-offset-4 border-transparent [a&]:hover:underline [a&]:hover:text-indigo-700",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span"

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
