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
    <SliderPrimitive.Track className="relative h-0.5 w-full grow bg-input">
      <SliderPrimitive.Range className="absolute h-full bg-foreground" />
    </SliderPrimitive.Track>
    {/* a fader cap, not a dot */}
    <SliderPrimitive.Thumb className="block h-[18px] w-2.5 rounded-btn border border-foreground bg-accent" />
  </SliderPrimitive.Root>
));
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
