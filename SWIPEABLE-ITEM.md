# SwipeableItem — shadcn/ui custom component

## 1. Where to drop the files

```
your-project/
├── components/
│   └── ui/
│       └── swipeable-item.tsx          ← the component
├── app/
│   └── swipeable-demo/
│       └── page.tsx                    ← usage demo (optional, delete after)
└── ...
```

The component lives in `components/ui/` exactly like every other
shadcn primitive — no extra config needed.


## 2. Peer dependencies (already in every shadcn project)

| package                  | why                                   |
|--------------------------|---------------------------------------|
| `class-variance-authority` | `cva` for variant definitions       |
| `lucide-react`           | icons (used in the demo, not the core)|
| `clsx` / `tailwind-merge`| already wired into your `cn` util    |

Nothing new to install.


## 3. Props cheat-sheet

| Prop              | Type              | Default | Description                                  |
|-------------------|-------------------|---------|----------------------------------------------|
| `variant`         | `default\|card\|ghost` | `default` | Visual style of the row                |
| `size`            | `sm\|md\|lg`      | `md`    | Row height                                   |
| `leadingActions`  | `SwipeAction[]`   | `[]`    | Buttons revealed on swipe **right**          |
| `trailingActions` | `SwipeAction[]`   | `[]`    | Buttons revealed on swipe **left**           |
| `threshold`       | `number` (px)     | `60`    | Drag distance before snap-open               |
| `maxSwipe`        | `number` (px)     | `160`   | Hard clamp on translate distance             |
| `snapDuration`    | `number` (ms)     | `300`   | Snap animation duration                      |
| `children`        | `ReactNode`       | —       | Your row content                             |

All standard `<div>` HTML attributes are forwarded (className, style, …).


## 4. SwipeAction shape

```tsx
interface SwipeAction {
  id: string;                  // unique key
  label: string;               // text under the icon
  icon: React.ReactNode;       // e.g. <Trash2 size={18} />
  color: string;               // Tailwind bg class, e.g. "bg-red-500"
  onAction: () => void;        // callback when tapped
}
```


## 5. Minimal usage

```tsx
import { SwipeableItem, type SwipeAction } from "@/components/ui/swipeable-item";
import { Trash2 } from "lucide-react";

const trailing: SwipeAction[] = [
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
    <SwipeableItem variant="default" size="md" trailingActions={trailing}>
      <p className="px-4 text-sm">Swipe me left!</p>
    </SwipeableItem>
  );
}
```


## 6. Customising colours / radius

Because the action slabs accept any Tailwind `bg-*` class, you can
theme them however you like:

```tsx
color: "bg-emerald-600"   // ← any bg utility
color: "bg-[#1a1a2e]"     // ← or an arbitrary value
```

The row itself inherits `bg-background` and `border-border` from your
existing shadcn/Tailwind CSS variables — dark mode works out of the box.


## 7. Things to keep in mind

* **`touchAction: "pan-y"`** is set on the draggable surface so vertical
  scrolling still works inside a scrollable list.
* The component uses **Pointer Events + `setPointerCapture`** which works
  for both mouse and touch — no extra library needed.
* `"use client"` is already at the top — safe to import anywhere in
  Next.js app-router pages or layouts.
