import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "@/lib/utils";

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn("relative flex h-5 w-full touch-none select-none items-center", className)}
    {...props}
  >
    <SliderPrimitive.Track className="relative h-1.5 w-full grow rounded-full bg-muted">
      <SliderPrimitive.Range className="absolute h-full rounded-full bg-accent" />
    </SliderPrimitive.Track>
    {/* a 1x1 brick you slide along */}
    <SliderPrimitive.Thumb className="block h-5 w-5 rounded-[6px] border-2 border-foreground bg-accent shadow-[0_2px_0_hsl(var(--accent-edge))]" />
  </SliderPrimitive.Root>
));
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
