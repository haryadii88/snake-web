# snake-web

A nostalgic, Nokia-inspired Snake game built with vanilla HTML, CSS, and JavaScript. Optimized for GitHub Pages hosting.

## Features

- Responsive canvas game board with pixel-art aesthetic
- Keyboard, WASD, and on-screen controls for desktop and mobile play
- Pause/resume support and automatic speed ramp-up as you score
- Local high-score tracking via `localStorage`

## Getting Started

### Run locally

```bash
# from the repository root
python -m http.server 8000
```

Open <http://localhost:8000> in your browser and start playing.

### Deploy to GitHub Pages

1. Commit and push the repository to GitHub.
2. In your repository settings, enable GitHub Pages and select the `main` branch with the root directory.
3. Visit the published URL (e.g., `https://<username>.github.io/snake-web/`).

## Project Structure

```
.
├── index.html      # Game markup
├── styles.css      # Nokia-inspired styling
├── script.js       # Game logic
└── docs/
    └── prd_prompt_idea.md
```
