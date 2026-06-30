import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | "premium"
  size?: "default" | "sm" | "lg" | "xl" | "icon" | "icon-sm"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        className={cn(
          // Base
          "inline-flex items-center justify-center whitespace-nowrap font-semibold transition-all duration-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          "disabled:pointer-events-none disabled:opacity-50",
          "active:scale-[0.97]",

          // Variants
          variant === "default" && [
            "bg-primary text-primary-foreground shadow-sm",
            "hover:bg-primary/90 hover:shadow-md hover:shadow-primary/20",
          ],
          variant === "destructive" && [
            "bg-destructive text-destructive-foreground shadow-sm",
            "hover:bg-destructive/90 hover:shadow-md hover:shadow-destructive/20",
          ],
          variant === "outline" && [
            "border border-border bg-surface text-foreground shadow-sm",
            "hover:bg-muted/60 hover:border-primary/30 hover:text-foreground",
          ],
          variant === "secondary" && [
            "bg-muted text-muted-foreground shadow-sm",
            "hover:bg-muted/80 hover:text-foreground",
          ],
          variant === "ghost" && [
            "text-muted-foreground",
            "hover:bg-muted/60 hover:text-foreground",
          ],
          variant === "link" && ["text-primary underline-offset-4", "hover:underline"],
          variant === "premium" && [
            "bg-gradient-to-r from-primary to-secondary text-white shadow-sm",
            "hover:opacity-95 hover:shadow-lg hover:shadow-primary/30",
          ],

          // Sizes
          size === "default" && "h-9  px-4    text-sm  rounded-xl",
          size === "sm" && "h-8  px-3    text-xs  rounded-lg",
          size === "lg" && "h-11 px-6    text-sm  rounded-xl",
          size === "xl" && "h-12 px-8    text-base rounded-2xl",
          size === "icon" && "h-9  w-9              rounded-xl",
          size === "icon-sm" && "h-8  w-8              rounded-lg",

          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
