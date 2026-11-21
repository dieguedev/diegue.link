"use client"

import * as TabsPrimitive from "@radix-ui/react-tabs"

import * as React from "react"

import { cn } from "@/lib/utils/cn"

function Tabs({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn("w-full", className)}
      {...props}
    />
  )
}

interface IndicatorRect {
  x: number
  y: number
  width: number
  height: number
}

function TabsList({
  className,
  children,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  const listRef = React.useRef<HTMLDivElement>(null)
  const [indicator, setIndicator] = React.useState<IndicatorRect>()

  React.useLayoutEffect(() => {
    const list = listRef.current
    if (!list) return

    const update = () => {
      const active = list.querySelector<HTMLElement>('[data-state="active"]')
      if (!active) return
      setIndicator({
        x: active.offsetLeft,
        y: active.offsetTop,
        width: active.offsetWidth,
        height: active.offsetHeight,
      })
    }

    update()

    const mutationObserver = new MutationObserver(update)
    mutationObserver.observe(list, {
      subtree: true,
      attributeFilter: ["data-state"],
    })
    const resizeObserver = new ResizeObserver(update)
    resizeObserver.observe(list)

    return () => {
      mutationObserver.disconnect()
      resizeObserver.disconnect()
    }
  }, [])

  return (
    <TabsPrimitive.List
      ref={listRef}
      data-slot="tabs-list"
      className={cn(
        "relative inline-flex h-12 items-center justify-center rounded-base border-2 border-border bg-background p-1 text-foreground",
        className,
      )}
      {...props}
    >
      {indicator && (
        <span
          aria-hidden="true"
          className="absolute top-0 left-0 rounded-base border-2 border-border bg-main transition-[transform,width,height] duration-300 ease-ui motion-reduce:transition-none"
          style={{
            transform: `translate(${indicator.x}px, ${indicator.y}px)`,
            width: indicator.width,
            height: indicator.height,
          }}
        />
      )}
      {children}
    </TabsPrimitive.List>
  )
}

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "relative z-10 inline-flex items-center justify-center whitespace-nowrap rounded-base border-2 border-transparent px-2 py-1 gap-1.5 text-sm font-heading ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:text-main-foreground",
        className,
      )}
      {...props}
    />
  )
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      tabIndex={-1}
      className={cn(
        "mt-2 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className,
      )}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
