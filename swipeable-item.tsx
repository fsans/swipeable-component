"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface SwipeAction {
  /** Unique key – used internally to map callbacks */
  id: string;
  /** Label shown under the icon */
  label: string;
  /** Any valid React node rendered inside the button (icon, etc.) */
  icon: React.ReactNode;
  /** Tailwind or inline background colour class / style for the action slab */
  color: string;
  /** Fired when the user taps the revealed action button */
  onAction: () => void;
}

export interface SwipeableItemProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof swipeableItemVariants> {
  /** Actions revealed when the user swipes LEFT (trailing edge) */
  trailingActions?: SwipeAction[];
  /** Actions revealed when the user swipes RIGHT (leading edge) */
  leadingActions?: SwipeAction[];
  /**
   * Minimum drag distance (px) before the row snaps open.
   * @default 60
   */
  threshold?: number;
  /**
   * Maximum translate distance the row can travel (px).
   * @default 160
   */
  maxSwipe?: number;
  /**
   * Duration in ms for the snap animation.
   * @default 300
   */
  snapDuration?: number;
  /** Rendered as the main (draggable) surface of the row. */
  children: React.ReactNode;
}

// ---------------------------------------------------------------------------
// cva – size & visual variants (mirrors shadcn pattern)
// ---------------------------------------------------------------------------
const swipeableItemVariants = cva(
  // base
  "relative overflow-hidden w-full",
  {
    variants: {
      size: {
        sm: "min-h-[48px]",
        md: "min-h-[72px]",
        lg: "min-h-[88px]",
      },
      variant: {
        default: "bg-background border-b border-border last:border-b-0",
        card: "bg-card rounded-lg shadow-sm mb-2",
        ghost: "bg-transparent border-b border-border/40 last:border-b-0",
      },
    },
    defaultVariants: {
      size: "md",
      variant: "default",
    },
  }
);

// ---------------------------------------------------------------------------
// Internal helper – single action slab
// ---------------------------------------------------------------------------
function ActionSlab({ action }: { action: SwipeAction }) {
  return (
    <button
      data-swipeable-action="true"
      onClick={action.onAction}
      className={cn(
        "flex-1 flex flex-col items-center justify-center gap-0.5",
        "text-white text-[10px] font-semibold tracking-wide",
        "transition-opacity hover:opacity-80 active:opacity-60",
        action.color
      )}
    >
      {action.icon}
      <span>{action.label}</span>
    </button>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
const SwipeableItem = React.forwardRef<HTMLDivElement, SwipeableItemProps>(
  (
    {
      className,
      variant,
      size,
      trailingActions = [],
      leadingActions = [],
      threshold = 60,
      maxSwipe = 160,
      snapDuration = 300,
      children,
      ...props
    },
    ref
  ) => {
    // -- state ----------------------------------------------------------
    const [offset, setOffset] = React.useState(0);
    const [isDragging, setIsDragging] = React.useState(false);
    const [isAnimating, setIsAnimating] = React.useState(false);
    /** null | "leading" | "trailing" */
    const [snappedSide, setSnappedSide] = React.useState<"leading" | "trailing" | null>(null);

    // -- refs -----------------------------------------------------------
    const rowRef = React.useRef<HTMLDivElement>(null);
    const startX = React.useRef(0);
    const startOffset = React.useRef(0);
    const activePointerId = React.useRef<number | null>(null);

    // -- derived --------------------------------------------------------
    const actionSlabWidth = 72; // px per action slab
    const leadingBandWidth = leadingActions.length * actionSlabWidth;
    const trailingBandWidth = trailingActions.length * actionSlabWidth;

    /** 0 → 1 reveal ratio for leading (swipe-right) */
    const revealLeading = Math.min(Math.max(offset, 0) / leadingBandWidth, 1);
    /** 0 → 1 reveal ratio for trailing (swipe-left) */
    const revealTrailing = Math.min(Math.abs(Math.min(offset, 0)) / trailingBandWidth, 1);

    // -- helpers --------------------------------------------------------
    const snapBack = React.useCallback(() => {
      setIsAnimating(true);
      setOffset(0);
      setSnappedSide(null);
      setTimeout(() => setIsAnimating(false), snapDuration);
    }, [snapDuration]);

    const snapOpen = React.useCallback((side: "leading" | "trailing") => {
      setIsAnimating(true);
      setOffset(side === "leading" ? leadingBandWidth : -trailingBandWidth);
      setSnappedSide(side);
      setTimeout(() => setIsAnimating(false), snapDuration);
    }, [snapDuration, leadingBandWidth, trailingBandWidth]);

    // -- pointer handlers -----------------------------------------------
    const onPointerDown = React.useCallback((e: React.PointerEvent) => {
      if (e.target instanceof HTMLElement && e.target.closest("[data-swipeable-action]")) return;
      activePointerId.current = e.pointerId;
      startX.current = e.clientX;
      startOffset.current = offset;
      setIsDragging(true);
      rowRef.current?.setPointerCapture(e.pointerId);
    }, [offset]);

    const onPointerMove = React.useCallback((e: React.PointerEvent) => {
      if (e.pointerId !== activePointerId.current) return;
      const delta = e.clientX - startX.current;
      let next = startOffset.current + delta;

      // hard clamp
      next = Math.max(-maxSwipe, Math.min(maxSwipe, next));

      // rubber-band past the snapped position
      if (snappedSide === "leading" && next > leadingBandWidth) {
        next = leadingBandWidth + (next - leadingBandWidth) * 0.25;
      }
      if (snappedSide === "trailing" && next < -trailingBandWidth) {
        next = -trailingBandWidth + (next + trailingBandWidth) * 0.25;
      }

      setOffset(next);
    }, [maxSwipe, snappedSide, leadingBandWidth, trailingBandWidth]);

    const onPointerUp = React.useCallback(() => {
      setIsDragging(false);
      activePointerId.current = null;

      // Already snapped open – did the user drag it back past threshold?
      if (snappedSide === "leading" && offset < threshold) { snapBack(); return; }
      if (snappedSide === "trailing" && offset > -threshold) { snapBack(); return; }

      // Not yet snapped – did the user cross the threshold?
      if (!snappedSide) {
        if (offset > threshold) { snapOpen("leading"); return; }
        if (offset < -threshold) { snapOpen("trailing"); return; }
        snapBack();
      }
    }, [offset, snappedSide, threshold, snapBack, snapOpen]);

    // -- transition style (only when not actively dragging) ------------
    const transitionCss: React.CSSProperties = isDragging
      ? {}
      : { transition: `transform ${snapDuration}ms cubic-bezier(.4, 0, .2, 1)` };

    // -- render ---------------------------------------------------------
    return (
      <div
        ref={ref}
        className={swipeableItemVariants({ variant, size, className })}
        {...props}
      >
        {/* ── Leading action band (left side, swipe right) ── */}
        {leadingActions.length > 0 && (
          <div
            className="absolute inset-y-0 left-0 flex items-stretch"
            style={{
              width: leadingBandWidth,
              opacity: revealLeading > 0.08 ? 1 : 0,
              transition: "opacity 120ms ease",
            }}
          >
            {leadingActions.map((a) => (
              <ActionSlab key={a.id} action={a} />
            ))}
          </div>
        )}

        {/* ── Trailing action band (right side, swipe left) ── */}
        {trailingActions.length > 0 && (
          <div
            className="absolute inset-y-0 right-0 flex items-stretch"
            style={{
              width: trailingBandWidth,
              opacity: revealTrailing > 0.08 ? 1 : 0,
              transition: "opacity 120ms ease",
            }}
          >
            {trailingActions.map((a) => (
              <ActionSlab key={a.id} action={a} />
            ))}
          </div>
        )}

        {/* ── Main draggable surface ── */}
        <div
          ref={rowRef}
          className="relative z-10 h-full flex items-center cursor-grab active:cursor-grabbing select-none bg-background"
          style={{
            transform: `translateX(${offset}px)`,
            touchAction: "pan-y",
            ...transitionCss,
          }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          {children}
        </div>
      </div>
    );
  }
);

SwipeableItem.displayName = "SwipeableItem";

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------
export { SwipeableItem, swipeableItemVariants };
