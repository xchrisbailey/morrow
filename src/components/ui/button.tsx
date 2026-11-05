import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "#/lib/utils.ts";

// Motion follows design rule 7: hover in 140ms, out 200ms, press 90ms, all on
// --ease-standard. A hover steps up 1px; a press goes 1px below rest at 0.985.
const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-control border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap outline-none select-none transition-[background-color,border-color,color,translate,scale] duration-(--duration-out) ease-(--ease-standard) hover:translate-y-(--lift-button) hover:duration-(--duration-in) active:translate-y-(--press-offset) active:scale-(--press-scale) active:duration-(--duration-press) focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/25 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary-hover active:bg-primary-active aria-expanded:bg-primary-hover",
        secondary:
          "border-input bg-secondary text-secondary-foreground hover:bg-secondary-hover active:bg-secondary-active aria-expanded:bg-secondary-hover",
        soft: "bg-accent text-accent-foreground hover:bg-accent-hover aria-expanded:bg-accent-hover",
        outline:
          "border-border bg-transparent text-foreground hover:bg-secondary-hover active:bg-secondary-active aria-expanded:bg-secondary-hover",
        ghost:
          "text-foreground hover:bg-secondary-hover active:bg-secondary-active aria-expanded:bg-secondary-hover",
        destructive:
          "border-destructive-border bg-destructive-bg text-destructive-text hover:border-destructive focus-visible:ring-destructive/40",
        link: "text-link underline-offset-4 hover:translate-y-0 hover:text-link-hover hover:underline active:translate-y-0 active:scale-100",
      },
      size: {
        default:
          "h-(--size-control-md) gap-2 px-4 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3",
        xs: "h-6 gap-1 px-2 text-xs has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
        sm: "h-(--size-control-sm) gap-1.5 px-3 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-(--size-control-lg) gap-2 px-5 has-data-[icon=inline-end]:pr-4 has-data-[icon=inline-start]:pl-4",
        icon: "size-(--size-control-md)",
        "icon-xs": "size-6 [&_svg:not([class*='size-'])]:size-3.5",
        "icon-sm": "size-(--size-control-sm)",
        "icon-lg": "size-(--size-control-lg)",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
