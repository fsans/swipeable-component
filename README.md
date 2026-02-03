# SwipeableItem Component

A fully-featured React swipe-to-action component built for Next.js and shadcn/ui.

## Features

- **Touch & Mouse Support** — Works seamlessly with both touch and pointer devices
- **Customizable Actions** — Define leading (swipe-right) and trailing (swipe-left) actions
- **Multiple Variants** — `default`, `card`, and `ghost` styles out of the box
- **Smooth Animations** — Snappy snap-open/snap-back with configurable durations
- **Dark Mode Ready** — Inherits Tailwind CSS variables from your project
- **Accessibility** — Pointer Events with proper event capture

## Quick Start

1. Copy `swipeable-item.tsx` to your Next.js project's `components/ui/` directory.
2. Import and use:

```tsx
import { SwipeableItem, type SwipeAction } from "@/components/ui/swipeable-item";
import { Trash2 } from "lucide-react";

const actions: SwipeAction[] = [
  {
    id: "delete",
    label: "Delete",
    icon: <Trash2 size={18} />,
    color: "bg-red-500",
    onAction: () => console.log("deleted"),
  },
];

export default function MyList() {
  return (
    <SwipeableItem trailingActions={actions}>
      <p className="px-4">Swipe me left!</p>
    </SwipeableItem>
  );
}
```

## Documentation

Full API documentation and examples are available in [SWIPEABLE-ITEM.md](./SWIPEABLE-ITEM.md).

## Demo

A complete email inbox demo is included in `page.tsx`. Copy it to your Next.js `app/` directory to see it in action.

## Requirements

- React 16.8+
- Next.js with app router
- Tailwind CSS
- `class-variance-authority`
- `lucide-react` (for demo icons, optional for core component)

## License

See [LICENSE](./LICENSE).
