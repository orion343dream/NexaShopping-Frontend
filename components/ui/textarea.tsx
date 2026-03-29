import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "border-indigo-200 placeholder:text-slate-400 selection:bg-indigo-500 selection:text-white focus-visible:border-indigo-500 focus-visible:ring-indigo-400/50 aria-invalid:ring-red-500/20 dark:aria-invalid:ring-red-500/40 aria-invalid:border-red-500 bg-white/60 backdrop-blur flex field-sizing-content min-h-20 w-full rounded-lg border-2 px-4 py-2.5 text-base shadow-sm transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:shadow-md disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
