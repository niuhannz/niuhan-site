/* ============================================
   niuhan.net — Application Logic
   Routing, i18n, theme, works grid, video player
   ============================================ */

(function () {
  'use strict';

  // ---------- Works Data ----------
  const WORKS = [
    {
      id: 'commandment',
      titleZh: '诫命',
      titleEn: 'Commandment',
      year: 2026,
      type: 'feature',
      format: { en: 'Feature Film', zh: '长片' },
      duration: { en: 'TBD', zh: '待定' },
      descEn: 'A meditation on language, faith, and moral ambiguity. The latest work by Niu Han explores the tension between commandments spoken and those left unspoken — the weight of words that bind, and the silence that sets free.',
      descZh: '一部关于语言、信仰与道德模糊性的沉思。牛涵的最新作品探索了被言说的诫命与未被言说的诫命之间的张力——束缚的话语之重，与解放的沉默之轻。',
      credits: { en: 'Written & Directed by Niu Han', zh: '编剧/导演：牛涵' }
    },
    {
      id: 'legitimate-fruit',
      titleZh: '合法正果',
      titleEn: 'Certified Groupies',
      year: 2024,
      type: 'short',
      format: { en: 'Short Film', zh: '短片' },
      duration: { en: 'TBD', zh: '待定' },
      descEn: 'Description placeholder — a short film by Niu Han.',
      descZh: '简介占位 — 牛涵短片作品。',
      credits: { en: 'Written & Directed by Niu Han', zh: '编剧/导演：牛涵' }
    },
    {
      id: 'words',
      titleZh: '话语',
      titleEn: 'Word',
      year: 2023,
      type: 'feature',
      format: { en: 'Feature Film', zh: '长片' },
      duration: { en: 'TBD', zh: '待定' },
      thumbnail: 'images/words-thumb.jpg',
      heroImage: 'images/words-hero.jpg',
      descEn: 'Description placeholder for Word.',
      descZh: '《话语》简介占位。',
      credits: { en: 'Written & Directed by Niu Han', zh: '编剧/导演：牛涵' }
    },
    {
      id: 'murmur',
      titleZh: '呢喃',
      titleEn: 'Chinese Whispers',
      year: 2019,
      type: 'feature',
      format: { en: 'Feature Film', zh: '长片' },
      duration: { en: 'TBD', zh: '待定' },
      descEn: 'Description placeholder for Chinese Whispers.',
      descZh: '《呢喃》简介占位。',
      credits: { en: 'Written & Directed by Niu Han', zh: '编剧/导演：牛涵' }
    },
    {
      id: 'sweet-life',
      titleZh: '甜美生活',
      titleEn: 'A Sweet Life',
      year: 2017,
      type: 'feature',
      format: { en: 'Feature Film', zh: '长片' },
      duration: { en: 'TBD', zh: '待定' },
      descEn: 'Description placeholder for A Sweet Life.',
      descZh: '《甜美生活》简介占位。',
      credits: { en: 'Written & Directed by Niu Han', zh: '编剧/导演：牛涵' }
    },
    {
      id: 'uncertain-regards',
      titleZh: '不确定的问候',
      titleEn: 'Uncertain Regards',
      year: 2017,
      type: 'short',
      format: { en: 'Short Film', zh: '短片' },
      duration: { en: 'TBD', zh: '待定' },
      descEn: 'Description placeholder for Uncertain Regards.',
      descZh: '《不确定的问候》简介占位。',
      credits: { en: 'Written & Directed by Niu Han', zh: '编剧/导演：牛涵' }
    },
    {
      id: 'cilantro',
      titleZh: '空中弥漫温热的香菜气息',
      titleEn: 'Warm Smell of Coriander',
      year: 2016,
      type: 'feature',
      format: { en: 'Feature Film', zh: '长片' },
      duration: { en: 'TBD', zh: '待定' },
      thumbnail: 'images/cilantro-thumb.jpg',
      heroImage: 'images/cilantro-hero.jpg',
      descEn: 'Description placeholder for Warm Smell of Coriander.',
      descZh: '《空中弥漫温热的香菜气息》简介占位。',
      credits: { en: 'Written & Directed by Niu Han', zh: '编剧/导演：牛涵' }
    },
    {
      id: 'between-yes-and-no',
      titleZh: '是与不是之间',
      titleEn: 'Between Yes and No',
      year: 2015,
      type: 'short',
      format: { en: 'Short Film', zh: '短片' },
      duration: { en: 'TBD', zh: '待定' },
      descEn: 'Description placeholder for Between Yes and No.',
      descZh: '《是与不是之间》简介占位。',
      credits: { en: 'Written & Directed by Niu Han', zh: '编剧/导演：牛涵' }
    },
    {
      id: 'barren-land',
      titleZh: '不毛之国',
      titleEn: 'Land of Nobody',
      year: 2013,
      type: 'feature',
      format: { en: 'Feature Film', zh: '长片' },
      duration: { en: 'TBD', zh: '待定' },
      descEn: 'Description placeholder for Land of Nobody.',
      descZh: '《不毛之国》简介占位。',
      credits: { en: 'Written & Directed by Niu Han', zh: '编剧/导演：牛涵' }
    },
    {
      id: 'melancholia-i',
      titleZh: '忧郁 I',
      titleEn: 'Melancholia I',
      year: 2013,
      type: 'short',
      format: { en: 'Short Film', zh: '短片' },
      duration: { en: 'TBD', zh: '待定' },
      descEn: 'Description placeholder for Melancholia I.',
      descZh: '《忧郁 I》简介占位。',
      credits: { en: 'Written & Directed by Niu Han', zh: '编剧/导演：牛涵' }
    },
    {
      id: 'autumn-of-freedom',
      titleZh: '自由之丘',
      titleEn: 'Freedom Hills',
      year: 2009,
      type: 'feature',
      format: { en: 'Feature Film', zh: '长片' },
      duration: { en: 'TBD', zh: '待定' },
      descEn: 'Description placeholder for Freedom Hills.',
      descZh: '《自由之丘》简介占位。',
      credits: { en: 'Written & Directed by Niu Han', zh: '编剧/导演：牛涵' }
    }
  ];

  // ---------- Writing Data ----------
  const WRITINGS = [
    {
      id: 'baseborn',
      titleZh: '贱生',
      titleEn: 'Baseborn',
      year: 2024,
      type: 'novel',
      format: { en: 'Novel', zh: '小说' },
      descEn: 'A novel by Niu Han.',
      descZh: '牛涵长篇小说。',
      publisher: { en: '', zh: '' }
    },
    {
      id: 'force-and-source',
      titleZh: '',
      titleEn: 'The Force and the Source',
      year: 2023,
      type: 'nonfiction',
      format: { en: 'Non-Fiction', zh: '非虚构' },
      descEn: 'A non-fiction work by Niu Han.',
      descZh: '牛涵非虚构作品。',
      publisher: { en: '', zh: '' }
    },
    {
      id: 'cinema-impromptu',
      titleZh: '即兴电影',
      titleEn: 'Cinema Impromptu',
      year: 2026,
      type: 'nonfiction',
      format: { en: 'Non-Fiction', zh: '非虚构' },
      descEn: 'A non-fiction work by Niu Han.',
      descZh: '牛涵非虚构作品。',
      publisher: { en: '', zh: '' }
    }
  ];

  // ---------- State ----------
  let currentPage = 'home';
  let currentLang = 'en';
  let currentTheme = 'light';
  let currentSubFilter = 'all';
  let currentWritingFilter = 'all';
  let mobileMenuOpen = false;

  // ---------- DOM References ----------
  const root = document.documentElement;
  const navLinks = document.querySelectorAll('[data-nav]');
  const langToggle = document.getElementById('langToggle');
  const themeToggle = document.getElementById('themeToggle');
  const themeIcon = document.getElementById('themeIcon');
  const mobileToggle = document.getElementById('mobileToggle');
  const navLinksContainer = document.getElementById('navLinks');
  const worksGrid = document.getElementById('worksGrid');
  const subFilters = document.querySelectorAll('.sub-filter');
  const filmSubFilters = document.getElementById('filmSubFilters');
  const writingGrid = document.getElementById('writingGrid');
  const writingFilters = document.querySelectorAll('.writing-filter');
  const workDetail = document.getElementById('workDetail');
  const workDetailClose = document.getElementById('workDetailClose');
  const workDetailInner = document.getElementById('workDetailInner');

  // ---------- Safe DOM Helpers ----------
  // NOTE: All data rendered into the DOM comes from the hardcoded WORKS
  // array above — never from user input or external sources. This is a
  // static portfolio site with no dynamic data ingestion.

  function createEl(tag, attrs, children) {
    const el = document.createElement(tag);
    if (attrs) {
      Object.entries(attrs).forEach(function(pair) {
        var k = pair[0], v = pair[1];
        if (k === 'className') el.className = v;
        else if (k === 'textContent') el.textContent = v;
        else if (k.startsWith('data-')) el.setAttribute(k, v);
        else el.setAttribute(k, v);
      });
    }
    if (children) {
      children.forEach(function(child) {
        if (typeof child === 'string') {
          el.appendChild(document.createTextNode(child));
        } else if (child) {
          el.appendChild(child);
        }
      });
    }
    return el;
  }

  function langSpan(enText, zhText) {
    var frag = document.createDocumentFragment();
    var en = document.createElement('span');
    en.className = 'lang-en';
    en.textContent = enText;
    var zh = document.createElement('span');
    zh.className = 'lang-zh';
    zh.textContent = zhText;
    frag.appendChild(en);
    frag.appendChild(zh);
    return frag;
  }

  // ---------- Initialize ----------
  function init() {
    var savedTheme = localStorage.getItem('nh-theme');
    var savedLang = localStorage.getItem('nh-lang');
    if (savedTheme) setTheme(savedTheme);
    if (savedLang) setLang(savedLang);

    var hash = window.location.hash.slice(1);
    if (hash && document.getElementById('page-' + hash)) {
      navigateTo(hash, false);
    }

    renderWorks();
    renderWritings();
    bindEvents();

    // Set home hero featured image from first work with a heroImage
    var heroEl = document.getElementById('heroImage');
    if (heroEl) {
      var featured = WORKS.find(function(w) { return w.heroImage; });
      if (featured) {
        var heroImg = document.createElement('img');
        heroImg.src = featured.heroImage;
        heroImg.alt = featured.titleEn;
        heroImg.style.width = '100%';
        heroImg.style.height = '100%';
        heroImg.style.objectFit = 'cover';
        heroEl.appendChild(heroImg);
      }
    }
  }

  // ---------- Navigation ----------
  function navigateTo(page, pushState) {
    if (typeof pushState === 'undefined') pushState = true;
    if (page === currentPage) return;

    if (mobileMenuOpen) toggleMobileMenu();

    // Hide ALL pages first
    document.querySelectorAll('.page').forEach(function(p) {
      p.classList.remove('active', 'visible');
    });

    // Show target page
    var el = document.getElementById('page-' + page);
    if (el) {
      el.classList.add('active');
      el.classList.add('visible');
      el.querySelectorAll('.fade-in').forEach(function(item) {
        item.style.animation = 'none';
        void item.offsetHeight;
        item.style.animation = '';
      });
    }

    // Update nav active state
    document.querySelectorAll('.nav-link').forEach(function(l) { l.classList.remove('active'); });
    document.querySelectorAll('.nav-link[data-nav="' + page + '"]').forEach(function(l) { l.classList.add('active'); });

    currentPage = page;
    if (pushState) window.location.hash = page === 'home' ? '' : page;
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  // ---------- Theme ----------
  function setTheme(theme) {
    currentTheme = theme;
    root.setAttribute('data-theme', theme);
    themeIcon.textContent = theme === 'dark' ? '◑' : '◐';
    localStorage.setItem('nh-theme', theme);
  }

  function toggleTheme() {
    setTheme(currentTheme === 'light' ? 'dark' : 'light');
  }

  // ---------- Language ----------
  function setLang(lang) {
    currentLang = lang;
    root.setAttribute('data-lang', lang);
    localStorage.setItem('nh-lang', lang);
  }

  function toggleLang() {
    setLang(currentLang === 'en' ? 'zh' : 'en');
  }

  // ---------- Mobile Menu ----------
  function toggleMobileMenu() {
    mobileMenuOpen = !mobileMenuOpen;
    navLinksContainer.classList.toggle('mobile-open', mobileMenuOpen);
    var spans = mobileToggle.querySelectorAll('span');
    if (mobileMenuOpen) {
      spans[0].style.transform = 'rotate(45deg) translate(4px, 4px)';
      spans[1].style.opacity = '0';
      spans[2].style.transform = 'rotate(-45deg) translate(4px, -4px)';
    } else {
      spans[0].style.transform = '';
      spans[1].style.opacity = '';
      spans[2].style.transform = '';
    }
  }

  // ---------- Films Grid ----------
  function renderWorks() {

    var filtered = WORKS;
    if (currentSubFilter === 'feature') filtered = WORKS.filter(function(w) { return w.type === 'feature'; });
    if (currentSubFilter === 'short') filtered = WORKS.filter(function(w) { return w.type === 'short'; });

    // Clear grid
    while (worksGrid.firstChild) worksGrid.removeChild(worksGrid.firstChild);

    filtered.forEach(function(work, i) {
      var card = createEl('div', {
        className: 'work-card fade-in stagger-' + Math.min(i + 1, 9),
        'data-work-id': work.id
      });

      var cardImage = createEl('div', { className: 'work-card-image' });
      if (work.thumbnail) {
        var img = document.createElement('img');
        img.src = work.thumbnail;
        img.alt = work.titleEn;
        img.loading = 'lazy';
        cardImage.appendChild(img);
      }
      card.appendChild(cardImage);

      var meta = createEl('div', { className: 'work-card-meta' });
      meta.appendChild(createEl('span', { className: 'work-card-year', textContent: String(work.year) }));
      var tag = createEl('span', { className: 'work-card-tag' });
      tag.appendChild(langSpan(
        work.type === 'feature' ? 'Feature' : 'Short',
        work.type === 'feature' ? '长片' : '短片'
      ));
      meta.appendChild(tag);
      card.appendChild(meta);

      var cardTitle = createEl('div', { className: 'work-card-title' });
      cardTitle.appendChild(langSpan(work.titleEn, work.titleZh));
      card.appendChild(cardTitle);

      card.addEventListener('click', function() { openWorkDetail(work.id); });
      worksGrid.appendChild(card);
    });
  }

  // ---------- Work Detail (Mubi-inspired cinematic layout) ----------
  function openWorkDetail(id) {
    var work = WORKS.find(function(w) { return w.id === id; });
    if (!work) return;

    // Clear previous content
    while (workDetailInner.firstChild) workDetailInner.removeChild(workDetailInner.firstChild);

    // ── Full-bleed hero section (viewport-height still image + overlay text) ──
    var hero = createEl('div', { className: 'wd-hero' });

    // The still image area — use heroImage if available, otherwise gradient placeholder
    var heroImage = createEl('div', { className: 'wd-hero-image' });
    if (work.heroImage) {
      heroImage.style.backgroundImage = 'url(' + work.heroImage + ')';
      heroImage.style.backgroundSize = 'cover';
      heroImage.style.backgroundPosition = 'center';
    }
    hero.appendChild(heroImage);

    // Gradient scrim for text readability
    hero.appendChild(createEl('div', { className: 'wd-hero-scrim' }));

    // Text overlay positioned at bottom-left of the hero
    var heroText = createEl('div', { className: 'wd-hero-text' });

    // Title block — single heading that swaps via lang toggle
    var heroTitle = createEl('h1', { className: 'wd-hero-title' });
    heroTitle.appendChild(langSpan(work.titleEn.toUpperCase(), work.titleZh));
    heroText.appendChild(heroTitle);

    // Metadata pills (year · format · duration)
    var pills = createEl('div', { className: 'wd-hero-meta' });
    pills.appendChild(createEl('span', { className: 'wd-pill', textContent: String(work.year) }));
    var formatPill = createEl('span', { className: 'wd-pill' });
    formatPill.appendChild(langSpan(work.format.en, work.format.zh));
    pills.appendChild(formatPill);
    if (work.duration.en !== 'TBD') {
      var durPill = createEl('span', { className: 'wd-pill' });
      durPill.appendChild(langSpan(work.duration.en, work.duration.zh));
      pills.appendChild(durPill);
    }
    heroText.appendChild(pills);

    // Brief credits line
    var creditLine = createEl('div', { className: 'wd-hero-credits' });
    creditLine.appendChild(langSpan(work.credits.en, work.credits.zh));
    heroText.appendChild(creditLine);

    hero.appendChild(heroText);

    // Scroll indicator chevron
    var chevron = createEl('div', { className: 'wd-scroll-hint' });
    var chevSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    chevSvg.setAttribute('viewBox', '0 0 24 24');
    chevSvg.setAttribute('width', '28');
    chevSvg.setAttribute('height', '28');
    var chevPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    chevPath.setAttribute('d', 'M7 10l5 5 5-5');
    chevPath.setAttribute('stroke', 'rgba(255,255,255,0.5)');
    chevPath.setAttribute('stroke-width', '1.5');
    chevPath.setAttribute('fill', 'none');
    chevPath.setAttribute('stroke-linecap', 'round');
    chevSvg.appendChild(chevPath);
    chevron.appendChild(chevSvg);
    hero.appendChild(chevron);

    workDetailInner.appendChild(hero);

    // ── Below-the-fold content ──
    var body = createEl('div', { className: 'wd-body' });

    // Synopsis section
    var synopsisSection = createEl('div', { className: 'wd-section' });
    var synLabel = createEl('div', { className: 'wd-section-label' });
    synLabel.appendChild(langSpan('Synopsis', '简介'));
    synopsisSection.appendChild(synLabel);
    var synText = createEl('div', { className: 'wd-synopsis' });
    synText.appendChild(langSpan(work.descEn, work.descZh));
    synopsisSection.appendChild(synText);
    body.appendChild(synopsisSection);

    // Details grid (Year, Format, Duration, Credits)
    var detailsSection = createEl('div', { className: 'wd-section' });
    var detLabel = createEl('div', { className: 'wd-section-label' });
    detLabel.appendChild(langSpan('Details', '详情'));
    detailsSection.appendChild(detLabel);

    var detGrid = createEl('div', { className: 'wd-details-grid' });
    var fields = [
      { labelEn: 'Year', labelZh: '年份', valueEn: String(work.year), valueZh: String(work.year) },
      { labelEn: 'Format', labelZh: '类型', valueEn: work.format.en, valueZh: work.format.zh },
      { labelEn: 'Duration', labelZh: '时长', valueEn: work.duration.en, valueZh: work.duration.zh },
      { labelEn: 'Credits', labelZh: '主创', valueEn: work.credits.en, valueZh: work.credits.zh }
    ];
    fields.forEach(function(f) {
      var item = createEl('div', { className: 'wd-detail-item' });
      var dt = createEl('div', { className: 'wd-detail-label' });
      dt.appendChild(langSpan(f.labelEn, f.labelZh));
      var dd = createEl('div', { className: 'wd-detail-value' });
      dd.appendChild(langSpan(f.valueEn, f.valueZh));
      item.appendChild(dt);
      item.appendChild(dd);
      detGrid.appendChild(item);
    });
    detailsSection.appendChild(detGrid);
    body.appendChild(detailsSection);

    // Video / Trailer section
    var videoSection = createEl('div', { className: 'wd-section' });
    var vidLabel = createEl('div', { className: 'wd-section-label' });
    vidLabel.appendChild(langSpan('Trailer', '预告片'));
    videoSection.appendChild(vidLabel);

    var videoId = 'video-' + work.id;
    var container = createEl('div', { className: 'video-container', id: 'videoContainer-' + work.id });

    var video = document.createElement('video');
    video.id = videoId;
    video.preload = 'metadata';
    video.setAttribute('controlsList', 'nodownload');
    video.setAttribute('playsinline', '');
    video.addEventListener('contextmenu', function(e) { e.preventDefault(); });
    container.appendChild(video);

    // Play overlay
    var overlay = createEl('div', { className: 'video-play-overlay', id: 'playOverlay-' + work.id });
    var overlaySvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    overlaySvg.setAttribute('viewBox', '0 0 24 24');
    var overlayPoly = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    overlayPoly.setAttribute('points', '5,3 19,12 5,21');
    overlaySvg.appendChild(overlayPoly);
    overlay.appendChild(overlaySvg);
    container.appendChild(overlay);

    // Controls
    var controls = createEl('div', { className: 'video-controls' });
    var progressWrapper = createEl('div', { className: 'video-progress-wrapper', id: 'progressWrapper-' + work.id });
    var progressBuffer = createEl('div', { className: 'video-progress-buffer', id: 'progressBuffer-' + work.id });
    var progressBar = createEl('div', { className: 'video-progress-bar', id: 'progressBar-' + work.id });
    progressWrapper.appendChild(progressBuffer);
    progressWrapper.appendChild(progressBar);
    controls.appendChild(progressWrapper);

    var bottom = createEl('div', { className: 'video-bottom-controls' });
    var left = createEl('div', { className: 'video-left-controls' });

    var playBtn = createEl('button', { className: 'video-btn', id: 'playBtn-' + work.id, 'aria-label': 'Play/Pause' });
    var playSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    playSvg.setAttribute('viewBox', '0 0 24 24');
    playSvg.id = 'playIcon-' + work.id;
    var playPoly = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    playPoly.setAttribute('points', '5,3 19,12 5,21');
    playSvg.appendChild(playPoly);
    playBtn.appendChild(playSvg);
    left.appendChild(playBtn);

    var volWrap = createEl('div', { className: 'video-volume-wrapper' });
    var muteBtn = createEl('button', { className: 'video-btn', id: 'muteBtn-' + work.id, 'aria-label': 'Mute' });
    var muteSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    muteSvg.setAttribute('viewBox', '0 0 24 24');
    var mutePath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    mutePath.setAttribute('d', 'M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z');
    muteSvg.appendChild(mutePath);
    muteBtn.appendChild(muteSvg);
    volWrap.appendChild(muteBtn);

    var volSlider = document.createElement('input');
    volSlider.type = 'range';
    volSlider.className = 'video-volume-slider';
    volSlider.id = 'volumeSlider-' + work.id;
    volSlider.min = '0';
    volSlider.max = '1';
    volSlider.step = '0.05';
    volSlider.value = '1';
    volWrap.appendChild(volSlider);
    left.appendChild(volWrap);

    var timeDisplay = createEl('span', { className: 'video-time', id: 'videoTime-' + work.id, textContent: '0:00 / 0:00' });
    left.appendChild(timeDisplay);
    bottom.appendChild(left);

    var right = createEl('div', { className: 'video-right-controls' });
    var fsBtn = createEl('button', { className: 'video-btn', id: 'fullscreenBtn-' + work.id, 'aria-label': 'Fullscreen' });
    var fsSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    fsSvg.setAttribute('viewBox', '0 0 24 24');
    var fsPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    fsPath.setAttribute('d', 'M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z');
    fsSvg.appendChild(fsPath);
    fsBtn.appendChild(fsSvg);
    right.appendChild(fsBtn);
    bottom.appendChild(right);

    controls.appendChild(bottom);
    container.appendChild(controls);
    videoSection.appendChild(container);
    body.appendChild(videoSection);

    workDetailInner.appendChild(body);

    // Open overlay
    workDetail.classList.add('open');
    document.body.style.overflow = 'hidden';

    // Initialize player
    requestAnimationFrame(function() { initVideoPlayer(work.id); });
  }

  function closeWorkDetail() {
    workDetail.classList.remove('open');
    document.body.style.overflow = '';
    var videos = workDetailInner.querySelectorAll('video');
    videos.forEach(function(v) { v.pause(); });
  }

  // ---------- Writing Grid ----------
  function renderWritings() {
    var filtered = WRITINGS;
    if (currentWritingFilter === 'novel') filtered = WRITINGS.filter(function(w) { return w.type === 'novel'; });
    if (currentWritingFilter === 'nonfiction') filtered = WRITINGS.filter(function(w) { return w.type === 'nonfiction'; });
    if (currentWritingFilter === 'translation') filtered = WRITINGS.filter(function(w) { return w.type === 'translation'; });

    while (writingGrid.firstChild) writingGrid.removeChild(writingGrid.firstChild);

    filtered.forEach(function(item, i) {
      var card = createEl('div', {
        className: 'work-card fade-in stagger-' + Math.min(i + 1, 9)
      });

      card.appendChild(createEl('div', { className: 'work-card-image' }));

      var meta = createEl('div', { className: 'work-card-meta' });
      meta.appendChild(createEl('span', { className: 'work-card-year', textContent: String(item.year) }));
      var tag = createEl('span', { className: 'work-card-tag' });
      tag.appendChild(langSpan(item.format.en, item.format.zh));
      meta.appendChild(tag);
      card.appendChild(meta);

      var cardTitle = createEl('div', { className: 'work-card-title' });
      cardTitle.appendChild(langSpan(item.titleEn, item.titleZh));
      card.appendChild(cardTitle);

      writingGrid.appendChild(card);
    });
  }

  // ---------- Custom Video Player ----------
  function initVideoPlayer(id) {
    var container = document.getElementById('videoContainer-' + id);
    var video = document.getElementById('video-' + id);
    var playBtn = document.getElementById('playBtn-' + id);
    var playIcon = document.getElementById('playIcon-' + id);
    var progressWrapper = document.getElementById('progressWrapper-' + id);
    var progressBar = document.getElementById('progressBar-' + id);
    var progressBuffer = document.getElementById('progressBuffer-' + id);
    var videoTime = document.getElementById('videoTime-' + id);
    var muteBtn = document.getElementById('muteBtn-' + id);
    var volumeSlider = document.getElementById('volumeSlider-' + id);
    var fullscreenBtn = document.getElementById('fullscreenBtn-' + id);

    if (!video || !container) return;

    function formatTime(s) {
      if (isNaN(s)) return '0:00';
      var m = Math.floor(s / 60);
      var sec = Math.floor(s % 60);
      return m + ':' + (sec < 10 ? '0' : '') + sec;
    }

    function updatePlayIcon(playing) {
      // Clear SVG children
      while (playIcon.firstChild) playIcon.removeChild(playIcon.firstChild);
      if (playing) {
        var r1 = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        r1.setAttribute('x', '6'); r1.setAttribute('y', '4');
        r1.setAttribute('width', '4'); r1.setAttribute('height', '16');
        var r2 = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        r2.setAttribute('x', '14'); r2.setAttribute('y', '4');
        r2.setAttribute('width', '4'); r2.setAttribute('height', '16');
        playIcon.appendChild(r1);
        playIcon.appendChild(r2);
        container.classList.add('playing');
      } else {
        var poly = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        poly.setAttribute('points', '5,3 19,12 5,21');
        playIcon.appendChild(poly);
        container.classList.remove('playing');
      }
    }

    function togglePlay() {
      if (video.paused) video.play();
      else video.pause();
    }

    video.addEventListener('play', function() { updatePlayIcon(true); });
    video.addEventListener('pause', function() { updatePlayIcon(false); });
    video.addEventListener('ended', function() { updatePlayIcon(false); });

    video.addEventListener('timeupdate', function() {
      if (video.duration) {
        var pct = (video.currentTime / video.duration) * 100;
        progressBar.style.width = pct + '%';
        videoTime.textContent = formatTime(video.currentTime) + ' / ' + formatTime(video.duration);
      }
    });

    video.addEventListener('progress', function() {
      if (video.buffered.length > 0 && video.duration) {
        var buffered = video.buffered.end(video.buffered.length - 1);
        progressBuffer.style.width = (buffered / video.duration) * 100 + '%';
      }
    });

    container.addEventListener('click', function(e) {
      if (e.target.closest('.video-controls')) return;
      togglePlay();
    });

    playBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      togglePlay();
    });

    progressWrapper.addEventListener('click', function(e) {
      e.stopPropagation();
      var rect = progressWrapper.getBoundingClientRect();
      var pos = (e.clientX - rect.left) / rect.width;
      if (video.duration) video.currentTime = pos * video.duration;
    });

    volumeSlider.addEventListener('input', function(e) {
      e.stopPropagation();
      video.volume = parseFloat(volumeSlider.value);
      video.muted = false;
    });

    muteBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      video.muted = !video.muted;
      volumeSlider.value = video.muted ? 0 : video.volume;
    });

    fullscreenBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        container.requestFullscreen().catch(function() {});
      }
    });
  }

  // ---------- Event Bindings ----------
  function bindEvents() {
    navLinks.forEach(function(link) {
      link.addEventListener('click', function() { navigateTo(link.dataset.nav); });
    });

    themeToggle.addEventListener('click', toggleTheme);
    langToggle.addEventListener('click', toggleLang);
    mobileToggle.addEventListener('click', toggleMobileMenu);

    subFilters.forEach(function(btn) {
      btn.addEventListener('click', function() {
        subFilters.forEach(function(s) { s.classList.remove('active'); });
        btn.classList.add('active');
        currentSubFilter = btn.dataset.sub;
        renderWorks();
      });
    });

    writingFilters.forEach(function(btn) {
      btn.addEventListener('click', function() {
        writingFilters.forEach(function(b) { b.classList.remove('active'); });
        btn.classList.add('active');
        currentWritingFilter = btn.dataset.wsub;
        renderWritings();
      });
    });

    workDetailClose.addEventListener('click', closeWorkDetail);
    workDetail.addEventListener('click', function(e) {
      if (e.target === workDetail) closeWorkDetail();
    });

    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && workDetail.classList.contains('open')) {
        closeWorkDetail();
      }
    });

    window.addEventListener('hashchange', function() {
      var hash = window.location.hash.slice(1) || 'home';
      if (hash !== currentPage) navigateTo(hash, false);
    });
  }

  // ---------- Go ----------
  init();
})();
