import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold tracking-wide transition-all duration-200 disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-[#f5b800]/50 active:scale-[0.97] select-none",
  {
    variants: {
      variant: {
        default:
          "bg-[#f5b800] text-[#0a0a0f] shadow-[0_0_24px_rgba(245,184,0,0.15)] hover:bg-[#ffcc1a] hover:shadow-[0_0_32px_rgba(245,184,0,0.25)]",
        destructive:
          "bg-red-500 text-white shadow-sm hover:bg-red-400",
        outline:
          "border border-white/[0.12] bg-transparent text-[#f0f0f5] hover:bg-white/[0.06] hover:border-white/[0.2]",
        secondary:
          "bg-[#1a1a26] text-[#f0f0f5] border border-white/[0.08] hover:bg-[#222233] hover:border-white/[0.14]",
        ghost:
          "text-[#8a8a9a] hover:text-[#f0f0f5] hover:bg-white/[0.04]",
        link: "text-[#f5b800] underline-offset-4 hover:underline",
        accent:
          "bg-[#ff2d78] text-white shadow-[0_0_24px_rgba(255,45,120,0.15)] hover:bg-[#ff4d8f] hover:shadow-[0_0_32px_rgba(255,45,120,0.25)]",
      },
      size: {
        default: "h-11 px-5 py-2.5 has-[>svg]:px-4",
        sm: "h-9 rounded-lg gap-1.5 px-3 text-xs has-[>svg]:px-2.5",
        lg: "h-12 rounded-xl px-7 text-base has-[>svg]:px-5",
        icon: "size-11",
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
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export { Button, buttonVariants }
