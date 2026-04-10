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
      thumbnail: 'images/commandment-thumb.jpg',
      heroImage: 'images/commandment-hero.jpg',
      descEn: 'Submitted to Cannes. The subtitles weren\'t finished, but the deadline was the deadline. Sometimes you just have to send it. I was sitting in a Nashville gas station when I realized: every film I\'ve ever made has been about the same thing — the gap between what a person wants and what life actually gives them. Seven films. All the same question.',
      descZh: '送去了戛纳。字幕还没做完，但截止日期到了，就这样送出去了。有时候就是得先送出去。我在Nashville的一个加油站里坐着，想清楚了一件事：我一直在拍的东西，其实是同一个问题——人和自己执念之间的那道裂缝。七部片子，都是这个。',
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
      thumbnail: 'images/legitimate-fruit-thumb.jpg',
      heroImage: 'images/legitimate-fruit-hero.jpg',
      descEn: 'Italy, Victor Erice\'s workshop. I arrived with the script for Commandment and ended up making a different film entirely. A Bangladeshi woman walked up to my camera and spoke for over an hour in a language I don\'t understand — her own story, in her own words. The memory card failed. Most of it is gone. After the workshop, Erice wrote to me: When you surrender everything to fate, fate turns out to be surprisingly reliable.',
      descZh: '意大利，Victor Erice的工作坊。我带着《诫命》的剧本去，结果拍了另一部片子。一个孟加拉女人走到我摄影机前，用我一句也听不懂的语言，说了一个多小时她自己的故事。存储卡坏了，大部分没有留下来。工作坊结束后，Erice给我写了一封信，说：当你放弃一切，把它交给命运，命运会出其不意地可靠。',
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
      descEn: 'Tom stands shirtless on a Nashville street, raising his fist at the sky. A rainbow appeared. We kept filming. The second time we shot the same scene, the rainbow came back. I didn\'t stop to point it out to anyone. I just kept rolling.',
      descZh: 'Tom站在Nashville街头，光着上身，向天空挥拳。天上出现了彩虹。我们继续拍。第二次拍同样的场景，彩虹又出现了。我没有停下来指给任何人看。我只是继续拍。',
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
      thumbnail: 'images/murmur-thumb.jpg',
      heroImage: 'images/murmur-hero.jpg',
      descEn: 'My first film. A short called Amorelio. Two gangsters kill a man. We never learn why. I didn\'t know why either. Someone watched it and said: you have a gift for this. That was how it started.',
      descZh: '第一次拍片。短片，叫《阿莫利欧》。两个黑帮的人杀了一个人，我们不知道为什么。我也不知道为什么。拍完之后有人说，你有电影的天分。我就这样开始了。',
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
      thumbnail: 'images/sweet-life-thumb.jpg',
      heroImage: 'images/sweet-life-hero.jpg',
      descEn: 'Location scouting in Qingdao. Found a building shaped like the White House, sitting in an empty back alley. We started filming outside. Cars blocked us front and back. Phones were confiscated. We waited under guard for an hour or two. I called the police. They said it wasn\'t their jurisdiction. Eventually our phones were returned and we were let go. My Japanese art director spent the entire time hiding his small camera, terrified of being identified as Japanese.',
      descZh: '在青岛看景，找到一栋外表像白宫的建筑，在一条荒郊的小巷里。我们拿着摄影机在外面拍。前后被车堵住，手机被搜走，被人看着等了一两个小时。我打电话报警，警察说管不了。后来手机还回来了，我们走了。我的日本美术师全程死死攥着他的小相机，怕被发现是日本人。',
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
      thumbnail: 'images/uncertain-regards-thumb.jpg',
      heroImage: 'images/uncertain-regards-hero.jpg',
      descEn: 'Drove across the North China Plain with Wang Xiaomu to photograph the Yan and Yellow Emperor statues. Along the way: a Sphinx with its head removed and placed beside its body — Egypt had threatened a copyright lawsuit, so human face and lion body were now legally separate entities. Nearby, a building that was half Temple of Heaven, half US Capitol. On the drive back, thick fog. Visibility: a few meters. Xiaomu said we\'ll make it, then fell asleep. I drove alone until dawn.',
      descZh: '和王小木开车穿越华北平原，去炎黄二帝山拍参考照片。路上看见狮身人面像，头被截掉放在一边——因为埃及告侵权，所以人面是人面，狮身是狮身。旁边有座建筑，半边是天坛，半边是美国国会山。返程夜里起了大雾，能见度只有几米。小木说咱必干，然后睡着了。我一个人开到天亮。',
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
      descEn: 'Abbas was filming a cow in a Cuban village. I walked over and asked for a photo. We have plenty of time, he said, and went back to his cow. He died not long after. We only have one blurry photograph together. He was right. The cow mattered more.',
      descZh: '阿巴斯在古巴的村子里拍牛。我走过去问他能不能合张影。他说我们有很多时间。然后继续拍那头牛。后来他去世了。我们只有一张模糊的合影。他是对的，那头牛比合影重要。',
      credits: { en: 'Written & Directed by Niu Han', zh: '编剧/导演：牛涵' }
    },
    {
      id: 'woman-descending',
      titleZh: '下楼梯的女人',
      titleEn: 'Woman Descending the Staircase',
      year: 2016,
      type: 'short',
      format: { en: 'Short Film', zh: '短片' },
      duration: { en: 'TBD', zh: '待定' },
      thumbnail: 'images/woman-descending-thumb.jpg',
      heroImage: 'images/woman-descending-hero.jpg',
      descEn: 'Cuba, Abbas Kiarostami\'s workshop. I arrived with a script called The Woman Descending the Stairs. What I found instead: a lost red taxi, a relationship that had quietly ended, and a master crouching in the dirt filming a cow. The script went unused. I came back with a different film.',
      descZh: '古巴，阿巴斯工作坊。去之前带了一个剧本，叫《下楼梯的女人》。去之后遇见了一辆迷路的红色计程车，一段变了心的感情，和一个蹲在地上拍牛的大师。带去的剧本没有用上。带回来的是另一部电影。',
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
      thumbnail: 'images/between-yes-and-no-thumb.jpg',
      heroImage: 'images/between-yes-and-no-hero.jpg',
      descEn: 'Golden Horse Film Academy, Taipei. First encounter with Hou Hsiao-hsien in a slow elevator. I told him I admired him; he assumed I was a regular fan. He only realized I was a student when the doors opened on the third floor. That month he said many things. I wrote them all down. But one sentence I never needed to write: Why doesn\'t anyone just follow a person onto a bus with a camera, and follow them off again?',
      descZh: '金马学院，台北。第一次在电梯里遇见侯孝贤导演。电梯很慢，我说了一句崇拜您，他以为我是普通粉丝。到了三楼他才知道我也是学员。那个月他说了很多话，我都记下来了。但有一句话我不需要笔记本就能记住：为什么没有人拿着摄影机跟着一个人上公共汽车，跟着他下公共汽车？',
      credits: { en: 'Written & Directed by Niu Han', zh: '编剧/导演：牛涵' }
    },
    {
      id: 'home',
      titleZh: '回家',
      titleEn: 'Home',
      year: 2015,
      type: 'omnibus',
      format: { en: 'Omnibus Film', zh: '合集片' },
      duration: { en: 'TBD', zh: '待定' },
      thumbnail: 'images/home-thumb.jpg',
      heroImage: 'images/home-hero.jpg',
      descEn: 'My son was born. I\'ve been thinking about what I\'ll tell him one day, if he ever wants to pick up a camera. I think I\'ll say: don\'t wait until you\'re ready. Just take the camera and go. Let yourself get lost.',
      descZh: '儿子出生。我在想，等他长大，等他某一天也想拿起摄影机，我会告诉他什么。我想我会告诉他：不要等到准备好了再去拍。带上摄影机出门。让自己迷路。',
      credits: { en: 'Directed by Niu Han', zh: '导演：牛涵' }
    },
    {
      id: 'barren-land',
      titleZh: '不毛之国',
      titleEn: 'Land of Nobody',
      year: 2013,
      type: 'feature',
      format: { en: 'Feature Film', zh: '长片' },
      duration: { en: 'TBD', zh: '待定' },
      thumbnail: 'images/barren-land-thumb.jpg',
      heroImage: 'images/barren-land-hero.jpg',
      descEn: 'There\'s a scene where a drunk old vagrant fills a boy\'s head with his view of the world. Every word true. Every word devastating. After we shot it, I sat on set for a long time without moving.',
      descZh: '有一场戏是一个醉酒的老流浪汉给一个男孩灌输他对世界的看法。句句是真理，句句令人绝望。拍完那场戏，我在片场坐了很久。',
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
      thumbnail: 'images/melancholia-i-thumb.jpg',
      heroImage: 'images/melancholia-i-hero.jpg',
      descEn: 'Shooting a real estate commercial in the suburbs of Shenyang. The village produced their oldest resident — a man in his nineties. He opened his mouth and the first thing he talked about was Manchukuo. I filmed him for nearly an hour without interrupting. None of it made the ad. I\'ve never forgotten the look in his eyes.',
      descZh: '在沈阳郊区拍一个地产广告。村子里有一个九十几岁的老人，他们把他推到我摄影机前，说他是村里活得最久的人。他开口第一句话讲的是满洲国。我录了将近一个小时，没有打断他。那些素材没有进广告。我一直没有忘记他的眼神。',
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
      thumbnail: 'images/autumn-of-freedom-thumb.jpg',
      heroImage: 'images/autumn-of-freedom-hero.jpg',
      descEn: 'Three people, none of them understanding what life is about. I didn\'t understand either. I still don\'t. But I started to think that maybe not understanding is exactly what\'s worth filming.',
      descZh: '三个人，没有一个搞清楚生活是关于什么的。我当时也没搞清楚。现在也没有。但我开始觉得，搞不清楚这件事本身，可能才是值得拍的东西。',
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
      titleZh: '老子德道二篇',
      titleEn: 'The Force and the Source',
      year: 2023,
      type: 'translation',
      format: { en: 'Translation', zh: '译著' },
      descEn: 'A translation by Niu Han.',
      descZh: '牛涵译著。',
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
