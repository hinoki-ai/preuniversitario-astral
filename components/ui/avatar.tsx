"use client"

import type * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"
import { EnergyOrb } from "@/components/EnergyOrb"

import { cn } from "@/lib/utils"

function Avatar({
  className,
  useEnergyOrb = true,
  size = "md",
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Root> & {
  useEnergyOrb?: boolean
  size?: "sm" | "md" | "lg" | "xl"
}) {
  if (useEnergyOrb) {
    return <EnergyOrb size={size} className={className} />
  }

  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      className={cn("relative flex size-8 shrink-0 overflow-hidden rounded-full", className)}
      {...props}
    />
  )
}

function AvatarImage({ className, ...props }: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  return (
    <AvatarPrimitive.Image data-slot="avatar-image" className={cn("aspect-square size-full", className)} {...props} />
  )
}

function AvatarFallback({ className, ...props }: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn("bg-muted flex size-full items-center justify-center rounded-full", className)}
      {...props}
    />
  )
}

export { Avatar, AvatarImage, AvatarFallback }
