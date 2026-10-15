import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-btn text-sm font-semibold disabled:pointer-events-none disabled:opacity-40",
  {
    variants: {
      variant: {
        default: "brick brick-y hover:brightness-[1.04]",
        secondary: "brick brick-w text-foreground",
        ghost: "hover:bg-muted transition-colors",
      },
      size: { default: "h-10 px-4", sm: "h-8 px-3", lg: "h-12 px-6 text-[15px]", icon: "h-10 w-10" },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
