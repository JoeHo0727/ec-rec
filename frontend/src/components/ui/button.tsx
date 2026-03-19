import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[16px] border text-sm font-semibold transition-all duration-200 active:scale-[0.985] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ring-offset-background',
  {
    variants: {
      variant: {
        default:
          'border-zinc-950 bg-zinc-950 text-zinc-50 shadow-[0_20px_40px_rgba(15,23,42,0.16)] hover:-translate-y-0.5 hover:bg-black',
        secondary: 'border-stone-300/90 bg-stone-100/88 text-stone-800 hover:bg-stone-200/88',
        outline: 'border-zinc-300/85 bg-white/84 text-zinc-800 shadow-[0_10px_24px_rgba(15,23,42,0.05)] hover:border-zinc-400 hover:bg-white',
        ghost: 'border-transparent bg-transparent text-zinc-500 hover:bg-white/78 hover:text-zinc-900',
      },
      size: {
        default: 'h-11 px-4 py-2',
        sm: 'h-8 px-3 text-xs',
        lg: 'h-12 px-5',
        icon: 'h-10 w-10 rounded-[14px]',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
  },
)
Button.displayName = 'Button'

export { Button, buttonVariants }
