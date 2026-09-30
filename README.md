# Mucyo — Personal Portfolio

A single-page React portfolio for **Mucyo**, Software Development student at **Lycée de Muhura, Rwanda**. It uses a sticky left sidebar with a scrolling right column, a dark navy theme and minimal motion. The layout is inspired by classic developer portfolios; the code, copy and identity are original.

## Features

- Sticky sidebar on desktop, hamburger overlay menu on mobile
- Active-section highlighting with `IntersectionObserver`
- Data-driven projects, skills, education, artwork and learning topics
- Artwork grid with an accessible lightbox (Esc to close, focus restored)
- IoT flow visualisation (Sensors → ESP32 → API → Database → Web dashboard)
- Accessible contact form (mailto fallback or form endpoint)
- Subtle Framer Motion animations, `prefers-reduced-motion` respected
- Semantic HTML, skip link, focus states, ARIA labels, SEO + Open Graph tags

## Tech stack

React 18 · Vite 5 · Framer Motion · plain CSS with variables

## Installation

```bash
npm install
```

## Development

```bash
npm run dev       # http://localhost:5173
```

## Build

```bash
npm run build     # outputs to dist/
npm run preview   # serve the production build locally
```

## Deployment

Push the project to GitHub first (`git init`, commit, push), then:

- **Vercel**: import the repo. Vercel detects Vite; `vercel.json` is included.
- **Netlify**: import the repo. `netlify.toml` sets `npm run build` and `dist`.
- **Render**: New → Static Site → connect the repo. `render.yaml` is included (build `npm install && npm run build`, publish `dist`).
- **GitHub Pages**: set `base: "/your-repo-name/"` in `vite.config.js`, build, and publish `dist`.

## Personal information

Edit `src/data/site.js`: name, title, school, tagline and contact details.
Set `email`, `github` and `linkedin` when ready (empty values show as "Coming soon" and greyed-out icons).
To receive form messages without a backend, create a form at Formspree (or similar) and paste its URL into `formEndpoint`. If only `email` is set, the form opens the visitor's email app.

## Add a project

Add an object to `src/data/projects.js`:

```js
{
  title: "My New Project",
  kind: "Personal Project",
  description: "What it does.",
  technologies: ["React.js", "Node.js"],
  github: "https://github.com/you/repo", // "" hides it
  demo: "",                               // "" hides it
  image: "",                              // optional
}
```

To use a project image, place it in `src/assets/images/` and set `image` with an import, e.g. `import shot from "../assets/images/booking.png"` at the top of `projects.js`, then `image: shot`.

## Add artwork

1. Put images (WebP or JPEG, about 1200px wide) in `src/assets/artwork/`.
2. Add an entry in `src/data/artwork.js` with `title`, `category`, `description`, `image: img("file.webp")` and `alt`.
3. The six SVG files provided are placeholders. Replace or delete them.

## Add education, skills or learning topics

- `src/data/education.js`: add another object to the array.
- `src/data/skills.js`: add a group or items.
- `src/data/learning.js`: add a string.

## Change colors

Edit the CSS variables at the top of `src/index.css` (`--bg`, `--text`, `--text-muted`, `--accent`, `--border`).

## Project structure

```
src/
├── assets/{images,artwork}
├── components/   Sidebar, MobileNav, Hero, About, Education, Projects, ProjectItem,
│                 Skills, IoT, Artwork, ArtworkItem, Learning, Contact, Footer (+ helpers)
├── data/         site, projects, skills, education, artwork, learning
├── hooks/        useActiveSection.js
├── App.jsx  main.jsx  index.css
```

## Skill constellation

The Skills section draws an animated constellation from `src/data/skills.js`. Add a group or a skill and its star appears automatically (up to about 6 groups and 6 skills per group looks best). The plain tag list stays underneath for accessibility.

## Online images

Project and About images and the artwork placeholders load from Unsplash and fall back to local placeholders or are hidden if they fail to load. Replace them with your own screenshots and artwork. Extras: cursor spotlight (desktop only), scroll progress bar, and rotating role text in the hero. All respect `prefers-reduced-motion`.
