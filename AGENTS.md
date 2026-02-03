# AGENTS.md
This file provides guidance to Verdent when working with code in this repository.

## Table of Contents
1. Commonly Used Commands
2. High-Level Architecture & Structure
3. Key Rules & Constraints
4. Development Hints

## Commands
- **No build/test scripts**: This repository contains raw component files intended to be copied into a Next.js project.
- **Manual Verification**: Code changes must be verified statically as there is no local runtime environment.

## Architecture
- **Type**: React Component (shadcn/ui compatible).
- **Core Component**: `swipeable-item.tsx`
  - Uses `Pointer Events` for drag interactions (mouse/touch).
  - Uses `class-variance-authority` (cva) for variants.
  - No external animation libraries (custom CSS transitions).
- **Demo**: `page.tsx` showcases usage (Inbox example).
- **Dependencies**: `lucide-react`, `clsx`, `tailwind-merge`, `class-variance-authority`.

## Key Rules & Constraints
- **Import Paths**: Files use Next.js aliases (e.g., `@/lib/utils`, `@/components/ui/swipeable-item`) that **do not exist** in this flat repository. **Do not change them** to relative paths unless explicitly asked; they are correct for the target environment.
- **"use client"**: Required at the top of the component file.
- **Tailwind**: All styling uses Tailwind classes; avoid inline styles except for dynamic transforms.
- **No Refactoring for Local Run**: Do not add `package.json` or restructure folders to make it runnable locally unless explicitly requested for a demo. Keep the flat structure.

## Development Hints
- **Swipe Logic**: Implemented via `onPointerDown/Move/Up` and `setPointerCapture`.
- **Action Slabs**: Rendered absolutely behind the main content; `opacity` transitions handle reveal.
- **Modifying Props**: If adding props, update the `SwipeableItemProps` interface and the default destructuring in the component.
