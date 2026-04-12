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
      duration: { en: '108 min', zh: '108 分钟' },
      thumbnail: 'images/Commandment3.png',
      heroImage: 'images/commandment-hero.jpg',
      descEn: 'A devout church elder believes God has called him to take a second wife. His faith is genuine. His logic is airtight. His situation is absurd.',
      descZh: '一名虔诚的教会长老相信，上帝呼召他娶第二个妻子。他的信念是真实的，他的逻辑是自洽的，他的处境是荒诞的。',
      credits: { en: 'Written & Directed by Niu Han', zh: '编剧/导演：牛涵' }
    },
    {
      id: 'legitimate-fruit',
      titleZh: '合法正果',
      titleEn: 'Certified Groupies',
      year: 2024,
      type: 'short',
      format: { en: 'Short Film', zh: '短片' },
      duration: { en: '24 min', zh: '24 分钟' },
      thumbnail: 'images/legitimate-fruit-thumb.jpg',
      heroImage: 'images/legitimate-fruit-hero.jpg',
      descEn: 'A group of young directors from around the world gather in an Italian village, waiting for a legendary master. Each arrives with their ambitions, their leading ladies, their stories — and expectations far too large to carry. The master doesn\'t come.',
      descZh: '一群来自世界各地的青年导演，聚集在意大利一个小镇，等待一位传奇大师的到来。每个人都带着自己的野心、自己的女演员、自己的故事——和一份过于巨大的期待。大师没有来。',
      credits: { en: 'Written & Directed by Niu Han', zh: '编剧/导演：牛涵' }
    },
    {
      id: 'words',
      titleZh: '话语',
      titleEn: 'Word',
      year: 2023,
      type: 'feature',
      format: { en: 'Feature Film', zh: '长片' },
      duration: { en: '98 min', zh: '98 分钟' },
      thumbnail: 'images/Word502.png',
      heroImage: 'images/words-hero.jpg',
      descEn: 'Adapted from the play by Danish playwright Kaj Munk. Matt is called back to the hometown he has long despised. His second brother believes he is Jesus of Nazareth. His third brother is drowning in emotional wreckage. His father\'s mind is slipping. The family is already in ruins — and then his wife dies without warning. In a place where faith has collapsed, is miracle still possible?',
      descZh: '改编自丹麦剧作家Kaj Munk同名舞台剧。Matt被召回他鄙夷已久的家乡。二弟深信自己是拿撒勒人耶稣，三弟深陷情感的泥沼，父亲的精神状况每况愈下。这个家早已是废墟，妻子的突然离世将他推向最深的绝境。在信仰崩塌的地方，奇迹是否还有可能发生？',
      credits: { en: 'Written & Directed by Niu Han', zh: '编剧/导演：牛涵' }
    },
    {
      id: 'murmur',
      titleZh: '呢喃',
      titleEn: 'Chinese Whispers',
      year: 2019,
      type: 'feature',
      format: { en: 'Feature Film', zh: '长片' },
      duration: { en: '84 min', zh: '84 分钟' },
      thumbnail: 'images/murmur-thumb.jpg',
      heroImage: 'images/murmur-hero.jpg',
      descEn: 'An old friend, lost for years, appears at the door. Her arrival disturbs the calm surface of a family. The husband finds something long buried beginning to stir — and what stirs will bring more trouble than the old wounds ever did. Some things, once spoken, can never be taken back.',
      descZh: '一个失散多年的旧友，突然登门。她的出现搅动了一个家庭原本平静的表面。男主人发现，埋藏多年的情感正在悄悄复苏——而这份复苏，将带来比旧日恩怨更难收拾的麻烦。有些话说出口，就再也回不去了。',
      credits: { en: 'Written & Directed by Niu Han', zh: '编剧/导演：牛涵' }
    },
    {
      id: 'sweet-life',
      titleZh: '甜美生活',
      titleEn: 'A Sweet Life',
      year: 2017,
      type: 'feature',
      format: { en: 'Feature Film', zh: '长片' },
      duration: { en: '96 min', zh: '96 分钟' },
      thumbnail: 'images/sweet-life-thumb.jpg',
      heroImage: 'images/sweet-life-hero.jpg',
      descEn: 'Two kindergarten children go missing. The adults begin to search. And in searching, they find other things — the hollow spaces behind the noise, the cracks quietly buried by an era of relentless progress. A melancholy comedy. A fable about the way we live.',
      descZh: '两个幼儿园的孩子失踪了。大人们开始寻找。找着找着，找出了自己生活里那些说不清楚的东西——那些藏在热闹背后的空洞，那些被高歌猛进的时代顺手掩埋的裂缝。一篇基调忧伤的喜剧。一则关于我们如何生活的寓言。',
      credits: { en: 'Written & Directed by Niu Han', zh: '编剧/导演：牛涵' }
    },
    {
      id: 'uncertain-regards',
      titleZh: '不确定的问候',
      titleEn: 'Uncertain Regards',
      year: 2017,
      type: 'short',
      format: { en: 'Short Film', zh: '短片' },
      duration: { en: '5 min', zh: '5 分钟' },
      thumbnail: 'images/uncertain-regards-thumb.jpg',
      heroImage: 'images/uncertain-regards-hero.jpg',
      descEn: 'Cannes Film Festival. Outside the red carpet entrance. A director has one spare ticket. A girl approaches — she doesn\'t want one, she wants two. Her and her boyfriend. He gives her both. Then he stands outside alone.',
      descZh: '戛纳电影节，红毯外。一个导演手里多出一张票。人群里，一个女孩走过来——她不要一张，她要两张，她和她男朋友一起进去。导演把两张票都给了她。然后他自己站在门外。',
      credits: { en: 'Written & Directed by Niu Han', zh: '编剧/导演：牛涵' }
    },
    {
      id: 'cilantro',
      titleZh: '空中弥漫温热的香菜气息',
      titleEn: 'Warm Smell of Coriander',
      year: 2016,
      type: 'feature',
      format: { en: 'Feature Film', zh: '长片' },
      duration: { en: '72 min', zh: '72 分钟' },
      thumbnail: 'images/cilantro-thumb.jpg',
      heroImage: 'images/cilantro-hero.jpg',
      descEn: 'A down-and-out American director flies to Cuba with his Japanese girlfriend to attend a legendary master\'s workshop. The taxi gets lost. The girlfriend\'s heart has moved on. The workshop is nowhere to be found. Somewhere in the Cuban countryside, a relationship ends quietly — no announcement, no confirmation. Just sugarcane fields passing in reverse.',
      descZh: '一个落魄的美国导演，带着他的日本女友，飞到古巴，追随一位传奇大师。出租车迷路了。女友变心了。大师班找不到。在古巴的乡野之间，一段关系悄悄走到了尽头，没有人宣布，没有人确认，只是车窗外的蔗田一直在后退。',
      credits: { en: 'Written & Directed by Niu Han', zh: '编剧/导演：牛涵' }
    },
    {
      id: 'woman-descending',
      titleZh: '下楼梯的女人',
      titleEn: 'Woman Descending the Staircase',
      year: 2016,
      type: 'study',
      format: { en: 'Study', zh: '速写' },
      duration: { en: '17 min', zh: '17 分钟' },
      thumbnail: 'images/woman-descending-thumb.jpg',
      heroImage: 'images/woman-descending-hero.jpg',
      descEn: 'The new housekeeper is quiet, diligent, flawless. The mistress of the house begins to notice things. A painting. A glance. Strangers coming and going. Someone in this house is waiting for something.',
      descZh: '新来的女佣，安静，勤快，无懈可击。女主人开始注意到一些细节。那幅画，那个眼神，那些来来去去的陌生人。这栋房子里，有人在等待什么。',
      credits: { en: 'Written & Directed by Niu Han', zh: '编剧/导演：牛涵' }
    },
    {
      id: 'deliberation',
      titleZh: '众议',
      titleEn: 'The Deliberation',
      year: 2024,
      type: 'study',
      format: { en: 'Study — Italy', zh: '速写 — 意大利' },
      duration: { en: 'TBD', zh: '待定' },
      thumbnail: '',
      heroImage: '',
      descEn: '',
      descZh: '',
      credits: { en: 'Written & Directed by Niu Han', zh: '编剧/导演：牛涵' }
    },
    {
      id: 'fear-ali',
      titleZh: '恐惧：阿里吞噬灵魂',
      titleEn: 'Fear: Ali Eats the Soul',
      year: 2024,
      type: 'study',
      format: { en: 'Study — Italy', zh: '速写 — 意大利' },
      duration: { en: 'TBD', zh: '待定' },
      thumbnail: 'images/FearAli.jpg',
      heroImage: 'images/FearAli.jpg',
      descEn: 'Three Muslim men working in Italy. One is convinced that music is evil. The other two have different fears. Under the olive trees, the will of God and the weakness of man sit quietly together.',
      descZh: '三个穆斯林男人在意大利打工。其中一个坚信音乐是邪恶的。另外两个有别的恐惧。橄榄树下，神的旨意与人的软弱安静地坐在一起。',
      credits: { en: 'Written & Directed by Niu Han', zh: '编剧/导演：牛涵' }
    },
    {
      id: 'maria',
      titleZh: '玛丽亚',
      titleEn: 'Maria',
      year: 2024,
      type: 'study',
      format: { en: 'Study — Italy', zh: '速写 — 意大利' },
      duration: { en: 'TBD', zh: '待定' },
      thumbnail: '',
      heroImage: '',
      descEn: '',
      descZh: '',
      credits: { en: 'Written & Directed by Niu Han', zh: '编剧/导演：牛涵' }
    },
    {
      id: 'andre',
      titleZh: '安德烈',
      titleEn: 'Andre',
      year: 2024,
      type: 'study',
      format: { en: 'Study — Italy', zh: '速写 — 意大利' },
      duration: { en: 'TBD', zh: '待定' },
      thumbnail: '',
      heroImage: '',
      descEn: '',
      descZh: '',
      credits: { en: 'Written & Directed by Niu Han', zh: '编剧/导演：牛涵' }
    },
    {
      id: 'roadside-picnic',
      titleZh: '路边野餐',
      titleEn: 'The Picnic',
      year: 2025,
      type: 'study',
      format: { en: 'Study — Taiwan', zh: '速写 — 台湾' },
      duration: { en: 'TBD', zh: '待定' },
      thumbnail: '',
      heroImage: '',
      descEn: '',
      descZh: '',
      credits: { en: 'Written & Directed by Niu Han', zh: '编剧/导演：牛涵' }
    },
    {
      id: 'between-yes-and-no',
      titleZh: '是与不是之间',
      titleEn: 'Between Yes and No',
      year: 2015,
      type: 'short',
      format: { en: 'Short Film', zh: '短片' },
      duration: { en: '7 min', zh: '7 分钟' },
      thumbnail: 'images/between-yes-and-no-thumb.jpg',
      heroImage: 'images/between-yes-and-no-hero.jpg',
      descEn: 'At a wrap party, a director introduces his ex to the girl he now likes. He asks: what do you think of her? He shouldn\'t have asked. The glasses aren\'t even empty yet, and something has already broken.',
      descZh: '庆功宴上，一个男导演向前恋人介绍他新喜欢的女孩。他问：你觉得她怎么样？这句话，不该问的。酒杯还没空，什么东西已经碎了。',
      credits: { en: 'Written & Directed by Niu Han', zh: '编剧/导演：牛涵' }
    },
    {
      id: 'home',
      titleZh: '回家',
      titleEn: 'Homecoming',
      year: 2015,
      type: 'short',
      format: { en: 'Short Film', zh: '短片' },
      duration: { en: '20 min', zh: '20 分钟' },
      thumbnail: 'images/home-thumb.jpg',
      heroImage: 'images/home-hero.jpg',
      descEn: 'He just went to the harbor to hang around. Shanghai, 1949. He boarded a ship with some friends. The ship went to Taiwan. He spent the rest of his life there. Decades later, when the borders finally opened, he went back. His parents were gone. The streets didn\'t recognize him. Everything had changed. He just went to the harbor to hang around.',
      descZh: '他只是去港口玩了一下。1949年，上海，他跟朋友上了一艘船。船去了台湾。他就这样在台湾过了一辈子。几十年后，两岸开放，他回去了。父母不在了，街道不认识了，什么都变了。他只是去港口玩了一下。',
      credits: { en: 'Directed by Niu Han', zh: '导演：牛涵' }
    },
    {
      id: 'barren-land',
      titleZh: '不毛之国',
      titleEn: 'Land of Nobody',
      year: 2013,
      type: 'feature',
      format: { en: 'Feature Film', zh: '长片' },
      duration: { en: '93 min', zh: '93 分钟' },
      thumbnail: 'images/barren-land-thumb.jpg',
      heroImage: 'images/barren-land-hero.jpg',
      descEn: 'A boy runs away from school, away from the play nobody believed in. In some corner of the city, he meets a drunk old vagrant with a lot to say about the world. Every word true. Every word crushing. The boy takes it all in. At night, another story moves quietly through his dreams.',
      descZh: '一个男孩逃离了学校，逃离了那出没有人信的戏剧。在某个角落，他遇见了一个醉酒的老流浪汉。老头对这个世界有很多话要说，句句是真理，句句令人绝望。男孩听进去了。夜里，另一个故事在梦里悄悄行进。',
      credits: { en: 'Written & Directed by Niu Han', zh: '编剧/导演：牛涵' }
    },
    {
      id: 'melancholia-i',
      titleZh: '忧郁 I',
      titleEn: 'Melancholia I',
      year: 2013,
      type: 'short',
      format: { en: 'Short Film', zh: '短片' },
      duration: { en: '8 min', zh: '8 分钟' },
      thumbnail: 'images/melancholia-i-thumb.jpg',
      heroImage: 'images/melancholia-i-hero.jpg',
      descEn: 'The seaside. Years later. A writer who can no longer write. A woman whose life hasn\'t turned out right. They were in love once. Now they\'re here again, with all those years between them. Some conversations can only happen in a place like this.',
      descZh: '海边，多年之后。一个写不出东西的作家，一个生活不幸福的女人。他们曾经相爱，现在重逢，中间隔着说不清楚的岁月。有些对话，只能在这里说。',
      credits: { en: 'Written & Directed by Niu Han', zh: '编剧/导演：牛涵' }
    },
    {
      id: 'autumn-of-freedom',
      titleZh: '自由之丘',
      titleEn: 'Freedom Hills',
      year: 2009,
      type: 'feature',
      format: { en: 'Feature Film', zh: '长片' },
      duration: { en: '75 min', zh: '75 分钟' },
      thumbnail: 'images/autumn-of-freedom-thumb.jpg',
      heroImage: 'images/autumn-of-freedom-hero.jpg',
      descEn: 'A man meets a girl. The girl has another man in her nights. Three people, each carrying some idea of what life should be — none of them living it. Freedom is somewhere over the hills. Nobody\'s ever actually been.',
      descZh: '一个普通男人，遇见了一个女孩。女孩的夜里还有另一个男人。三个人，各自怀揣着对生活的某种想象，却没有一个人活在那个想象里。自由在山那边。没有人真的去过。',
      credits: { en: 'Written & Directed by Niu Han', zh: '编剧/导演：牛涵' }
    }
  ];

  // ---------- Writing Data ----------
  const WRITINGS = [
    {
      id: 'baseborn',
      titleZh: '贱生',
      titleEn: 'Baseborn',
      year: 2026,
      type: 'novel',
      format: { en: 'Novel', zh: '小说' },
      coverImage: 'images/BASEBORN_CoverFIN.jpg',
      descEn: 'A novel by Niu Han.',
      descZh: '牛涵长篇小说。',
      publisher: { en: '', zh: '' }
    },
    {
      id: 'force-and-source',
      titleZh: '老子德道经',
      titleEn: 'The Force and the Source',
      year: 2026,
      type: 'translation',
      format: { en: 'Translation', zh: '译著' },
      descEn: 'A translation by Niu Han.',
      descZh: '牛涵译著。',
      publisher: { en: '', zh: '' }
    },
    {
      id: 'wild-duck',
      titleZh: '野鸟',
      titleEn: 'Stray Birds',
      year: 2014,
      type: 'translation',
      format: { en: 'Translation', zh: '译著' },
      coverImage: 'images/straybirds.jpg',
      descEn: 'A translation by Niu Han.',
      descZh: '牛涵译著。',
      publisher: { en: '', zh: '' }
    },
    {
      id: 'art-of-dramatic-writing',
      titleZh: '戏张力写作法',
      titleEn: 'The Art of Dramatic Writing',
      year: 2019,
      type: 'translation',
      format: { en: 'Translation', zh: '译著' },
      descEn: 'A translation by Niu Han.',
      descZh: '牛涵译著。',
      publisher: { en: '', zh: '' }
    },
    // {
    //   id: 'cinema-impromptu',
    //   titleZh: '即兴电影',
    //   titleEn: 'Cinema Impromptu',
    //   year: 2026,
    //   type: 'nonfiction',
    //   format: { en: 'Non-Fiction', zh: '非虚构' },
    //   descEn: 'A non-fiction work by Niu Han.',
    //   descZh: '牛涵非虚构作品。',
    //   publisher: { en: '', zh: '' }
    // }
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

    // Random hero image from works on each visit
    (function setRandomHero() {
      var images = [];
      WORKS.forEach(function (w) {
        if (w.heroImage) images.push(w.heroImage);
        if (w.thumbnail) images.push(w.thumbnail);
      });
      if (images.length > 0) {
        var pick = images[Math.floor(Math.random() * images.length)];
        var heroImg = document.querySelector('#heroImage img');
        if (heroImg) {
          heroImg.src = pick;
          heroImg.alt = 'Niu Han — film still';
        }
      }
    })();

    // Transparent nav on home (initial state); hide scroll-fade
    if (currentPage === 'home') {
      document.querySelector('.nav').classList.add('nav-transparent');
      var fade = document.getElementById('scrollFade');
      if (fade) fade.style.display = 'none';
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

    // Transparent nav on home page; hide scroll-fade on home
    var nav = document.querySelector('.nav');
    var fade = document.getElementById('scrollFade');
    if (page === 'home') {
      nav.classList.add('nav-transparent');
      if (fade) fade.style.display = 'none';
    } else {
      nav.classList.remove('nav-transparent');
      if (fade) fade.style.display = '';
    }

    // Reset journal to list view when navigating to journal
    if (page === 'journal') {
      var jList = document.getElementById('journalList');
      if (jList) jList.style.display = '';
      document.querySelectorAll('.journal-article').forEach(function(a) {
        a.style.display = 'none';
      });
    }
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
    document.querySelector('.nav').classList.toggle('nav-menu-open', mobileMenuOpen);
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
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
    if (currentSubFilter === 'study') filtered = WORKS.filter(function(w) { return w.type === 'study'; });
    filtered = filtered.slice().sort(function(a, b) { return b.year - a.year; });

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
      tag.appendChild(langSpan(work.format.en, work.format.zh));
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

    // Video / Trailer section — only show full player if videoSrc exists
    var videoSection = createEl('div', { className: 'wd-section' });
    var vidLabel = createEl('div', { className: 'wd-section-label' });
    vidLabel.appendChild(langSpan('Trailer', '预告片'));
    videoSection.appendChild(vidLabel);

    if (work.videoSrc) {
      // Full custom video player
      var videoId = 'video-' + work.id;
      var container = createEl('div', { className: 'video-container', id: 'videoContainer-' + work.id });

      var video = document.createElement('video');
      video.id = videoId;
      video.preload = 'metadata';
      video.setAttribute('controlsList', 'nodownload');
      video.setAttribute('playsinline', '');
      video.src = work.videoSrc;
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
    } else {
      // "Coming soon" placeholder
      var placeholder = createEl('div', { className: 'video-coming-soon' });
      var phSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      phSvg.setAttribute('viewBox', '0 0 24 24');
      var phRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      phRect.setAttribute('x', '2'); phRect.setAttribute('y', '4');
      phRect.setAttribute('width', '20'); phRect.setAttribute('height', '16');
      phRect.setAttribute('rx', '2');
      var phPoly = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
      phPoly.setAttribute('points', '10,8 10,16 16,12');
      phPoly.setAttribute('fill', 'rgba(255,255,255,0.15)');
      phPoly.setAttribute('stroke', 'none');
      phSvg.appendChild(phRect);
      phSvg.appendChild(phPoly);
      placeholder.appendChild(phSvg);
      var phText = createEl('span', { className: 'video-coming-soon-text' });
      phText.appendChild(langSpan('Coming Soon', '即将发布'));
      placeholder.appendChild(phText);
      videoSection.appendChild(placeholder);
    }
    body.appendChild(videoSection);

    workDetailInner.appendChild(body);

    // Open overlay
    workDetail.classList.add('open');
    document.body.style.overflow = 'hidden';

    // Initialize player if video source exists
    if (work.videoSrc) {
      requestAnimationFrame(function() { initVideoPlayer(work.id); });
    }
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

      // Cover: use image if available, otherwise typographic title
      var cardImage = createEl('div', { className: 'work-card-image' + (item.coverImage ? ' has-cover' : '') });
      if (item.coverImage) {
        var img = createEl('img', { src: item.coverImage, alt: item.titleEn });
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'cover';
        cardImage.appendChild(img);
      } else {
        var coverTitle = createEl('div', { className: 'writing-cover-title' });
        coverTitle.appendChild(langSpan(item.titleEn, item.titleZh));
        cardImage.appendChild(coverTitle);
      }
      card.appendChild(cardImage);

      var meta = createEl('div', { className: 'work-card-meta' });
      meta.appendChild(createEl('span', { className: 'work-card-year', textContent: String(item.year) }));
      var tag = createEl('span', { className: 'work-card-tag' });
      tag.appendChild(langSpan(item.format.en, item.format.zh));
      meta.appendChild(tag);
      card.appendChild(meta);

      var cardTitle = createEl('div', { className: 'work-card-title' });
      cardTitle.appendChild(langSpan(item.titleEn, item.titleZh));
      card.appendChild(cardTitle);

      // Description line
      var desc = createEl('div', { className: 'writing-card-desc' });
      desc.appendChild(langSpan(item.descEn, item.descZh));
      card.appendChild(desc);

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
    document.getElementById('mobileMenuClose').addEventListener('click', toggleMobileMenu);

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

    // Journal: click entry → show article
    document.querySelectorAll('.journal-entry').forEach(function(entry) {
      entry.addEventListener('click', function() {
        var id = entry.dataset.journal;
        var article = document.getElementById('journal-' + id);
        var list = document.getElementById('journalList');
        if (article && list) {
          list.style.display = 'none';
          article.style.display = 'block';
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });
    });

    // Journal: back button
    document.querySelectorAll('.journal-back').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var article = btn.closest('.journal-article');
        var list = document.getElementById('journalList');
        if (article && list) {
          article.style.display = 'none';
          list.style.display = 'block';
        }
      });
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
