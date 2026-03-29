import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-300 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-lg hover:shadow-xl hover:scale-105 active:scale-95",
        destructive:
          "bg-gradient-to-br from-red-600 to-red-700 text-white shadow-lg hover:shadow-xl hover:scale-105 active:scale-95",
        outline:
          "border-2 border-indigo-200 bg-white/70 backdrop-blur text-indigo-700 hover:bg-indigo-50/50 hover:shadow-md active:scale-95",
        secondary:
          "bg-gradient-to-br from-slate-200 to-slate-300 text-slate-900 shadow-md hover:shadow-lg hover:scale-105 active:scale-95",
        ghost:
          "text-indigo-700 hover:bg-indigo-100/50 hover:shadow-sm active:scale-95",
        link: "text-indigo-600 underline-offset-4 hover:underline hover:text-indigo-700",
      },
      size: {
        default: "h-10 px-5 py-2.5 has-[>svg]:px-3 rounded-lg",
        xs: "h-7 gap-1 rounded-md px-2.5 text-xs has-[>svg]:px-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-9 rounded-lg gap-1.5 px-4 has-[>svg]:px-3",
        lg: "h-11 rounded-lg px-7 has-[>svg]:px-5",
        icon: "size-10 rounded-lg",
        "icon-xs": "size-7 rounded-md [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-9 rounded-lg",
        "icon-lg": "size-11 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
