'use client'

import * as AspectRatioPrimitive from '@radix-ui/react-aspect-ratio'

function AspectRatio({
  ...props
}: React.ComponentProps<typeof AspectRatioPrimitive.Root>) {
  return <aspectratioprimitive.Root data-slot="aspect-ratio" {...props} />
}

export { AspectRatio }
