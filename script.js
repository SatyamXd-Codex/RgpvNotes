/**
 * RGPV Notes Portal - Main Script
 * Handles: dark mode, ripple, PDF loading, search, navigation
 */

'use strict';

/* ====================================================
   1. THEME (Dark Mode)
   ==================================================== */
const ThemeManager = (() => {
  const KEY = 'rgpv-theme';
  const ATTR = 'data-theme';
  const DARK = 'dark';
  const LIGHT = 'light';

  function init() {
    const saved = localStorage.getItem(KEY);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = saved || (prefersDark ? DARK : LIGHT);
    apply(theme);
    document.querySelectorAll('.theme-toggle').forEach(btn => {
      btn.addEventListener('click', toggle);
    });
  }

  function apply(theme) {
    document.documentElement.setAttribute(ATTR, theme);
    localStorage.setItem(KEY, theme);
    document.querySelectorAll('.theme-toggle').forEach(btn => {
      btn.setAttribute('aria-pressed', theme === DARK ? 'true' : 'false');
      const icon = btn.querySelector('i');
      if (icon) {
        icon.className = theme === DARK ? 'fas fa-sun' : 'fas fa-moon';
      }
    });
  }

  function toggle() {
    const current = document.documentElement.getAttribute(ATTR) || LIGHT;
    apply(current === DARK ? LIGHT : DARK);
  }

  return { init };
})();

/* ====================================================
   2. RIPPLE EFFECT
   ==================================================== */
function addRipple(e) {
  const btn = e.currentTarget;
  const circle = document.createElement('span');
  const diameter = Math.max(btn.clientWidth, btn.clientHeight);
  const radius = diameter / 2;
  const rect = btn.getBoundingClientRect();
  circle.style.cssText = `
    width:${diameter}px;height:${diameter}px;
    left:${e.clientX - rect.left - radius}px;
    top:${e.clientY - rect.top - radius}px;
  `;
  circle.classList.add('ripple');
  const old = btn.querySelector('.ripple');
  if (old) old.remove();
  btn.appendChild(circle);
  circle.addEventListener('animationend', () => circle.remove());
}

function initRipple() {
  document.querySelectorAll('.btn, .primary-card, .category-card').forEach(el => {
    el.addEventListener('click', addRipple);
  });
}

/* ====================================================
   3. HEADER / SCROLL BEHAVIOUR
   ==================================================== */
function initHeader() {
  const header = document.querySelector('.header');
  const scrollTopBtn = document.getElementById('scroll-top');

  if (!header) return;

  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    header.classList.toggle('scrolled', y > 10);
    if (scrollTopBtn) {
      scrollTopBtn.classList.toggle('visible', y > 300);
    }
  }, { passive: true });

  if (scrollTopBtn) {
    scrollTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
}

/* ====================================================
   4. LOADING SCREEN
   ==================================================== */
function initLoadingScreen() {
  const screen = document.getElementById('loading-screen');
  if (!screen) return;
  window.addEventListener('load', () => {
    setTimeout(() => {
      screen.classList.add('hidden');
    }, 1200);
  });
}

const Nav = (() => {
  function getParams() {
    return new URLSearchParams(window.location.search);
  }

  function param(key) {
    return getParams().get(key) || '';
  }

  function buildUrl(base, params) {
    const q = new URLSearchParams(params).toString();
    return q ? `${base}?${q}` : base;
  }

  function cleanCategoryUrl(course, type, sem) {
    let url = `/${course}/${type}/`;
    if (sem) url += `${sem}/`;
    return url;
  }

  return { param, buildUrl, cleanCategoryUrl };
})();

// ===== ROUTE HANDLER =====
function getRoute() {
  const params = new URLSearchParams(window.location.search);

  let course = params.get("course");
  let type = params.get("type");
  let sem = params.get("sem");

  // If params not found, parse from clean URL path
  if (!course || !type) {
    const path = window.location.pathname.split("/").filter(Boolean);

    if (path.length >= 2) {
      course = course || path[0];
      type = type || path[1];
      if (path.length >= 3) {
        sem = sem || path[2].replace(/^sem-/, '');
      }
    }
  }

  return { course, type, sem };
}

// ===== CLEAN URL SHOW =====
function updateCleanURL(course, type, sem) {
  if (course && type) {
    let cleanUrl = `/${course}/${type}/`;
    if (sem) cleanUrl += `${sem}/`;
    window.history.replaceState({}, "", cleanUrl);
  }
}
/* ====================================================
   6. GITHUB PDF LOADER (NO MANIFEST NEEDED)
   ==================================================== */
const PDFLoader = (() => {
  const GITHUB_USER = 'SatyamXd-Codex';
  const GITHUB_REPO = 'RgpvNotes';
  const GITHUB_BRANCH = 'main';

  // Optional cache to reduce GitHub API calls
  const cache = new Map();

  async function load(path) {
    // path example: diploma/pyq/sem1
    const repoPath = `data/${path}`;
    const cacheKey = repoPath;

    if (cache.has(cacheKey)) {
      return cache.get(cacheKey);
    }

    const apiUrl = `https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/contents/${repoPath}?ref=${GITHUB_BRANCH}`;

    try {
      const res = await fetch(apiUrl, {
        headers: {
          'Accept': 'application/vnd.github+json'
        }
      });

      if (!res.ok) {
        throw new Error(`GitHub API failed: ${res.status}`);
      }

      const items = await res.json();

      if (!Array.isArray(items)) {
        cache.set(cacheKey, []);
        return [];
      }

      const files = items
        .filter(item => item.type === 'file' && item.name.toLowerCase().endsWith('.pdf'))
        .map(item => ({
          name: item.name,
          url: item.download_url
        }))
        .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }));

      cache.set(cacheKey, files);
      return files;
    } catch (error) {
      console.error('PDF load error:', error);
      return [];
    }
  }

  function fileUrl(path, file) {
    if (typeof file === 'object' && file.url) return file.url;
    const name = typeof file === 'string' ? file : file.name;
    return `/data/${path}/${encodeURIComponent(name)}`;
  }

  function fileName(file) {
    if (typeof file === 'string') return file;
    return file.name || file.url || 'Unknown';
  }

  return { load, fileUrl, fileName };
})();

/* ====================================================
   7. FILE NAME BEAUTIFIER
   ==================================================== */

 function beautifyFileName(rawName) {
  let name = rawName.replace(/\.pdf$/i, '');

  // Replace separators with spaces
  name = name.replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim();

  // Subject beautification
  name = name
    .replace(/\bphysics\s*1\b/i, 'Engineering Physics-I')
    .replace(/\bmath\s*1\b/i, 'Mathematics-I')
    .replace(/\bmathematics\s*1\b/i, 'Mathematics-I')
    .replace(/\bmath\b/i, 'Mathematics-I')
    .replace(/\bchemistry\b/i, 'Engineering Chemistry')
    .replace(/\benglishcommunication\b/i, 'English Communication')
    .replace(/\benglish communication\b/i, 'English Communication');

  // S / BK / F tags
  name = name
    .replace(/\b2025s\b/i, '2025 (Supplementary)')
    .replace(/\b2024s\b/i, '2024 (Supplementary)')
    .replace(/\b2025bk\b/i, '2025 (Back)')
    .replace(/\b2025f\b/i, '2025 (Final)')
    .replace(/\b2024f\b/i, '2024 (Final)')
    .replace(/\b2025\b/i, '2025 (Final)')
    .replace(/\b2026f\b/i, '2026 (Final)')
    .replace(/\b2024\b/i, '2024 (First)');

  // Clean duplicate spaces again
  name = name.replace(/\s+/g, ' ').trim();

  return name;
}

/* ====================================================
   8. PDF CARDS RENDERER
   ==================================================== */
const PDFGrid = (() => {
  function createCard(file, path, index) {
    const url = PDFLoader.fileUrl(path, file);
    const rawName = PDFLoader.fileName(file);
    const displayName = beautifyFileName(rawName);

    const card = document.createElement('article');
    card.className = 'pdf-card';
    card.style.animationDelay = `${index * 0.05}s`;
    card.dataset.name = displayName.toLowerCase();
    card.dataset.raw = rawName.toLowerCase();

    card.innerHTML = `
      <div class="pdf-card-top">
        <div class="pdf-icon"><i class="fas fa-file-pdf" aria-hidden="true"></i></div>
        <div class="pdf-info">
          <div class="pdf-name" title="${displayName}">${displayName}</div>
          <div class="pdf-meta">PDF Document</div>
        </div>
      </div>
      <div class="pdf-actions">
        <a href="${url}" download="${rawName}" class="btn btn-primary" aria-label="Download ${displayName}">
          <i class="fas fa-download" aria-hidden="true"></i> Download
        </a>
        <a href="${url}" target="_blank" rel="noopener noreferrer" class="btn btn-outline" aria-label="Open ${displayName}">
          <i class="fas fa-external-link-alt" aria-hidden="true"></i> Open
        </a>
      </div>
    `;

    card.querySelectorAll('.btn').forEach(btn => btn.addEventListener('click', addRipple));
    return card;
  }

  function renderEmpty(grid, message, hint) {
    const div = document.createElement('div');
    div.className = 'empty-state';
    div.innerHTML = `
      <i class="fas fa-folder-open" aria-hidden="true"></i>
      <p>${message}</p>
      ${hint ? `<p class="hint">${hint}</p>` : ''}
    `;
    grid.appendChild(div);
  }

  async function render(gridEl, path, countEl) {
    gridEl.innerHTML = '<div class="empty-state"><i class="fas fa-spinner fa-spin"></i><p>Loading files…</p></div>';

    const files = await PDFLoader.load(path);

    gridEl.innerHTML = '';

    if (!files.length) {
      renderEmpty(
        gridEl,
        'No PDF files found in this folder.',
        'Upload PDF files to the matching GitHub folder and they will appear automatically.'
      );
      if (countEl) countEl.textContent = '0 files';
      return files;
    }

    files.forEach((file, i) => {
      gridEl.appendChild(createCard(file, path, i));
    });

    if (countEl) countEl.textContent = `${files.length} file${files.length !== 1 ? 's' : ''}`;
    return files;
  }

  return { render, createCard };
})();

/* ====================================================
   9. SEARCH
   ==================================================== */
const Search = (() => {
  function init(inputEl, clearBtn, gridEl, countEl) {
    if (!inputEl || !gridEl) return;

    function doSearch() {
      const q = inputEl.value.trim().toLowerCase();
      const cards = Array.from(gridEl.querySelectorAll('.pdf-card'));

      if (clearBtn) clearBtn.classList.toggle('visible', q.length > 0);

      let visible = 0;
      cards.forEach(card => {
        const name = (card.dataset.name || '') + ' ' + (card.dataset.raw || '');
        const show = !q || name.includes(q);
        card.style.display = show ? '' : 'none';
        if (show) visible++;
      });

      const old = gridEl.querySelector('.empty-state');
      if (old) old.remove();

      if (visible === 0 && cards.length > 0) {
        const div = document.createElement('div');
        div.className = 'empty-state search-empty';
        div.innerHTML = `
          <i class="fas fa-search" aria-hidden="true"></i>
          <p>No files match "<strong>${q}</strong>"</p>
          <p class="hint">Try different keywords or clear the search.</p>
        `;
        gridEl.appendChild(div);
      }

      if (countEl) {
        countEl.textContent = `${visible} file${visible !== 1 ? 's' : ''}${q ? ' found' : ''}`;
      }
    }

    inputEl.addEventListener('input', doSearch);
    inputEl.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        inputEl.value = '';
        doSearch();
        inputEl.blur();
      }
    });

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        inputEl.value = '';
        doSearch();
        inputEl.focus();
      });
    }
  }

  return { init };
})();

/* ====================================================
   10. TOAST
   ==================================================== */
function showToast(message) {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3200);
}

/* ====================================================
   11. PAGE-SPECIFIC INITIALIZERS
   ==================================================== */

/** index.html **/
function initIndexPage() {
  const btechCard = document.getElementById('card-btech');
  const diplomaCard = document.getElementById('card-diploma');
  if (btechCard) {
    btechCard.addEventListener('click', () => {
      window.location.href = '/btech/';
    });
  }
  if (diplomaCard) {
    diplomaCard.addEventListener('click', () => {
      window.location.href = '/diploma/';
    });
  }
}

/** btech.html / diploma.html — category selection **/
function initCoursePage() {
  const courseParam = Nav.param('course') || detectCourseFromPage();
  document.querySelectorAll('[data-category]').forEach(el => {
    el.addEventListener('click', () => {
      const cat = el.dataset.category;
      window.location.href = Nav.cleanCategoryUrl(courseParam, cat);
    });
  });
}

function detectCourseFromPage() {
  const path = window.location.pathname;
  if (path.includes('diploma')) return 'diploma';
  return 'btech';
}

/** category.html — PDF listing **/
async function initCategoryPage() {
const { course, type, sem } = getRoute();

// Clean URL show karo
updateCleanURL(course, type, sem);

  updateCategoryUI(course, type);

  const isSyllabus = type === 'syllabus';
  const semSection = document.getElementById('sem-section');
  const pdfSection = document.getElementById('pdf-section');
  const pdfGrid    = document.getElementById('pdf-grid');
  const countEl    = document.getElementById('results-count');
  const searchIn   = document.getElementById('search-input');
  const clearBtn   = document.getElementById('search-clear');

  if (!pdfGrid) return;

  if (isSyllabus) {
    if (semSection) semSection.style.display = 'none';
    const path = `${course}/syllabus`;
    await PDFGrid.render(pdfGrid, path, countEl);
    Search.init(searchIn, clearBtn, pdfGrid, countEl);
    return;
  }

  buildSemesterTabs(course, type, sem);

  const activeSem = sem || getDefaultSem(course);
  const path = `${course}/${type}/${activeSem}`;

  if (pdfSection) pdfSection.dataset.path = path;

  await PDFGrid.render(pdfGrid, path, countEl);
  Search.init(searchIn, clearBtn, pdfGrid, countEl);
}

function getDefaultSem(course) {
  return 'sem1';
}

function buildSemesterTabs(course, type, activeSem) {
  const semGrid = document.getElementById('sem-grid');
  if (!semGrid) return;

  const count = course === 'btech' ? 8 : 6;
  semGrid.innerHTML = '';

  for (let i = 1; i <= count; i++) {
    const semKey = `sem${i}`;
    const isActive = (activeSem || 'sem1') === semKey;
    const card = document.createElement('div');
    card.className = `sem-card${isActive ? ' active' : ''}`;
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', `Semester ${i}`);
    card.dataset.sem = semKey;
    card.innerHTML = `<i class="fas fa-book" aria-hidden="true"></i><span>Semester ${i}</span>`;
    card.addEventListener('click', () => switchSemester(course, type, semKey));
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') switchSemester(course, type, semKey);
    });
    semGrid.appendChild(card);
  }
}

async function switchSemester(course, type, sem) {
  const newUrl = `/${course}/${type}/${sem}/`;
  window.history.replaceState({}, '', newUrl);

  document.querySelectorAll('.sem-card').forEach(c => {
    c.classList.toggle('active', c.dataset.sem === sem);
  });

  const pdfGrid = document.getElementById('pdf-grid');
  const countEl = document.getElementById('results-count');
  const searchIn = document.getElementById('search-input');
  const clearBtn = document.getElementById('search-clear');

  if (!pdfGrid) return;

  if (searchIn) searchIn.value = '';

  const path = `${course}/${type}/${sem}`;
  await PDFGrid.render(pdfGrid, path, countEl);
  Search.init(searchIn, clearBtn, pdfGrid, countEl);
}

function updateCategoryUI(course, type) {
  const typeNames = { notes: 'Notes', pyq: 'Previous Year Papers', syllabus: 'Syllabus' };
  const courseNames = { btech: 'B.Tech', diploma: 'Diploma' };
  const typeIcons  = { notes: 'fa-book-open', pyq: 'fa-file-alt', syllabus: 'fa-list-alt' };

  const titleEl   = document.getElementById('page-title');
  const subtitleEl = document.getElementById('page-subtitle');
  const breadCourse = document.getElementById('bread-course');
  const breadType  = document.getElementById('bread-type');
  const pageIcon   = document.getElementById('page-icon');
  const badgeEl    = document.getElementById('course-badge');

  const typeName   = typeNames[type]   || type;
  const courseName = courseNames[course] || course;

  if (titleEl)    titleEl.textContent = `${courseName} ${typeName}`;
  if (subtitleEl) subtitleEl.textContent = `Download ${typeName.toLowerCase()} for RGPV ${courseName}`;
  if (breadCourse) breadCourse.textContent = courseName;
  if (breadType)   breadType.textContent = typeName;
  if (pageIcon) {
    pageIcon.querySelector('i').className = `fas ${typeIcons[type] || 'fa-folder'}`;
  }
  if (badgeEl) {
    badgeEl.textContent = courseName;
    badgeEl.className = `badge ${course === 'btech' ? 'badge-blue' : 'badge-orange'}`;
  }

  const backLink = document.getElementById('back-link');
  if (backLink) {
    backLink.href = course === 'btech' ? '/btech/' : '/diploma/';
  }
}

/* ====================================================
   12. BACK BUTTON
   ==================================================== */
function initBackButton() {
  document.querySelectorAll('.btn-back, #back-btn').forEach(btn => {
    btn.classList.add('visible');
    btn.addEventListener('click', () => {
      if (document.referrer && document.referrer.includes(window.location.hostname)) {
        window.history.back();
      } else {
        window.location.href = '/';
      }
    });
  });
}

/* ====================================================
   13. ANIMATE ON SCROLL
   ==================================================== */
function initScrollAnimations() {
  if (!('IntersectionObserver' in window)) return;
  const items = document.querySelectorAll('.feature-card, .primary-card, .category-card');
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('page-transition');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  items.forEach(el => obs.observe(el));
}

/* ====================================================
   14. MOBILE NAV TOGGLE
   ==================================================== */
function initMobileNav() {
  const toggle = document.getElementById('nav-toggle');
  const menu   = document.getElementById('nav-menu');
  if (!toggle || !menu) return;
  toggle.addEventListener('click', () => {
    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!expanded));
    menu.classList.toggle('open', !expanded);
  });
  menu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      toggle.setAttribute('aria-expanded', 'false');
      menu.classList.remove('open');
    });
  });
}

/* ====================================================
   15. MAIN ENTRY
   ==================================================== */
document.addEventListener('DOMContentLoaded', () => {
  ThemeManager.init();
  initLoadingScreen();
  initHeader();
  initRipple();
  initBackButton();
  initScrollAnimations();
  initMobileNav();

  const page = document.body.dataset.page;
  if (page === 'index')    initIndexPage();
  if (page === 'course')   initCoursePage();
  if (page === 'category') initCategoryPage();

  const main = document.querySelector('main');
  if (main) main.classList.add('page-transition');
});
