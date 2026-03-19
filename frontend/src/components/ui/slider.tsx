import * as SliderPrimitive from '@radix-ui/react-slider'

import { cn } from '@/lib/utils'

function Slider({ className, ...props }: React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>) {
  return (
    <SliderPrimitive.Root
      className={cn('relative flex w-full touch-none select-none items-center', className)}
      {...props}
    >
      <SliderPrimitive.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-stone-200/90">
        <SliderPrimitive.Range className="absolute h-full bg-stone-900" />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb className="block h-4 w-4 rounded-full border-2 border-white bg-amber-500 shadow-[0_8px_18px_rgba(180,83,9,0.25)] transition hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-900/20" />
    </SliderPrimitive.Root>
  )
}

export { Slider }
