import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { cn } from "../../lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-bold transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-white shadow-[var(--shadow-card)] hover:bg-primary-hover",
        destructive: "bg-danger text-white hover:bg-danger-strong",
        warning: "bg-warning-strong text-white hover:bg-warning",
        outline: "border-[1.5px] border-line bg-surface text-ink hover:bg-surface-muted",
        "outline-primary": "border-[1.5px] border-primary bg-surface text-primary hover:bg-primary-soft",
        "outline-danger": "border-[1.5px] border-danger-soft bg-surface text-danger hover:bg-danger-soft",
        secondary: "bg-primary-soft text-primary hover:bg-primary-soft/70",
        ghost: "text-ink hover:bg-surface-muted",
        "ghost-primary": "text-primary hover:bg-primary-soft",
        "ghost-danger": "text-danger hover:bg-danger-soft",
        "ghost-success": "text-success hover:bg-success-soft",
        "ghost-warning": "text-warning-strong hover:bg-warning-soft",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4",
        sm: "h-8 px-3 text-xs",
        lg: "h-11 px-6 text-base",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

const Button = React.forwardRef(({ className, variant, size, asChild = false, type = "button", ...props }, ref) => {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      ref={ref}
      type={asChild ? undefined : type}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
});
Button.displayName = "Button";

// eslint-disable-next-line react-refresh/only-export-components
export { Button, buttonVariants };
