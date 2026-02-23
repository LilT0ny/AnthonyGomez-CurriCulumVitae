// ===== CONFIGURATION & GLOBALS =====
const langToggleBtn = document.getElementById('langToggle');
const themeToggleBtn = document.getElementById('themeToggle');
const htmlEl = document.documentElement;
let translations = {};

// ===== I18N LOGIC =====

async function loadLanguage(lang) {
  try {
    const response = await fetch(`locales/${lang}.json`);
    if (!response.ok) throw new Error(`Could not load ${lang}.json`);
    translations = await response.json();
    applyTranslations(lang);
  } catch (error) {
    console.error('Translation Error:', error);
    if (lang !== 'en') loadLanguage('en');
  }
}

function applyTranslations(lang) {
  htmlEl.setAttribute('lang', lang);
  localStorage.setItem('lang', lang);

  document.querySelectorAll('[data-lang-key]').forEach(el => {
    const key = el.getAttribute('data-lang-key');
    const translation = translations[key];

    if (translation) {
      const type = el.getAttribute('data-lang-type');
      if (type === 'innerHTML') {
        el.innerHTML = translation;
      } else if (el.hasAttribute('aria-label')) {
        el.setAttribute('aria-label', translation);
      } else if (el.tagName === 'META') {
        el.setAttribute('content', translation);
      } else {
        el.textContent = translation;
      }
    }
  });

  // Specific buttons & UI elements
  if (langToggleBtn) {
    langToggleBtn.textContent = translations.langToggleText || (lang === 'es' ? 'EN' : 'ES');
  }

  // PDF Download Sync
  const downloadPdfBtn = document.getElementById('downloadPdfBtn');
  const printBtn = document.getElementById('printBtn');
  if (downloadPdfBtn) {
    downloadPdfBtn.href = translations.pdfPath;
    downloadPdfBtn.download = translations.pdfDownloadName;
  }
  if (printBtn) {
    printBtn.href = translations.pdfPath;
  }

  // Refresh icons
  if (typeof feather !== 'undefined') feather.replace();
}

function toggleLanguage() {
  const currentLang = htmlEl.getAttribute('lang') || 'es';
  const newLang = currentLang === 'es' ? 'en' : 'es';
  loadLanguage(newLang);
}

// ===== THEME LOGIC =====

function applyTheme(theme) {
  const isDark = theme === 'dark';
  htmlEl.classList.toggle('dark', isDark);
  themeToggleBtn?.classList.toggle('theme-dark', isDark);
  htmlEl.style.colorScheme = isDark ? 'dark' : 'light';
  localStorage.setItem('theme', theme);
}

function toggleTheme() {
  const currentTheme = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  applyTheme(newTheme);
}

// ===== INITIALIZATION =====

document.addEventListener('DOMContentLoaded', () => {
  // Theme init
  const savedTheme = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  applyTheme(savedTheme);

  // Lang init
  const savedLang = localStorage.getItem('lang') || (navigator.language.startsWith('en') ? 'en' : 'es');
  loadLanguage(savedLang);

  // Listeners
  themeToggleBtn?.addEventListener('click', toggleTheme);
  langToggleBtn?.addEventListener('click', toggleLanguage);

  // Scroll Reveal
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
  } else {
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
  }

  // Smooth Anchors
  document.querySelectorAll('a[href^="#"]:not([href="#"])').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    });
  });
});