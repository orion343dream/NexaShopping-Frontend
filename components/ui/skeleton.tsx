import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("bg-gradient-to-r from-indigo-100 via-indigo-50 to-indigo-100 animate-pulse rounded-lg shadow-sm", className)}
      {...props}
    />
  )
}

export { Skeleton }
