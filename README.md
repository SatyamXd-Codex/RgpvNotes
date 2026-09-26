# RGPV Diploma Notes Portal

A free, production-ready static website for RGPV students to download **Diploma** Notes, Previous Year Question Papers (PYQ), and Syllabus PDFs.

🌐 **Live Site:** [https://satyamxd-codex.github.io/RgpvNotes/](https://satyamxd-codex.github.io/RgpvNotes/)

---

## Features

- 📚 Diploma Notes, PYQ, and Syllabus resources
- 🔍 Instant search by subject name or paper code
- 🌙 Dark mode toggle
- 📱 Fully responsive (mobile + desktop)
- ⚡ Fast loading, no backend required
- 🎨 Modern UI with smooth animations and ripple effects
- ♿ Accessible (ARIA labels, semantic HTML)

## Tech Stack

- HTML5, CSS3, Vanilla JavaScript
- [Google Fonts — Inter](https://fonts.google.com/specimen/Inter)
- [Font Awesome 6](https://fontawesome.com/)
- Optimized for GitHub Pages

## Project Structure

```
├── index.html          # Homepage — Diploma resources
├── diploma.html        # Diploma category selection redirect
├── category.html       # Legacy query redirect to Diploma routes
├── style.css           # All styles (responsive, dark mode)
├── script.js           # PDF loader, search, dark mode, animations
├── .nojekyll           # GitHub Pages: bypass Jekyll processing
└── data/
    └── diploma/
        ├── notes/sem1…sem6/
        ├── pyq/sem1…sem6/
        └── syllabus/
```

## Adding PDFs

1. Upload PDF files to the appropriate folder (e.g., `data/diploma/notes/sem1/`).
2. Files are discovered automatically through the GitHub contents API and displayed as downloadable cards.

## Deployment (GitHub Pages)

1. Push this repository to GitHub.
2. Go to **Settings → Pages**.
3. Set **Source** to `Deploy from a branch` → `main` → `/ (root)`.
4. The site will be live at `https://<username>.github.io/<repo>/`.

## License

MIT License — free to use and modify.
