import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "@/lib/utils";

// role="slider" lives on the thumb, so its name and spoken value go there, not on the root
type Props = React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> & { "aria-valuetext"?: string };

const Slider = React.forwardRef<React.ElementRef<typeof SliderPrimitive.Root>, Props>(({ className, "aria-label": label, "aria-valuetext": valueText, ...props }, ref) => (
  <SliderPrimitive.Root ref={ref} className={cn("relative flex h-5 w-full touch-none select-none items-center", className)} {...props}>
    <SliderPrimitive.Track className="relative h-1.5 w-full grow rounded-full bg-muted">
      <SliderPrimitive.Range className="absolute h-full rounded-full bg-accent" />
    </SliderPrimitive.Track>
    {/* a 1x1 brick you slide along; the invisible ::before gives a 44px touch target */}
    <SliderPrimitive.Thumb
      aria-label={label}
      aria-valuetext={valueText}
      className="relative block h-5 w-5 rounded-[6px] border-2 border-foreground bg-accent shadow-[0_2px_0_hsl(var(--accent-edge))] before:absolute before:-inset-3 before:content-['']"
    />
  </SliderPrimitive.Root>
));
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
