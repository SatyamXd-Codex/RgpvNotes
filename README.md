# RGPV Notes Portal

A free, production-ready static website for RGPV students to download **BTech** and **Diploma** Notes, Previous Year Question Papers (PYQ), and Syllabus in PDF format.

🌐 **Live Site:** [https://satyamxd-codex.github.io/RgpvNotes/](https://satyamxd-codex.github.io/RgpvNotes/)

---

## Features

- 📚 Notes, PYQ, and Syllabus for all RGPV semesters
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
├── index.html          # Homepage — choose BTech or Diploma
├── btech.html          # BTech category selection
├── diploma.html        # Diploma category selection
├── category.html       # PDF listing with search
├── style.css           # All styles (responsive, dark mode)
├── script.js           # PDF loader, search, dark mode, animations
├── .nojekyll           # GitHub Pages: bypass Jekyll processing
└── data/
    ├── btech/
    │   ├── notes/sem1…sem8/   ← Add PDFs + manifest.json here
    │   ├── pyq/sem1…sem8/
    │   └── syllabus/
    └── diploma/
        ├── notes/sem1…sem6/
        ├── pyq/sem1…sem6/
        └── syllabus/
```

## Adding PDFs

1. Upload PDF files to the appropriate folder (e.g., `data/btech/notes/sem1/`).
2. Create or update a `manifest.json` in that folder listing the filenames:

```json
[
  "Applied_Mathematics_Notes.pdf",
  "Engineering_Physics_Unit1.pdf"
]
```

The website automatically reads `manifest.json` and displays the files as downloadable cards.

## Deployment (GitHub Pages)

1. Push this repository to GitHub.
2. Go to **Settings → Pages**.
3. Set **Source** to `Deploy from a branch` → `main` → `/ (root)`.
4. The site will be live at `https://<username>.github.io/<repo>/`.

## License

MIT License — free to use and modify.