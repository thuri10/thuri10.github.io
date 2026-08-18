# AGENTS.md

Hugo personal blog using the [DoIt](https://github.com/HEIGE-PCloud/DoIt) theme. Deploys to GitHub Pages via Actions.

## Build requirements

The CI build (`.github/workflows/hugo.yaml`) defines pinned versions:

- **Hugo extended** `0.161.1` — must be the *extended* variant (needs Dart Sass)
- **Dart Sass** `1.90.0`
- **Go** `1.26.1`
- **Node.js** `22.18.0`
- **Timezone**: `Europe/Oslo`

Local build command (after installing the above):

```
hugo server
```

Production build:

```
hugo --gc --minify --enableGitInfo --forceSyncStatic
```

## Theme

The DoIt theme lives in `themes/DoIt` as a **git submodule**. Do not edit theme files directly — they will be overwritten on update.

Update the submodule:

```bash
git submodule update --remote --merge
```

## Content

- All posts live in `content/posts/` as Markdown files.
- The about page is `content/about/index.md`.
- Author data is in `data/authors/`.
- Images are referenced from `assets/` (not `static/`).

### Frontmatter

Posts use **YAML frontmatter** (`---`), not TOML (`+++`). Common fields:

```yaml
---
title: "Post Title"
date: 2025-07-14T17:22:36+03:00
draft: true            # set to false when ready to publish
authors: [Thuri]
lightgallery: true
tags: ["tag1", "tag2"]
summary: "Short summary."
toc:
    enable: true
    auto: false
description: "SEO description"
---
```

The archetype (`archetypes/default.md`) uses YAML frontmatter matching the post convention.

New posts are created as `draft: true`. Set `draft: false` to publish.

## Formatting

- **Prettier** runs on `*.{js,css,md}` via lint-staged + husky pre-commit hook.
- Config in `.prettierrc.json`: 4-space indent, double quotes, ES5 trailing commas.
- Install hooks after cloning: `npm install` (triggers `husky` via `prepare` script).

## Deployment

- Push to the `development` branch triggers the GitHub Actions deploy workflow.
- The workflow builds Hugo and deploys to GitHub Pages.
- `public/` is gitignored (generated build output).

## Gotchas

- The `baseURL` in `hugo.toml` is `https://thuri.10.github.io` (note: not `.github.io` but `.10.github.io`).
- Hugo extended is required because the DoIt theme uses SCSS/Dart Sass. Standard Hugo will fail.
- Goldmark renderer has `unsafe = true` — raw HTML in Markdown is allowed.
- Search uses Fuse.js (client-side). No external search service to configure.
