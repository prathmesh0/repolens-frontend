# UI revamp - design

Date: 2026-10-12 · Branch: `ui-revamp` · Status: approved in chat; built on one branch at the owner's request.

## Goal

Make Repolens look and feel like a modern product: clean, minimal, responsive from phone to desktop, with smooth motion. Visual and layout work only.

## Constraints (do not change)

- Colour palette: the orange `--primary` and teal `--secondary` tokens in light and dark. Tokens may gain derived tints; their base values do not change.
- All functionality, routes, flows, API calls, data shapes, validation and auth behaviour.
- No new features. No new UI framework; Tailwind v4, shadcn-style `ui/`, framer-motion stay.
- The file tree keeps its original structure (no virtualization).

## Direction

"Clean & minimal" (Linear/Vercel-like): Geist Sans for UI, Geist Mono only for code, paths and small labels; hairline borders; one soft shadow level; generous whitespace; short, snappy motion.

## 1. Foundation

- **Type:** `--font-sans` -> Geist Sans, `--font-mono` -> Geist Mono. The `next/font` variables are applied on `<html>` so `:root` can see them. Scale 12/14/16/20/28/40 px; tighter tracking on headings.
- **Shape:** `--radius` 0.625rem (inputs/buttons 10 px, cards 14 px).
- **Surfaces:** hairline `border-border`; dark mode relies on border and background steps more than shadows.
- **Motion tokens:** `--ease-product: cubic-bezier(0.22, 1, 0.36, 1)`; durations 150 / 250 / 400 ms. Shared framer presets in `src/lib/motion.ts` (fade-up, stagger, spring). `MotionConfig reducedMotion="user"` plus a CSS `prefers-reduced-motion` override. Page enter animation via `app/template.tsx`. Skeleton shimmer.
- **Utilities:** `bg-grid` / `bg-hero-glow` decorative backgrounds, fixed custom-scrollbar colours.
- **Base components restyled:** Button (press scale, focus ring), Card, Input, Textarea, Skeleton, DropdownMenu, CustomInput (remove hard-coded greys), toasts (radius, theme-aware).

## 2. App shell

- **Sidebar:** wordmark + logo, primary "New analysis" button, search, "Recent" list with animated active indicator. Collapsed = 64 px icon rail with titles; mobile = slide-over drawer with blurred overlay. Width animates with a spring.
- **Header:** 56 px, sticky, blurred background. Mobile menu button, single-icon theme toggle (same light/dark/system choices), initials avatar for the user menu (same info + logout).
- **Viewport:** `100dvh` instead of `h-screen` so mobile browser bars do not clip the input.

## 3. Auth and home

- **Login / Register:** split layout. Desktop: brand panel (gradient, tagline, three value points) + form. Mobile: form only. Background photo and glass card removed. Fields, validation, submit behaviour unchanged.
- **Home:** pill badge, gradient headline (same orange-to-teal), one combined URL input + Analyse bar, three feature cards with icons (3 columns -> 1), staggered entrance, minimal footer. `Particles` background replaced by CSS gradient + faint grid; the component stays in the repo, unused.

## 4. Chat page

- **Layout:** centred column, about 768 px.
- **Messages:** user = tinted bubble on the right; assistant = flat on the page with a small logo mark; streaming caret while tokens arrive; typing indicator restyled.
- **Cards:** repo info (stat chips for stars/forks/watchers, languages, owner, last synced), AI analysis (labelled sections, issues list), file tree (restyled rows only).
- **Progress:** slim stepper, same fields (percent, queue position, stage errors).
- **Input:** floating rounded bar, soft shadow, safe-area padding; quick actions become chips above it that scroll sideways on mobile. "Load earlier messages" becomes a ghost pill.
- **Skeletons:** match the new layouts.

## Responsiveness

Target widths 360 / 768 / 1280. No horizontal page scroll, touch targets at least 40 px, `100dvh`, safe-area insets on the chat input.

## Verification

`npx tsc --noEmit`, `npm run lint`, `npm run build`. Login and register can be screenshotted at 390 / 768 / 1280 without a backend. The screens behind login (shell, home, chat) need the owner's backend, so the owner reviews those manually.

## Risks

- One large branch: mitigated by building in the order above and checking each layer before the next.
- Visual regressions on screens that cannot be reached without a backend.
