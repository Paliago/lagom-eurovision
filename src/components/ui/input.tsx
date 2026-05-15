import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-[#f0f0f5] placeholder:text-[#8a8a9a]/60 selection:bg-[#f5b800] selection:text-[#0a0a0f] border-white/[0.08] flex h-12 w-full min-w-0 rounded-xl border bg-[#12121a] px-4 py-2 text-base shadow-none transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-[#f5b800]/40 focus-visible:ring-2 focus-visible:ring-[#f5b800]/20",
        "aria-invalid:ring-red-500/20 aria-invalid:border-red-500/40",
        className
      )}
      {...props}
    />
  )
}

export { Input }
