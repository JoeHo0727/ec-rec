import * as React from 'react'

import { cn } from '@/lib/utils'

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      'flex h-11 w-full rounded-[16px] border border-stone-200 bg-[rgba(255,255,255,0.82)] px-4 py-2 text-sm text-stone-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.5)] outline-none transition placeholder:text-stone-400 focus-visible:border-stone-400 focus-visible:ring-2 focus-visible:ring-stone-900/10 disabled:cursor-not-allowed disabled:opacity-50',
      className,
    )}
    {...props}
  />
))
Input.displayName = 'Input'

export { Input }
