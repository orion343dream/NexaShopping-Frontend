import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-slate-400 selection:bg-indigo-500 selection:text-white h-10 w-full min-w-0 rounded-lg border-2 border-indigo-200 bg-white/60 backdrop-blur px-4 py-2.5 text-base shadow-sm transition-all duration-200 outline-none file:inline-flex file:h-7 file:border-0 file:bg-gradient-to-br file:from-indigo-500 file:to-purple-600 file:text-white file:text-sm file:font-semibold file:px-3 file:py-1 file:rounded-md file:cursor-pointer disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-indigo-400/50 focus-visible:shadow-md",
        "aria-invalid:ring-red-500/20 dark:aria-invalid:ring-red-500/40 aria-invalid:border-red-500",
        className
      )}
      {...props}
    />
  )
}

export { Input }
