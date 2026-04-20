
"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface PinInputProps {
  length?: number
  onComplete?: (value: string) => void
  className?: string
}

const PinInput = React.forwardRef<HTMLDivElement, PinInputProps>(
  ({ className, length = 4, onComplete, ...props }, ref) => {
    const handleComplete = React.useCallback(
      (value: string) => {
        if (onComplete && value.length === length) {
          onComplete(value)
        }
      },
      [length, onComplete]
    )

    return (
      <div className="flex items-center justify-center gap-2" ref={ref} {...props}>
        {Array.from({ length }).map((_, i) => (
          <input
            key={i}
            type="text"
            maxLength={1}
            className={cn(
              "h-10 w-10 rounded-md border border-input bg-background text-center text-lg focus:outline-none focus:ring-2 focus:ring-ring",
              className
            )}
            onChange={(e) => {
              // Handle input change
              const value = e.target.value
              if (value && i < length - 1) {
                const nextInput = e.target.nextElementSibling as HTMLInputElement
                if (nextInput) nextInput.focus()
              }
              
              // Collect all values and check if complete
              const allInputs = Array.from(
                e.target.parentElement?.querySelectorAll("input") || []
              ) as HTMLInputElement[]
              
              const fullValue = allInputs.map(input => input.value).join("")
              handleComplete(fullValue)
            }}
            onKeyDown={(e) => {
              // Handle backspace
              if (e.key === "Backspace" && !e.currentTarget.value && i > 0) {
                const prevInput = e.currentTarget.previousElementSibling as HTMLInputElement
                if (prevInput) {
                  prevInput.focus()
                  prevInput.select()
                }
              }
            }}
          />
        ))}
      </div>
    )
  }
)
PinInput.displayName = "PinInput"

export { PinInput }
