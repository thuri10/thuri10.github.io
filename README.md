# LaByte - Security Research Blog

A personal blog documenting vulnerability research, web security, mobile security, and application security writeups.

**Live site:** [https://thuri10.github.io](https://thuri10.github.io)

## Requirements

The CI build pins specific versions. Use these for local development:

- **Hugo extended** `0.165.0` (must be the extended variant for Dart Sass support)
- **Dart Sass** `1.90.0`
- **Go** `1.26.1`
- **Node.js** `24.19.0`

## Local Development

```bash
# Install Node.js dependencies (husky, prettier, lint-staged)
npm install

# Start the development server
hugo server
```

## Production Build

```bash
hugo --gc --minify --enableGitInfo --forceSyncStatic
```

## Theme

Uses the [DoIt](https://github.com/HEIGE-PCloud/DoIt) Hugo theme as a git submodule.

```bash
# Add theme (one-time setup)
git submodule add https://github.com/HEIGE-PCloud/DoIt.git themes/DoIt

# Update to latest theme version
git submodule update --remote --merge
```

## Content

- **Posts:** `content/posts/` - Markdown files with YAML frontmatter
- **About page:** `content/about/index.md`
- **Author data:** `data/authors/`
- **Images:** `assets/` directory (referenced via `{{< image >}}` shortcode)

### Creating a New Post

```bash
hugo new posts/my-new-post.md
```

The archetype generates YAML frontmatter with sensible defaults. Posts are created as drafts - set `draft: false` when ready to publish.

### Frontmatter Reference

```yaml
---
title: "Post Title"
date: 2025-07-14T17:22:36+03:00
draft: true
authors: [Thuri]
lightgallery: true
tags: ["appsec", "websec"]
series: ["PortSwigger Labs"]
summary: "Short summary for SEO."
description: "Longer description for SEO."
toc:
    enable: true
    auto: false
---
```

## Formatting

- **Prettier** runs on `*.{js,css,md}` via lint-staged + husky pre-commit hook
- Config in `.prettierrc.json`: 4-space indent, double quotes, ES5 trailing commas

## Deployment

Pushing to the `development` branch triggers the GitHub Actions workflow which builds Hugo and deploys to GitHub Pages.

Pull requests to `development` trigger a build validation without deployment.

## License

Content is licensed under [CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/).
