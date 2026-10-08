# Untitled

The website for **Untitled**: six Learn2Earn fellows building in public.

The concept: the site is a blank page that six coloured cursors (one per member) build in front of you as you scroll. They sketch wireframes in pencil, drag photos in, type names (with the odd typo), flood sections with colour, and leave.

## Run it

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # static site in dist/
npm run preview  # serve the built site
```

## Edit the content

Everything lives in **`src/data/site.ts`**: names, roles, bios, colours, projects, socials, videos, the Learn2Earn journey and the rejected-names graveyard. Lines marked `PLACEHOLDER` are meant to be replaced.

- **Photos:** put files in `public/images/` and set `photo: '/images/ada.jpg'` on a member. Until then a sketched placeholder shows.
- **Project screenshots:** set `image: '/images/danfo.png'` on a project.
- **Video thumbnails:** set `thumb: '/images/drop-1.jpg'` on a drop.
- **Member colours:** each member has one of `lime`, `apricot`, `lilac`, `blush`, `sky`, `butter`.
- **Member slugs** (`ada`, `tobi`, …) are used for page URLs (`/members/ada`) and for linking people to projects, so change them everywhere at once.

## How it's built

- [Astro](https://astro.build) (static output), [GSAP](https://gsap.com) with ScrollTrigger and SplitText, [Lenis](https://lenis.darkroom.engineering) smooth scrolling.
- Fonts (self-hosted via Fontsource): Anybody (variable width), Fraunces italic, JetBrains Mono, Nanum Pen Script.
- `src/scripts/actor.ts` is the cursor engine (human-like movement, clicks, carrying elements).
- `src/scripts/sketch.ts` draws the hand-drawn pencil lines.
- `src/scripts/type.ts` handles typing with typos.
- Each homepage section has a component in `src/components/` and an animation in `src/scripts/sections/`.
- Visitors who prefer reduced motion get the finished page with no scroll animations.
- `public/grain.png` is the paper texture (regenerate with `node scripts/make-grain.mjs`).
