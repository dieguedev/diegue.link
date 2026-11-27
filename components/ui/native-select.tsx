import * as React from "react"

import { cn } from "@/lib/utils/cn"

function NativeSelect({
  className,
  ...props
}: React.ComponentProps<"select">) {
  return (
    <select
      data-slot="native-select"
      className={cn(
        "flex h-10 w-full cursor-pointer rounded-base border-2 border-border bg-secondary-background px-3 py-2 text-sm font-base text-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-red-700 aria-invalid:focus-visible:ring-red-700",
        className,
      )}
      {...props}
    />
  )
}

export { NativeSelect }
