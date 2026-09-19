// =========================================================
// МастерСантехник — интерактивная логика сайта
// =========================================================

document.addEventListener('DOMContentLoaded', () => {
  initIcons();
  initHeaderScroll();
  initMobileMenu();
  initSmoothAnchors();
  initPriceTabs();
  initModal();
  initScrollReveal();
  initStickyCta();
  initForms();
  initLang();
});

/* ---------------------------------------------------------
   Lucide icons
--------------------------------------------------------- */
function initIcons() {
  if (window.lucide) {
    lucide.createIcons();
  }
}

/* ---------------------------------------------------------
   Header: тень при скролле + закрытие мобильного меню
--------------------------------------------------------- */
function initHeaderScroll() {
  const header = document.getElementById('header');
  if (!header) return;

  const toggle = () => {
    if (window.scrollY > 12) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };
  toggle();
  window.addEventListener('scroll', toggle, { passive: true });
}

/* ---------------------------------------------------------
   Мобильное меню
--------------------------------------------------------- */
function initMobileMenu() {
  const btn = document.getElementById('menu-btn');
  const menu = document.getElementById('mobile-menu');
  if (!btn || !menu) return;

  const setOpen = (open) => {
    menu.classList.toggle('hidden', !open);
    btn.innerHTML = open
      ? '<i data-lucide="x" class="w-5 h-5"></i>'
      : '<i data-lucide="menu" class="w-5 h-5"></i>';
    initIcons();
  };

  btn.addEventListener('click', () => {
    const isHidden = menu.classList.contains('hidden');
    setOpen(isHidden);
  });

  menu.querySelectorAll('.mobile-link, a[data-open-modal]').forEach((link) => {
    link.addEventListener('click', () => setOpen(false));
  });
}

/* ---------------------------------------------------------
   Плавный скролл к якорям (учитывая высоту хедера)
--------------------------------------------------------- */
function initSmoothAnchors() {
  const header = document.getElementById('header');
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const id = link.getAttribute('href');
      if (!id || id === '#' || id === '#call-modal') return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const offset = (header ? header.offsetHeight : 0) + 8;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
}

/* ---------------------------------------------------------
   Вкладки цен
--------------------------------------------------------- */
function initPriceTabs() {
  const tabs = document.querySelectorAll('.price-tab');
  const panels = document.querySelectorAll('.price-panel');
  if (!tabs.length) return;

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;

      tabs.forEach((t) => t.classList.toggle('active', t === tab));
      panels.forEach((p) => p.classList.toggle('hidden', p.dataset.panel !== target));
    });
  });
}

/* ---------------------------------------------------------
   Модальное окно заказа звонка
--------------------------------------------------------- */
function initModal() {
  const overlay = document.getElementById('call-modal-overlay');
  const box = document.getElementById('call-modal-box');
  const closeBtn = document.getElementById('modal-close');
  const openers = document.querySelectorAll('[data-open-modal]');
  if (!overlay || !box) return;

  const open = () => {
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => box.classList.add('open'));
  };

  const close = () => {
    box.classList.remove('open');
    document.body.style.overflow = '';
    setTimeout(() => overlay.classList.remove('open'), 200);
  };

  openers.forEach((el) => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      open();
    });
  });

  closeBtn && closeBtn.addEventListener('click', close);

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) close();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('open')) close();
  });
}

/* ---------------------------------------------------------
   Scroll-reveal анимации через IntersectionObserver
--------------------------------------------------------- */
function initScrollReveal() {
  const items = document.querySelectorAll('[data-animate]');
  if (!items.length) return;

  if (!('IntersectionObserver' in window)) {
    items.forEach((el) => el.classList.add('in-view'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  items.forEach((el, i) => {
    el.style.transitionDelay = `${Math.min(i % 6, 5) * 60}ms`;
    observer.observe(el);
  });
}

/* ---------------------------------------------------------
   Плавающая CTA-панель для мобильных
--------------------------------------------------------- */
function initStickyCta() {
  const cta = document.getElementById('sticky-cta');
  const hero = document.getElementById('hero');
  if (!cta || !hero) return;

  const heroBottom = () => hero.getBoundingClientRect().bottom + window.scrollY;

  const toggle = () => {
    if (window.scrollY > heroBottom() - 200) {
      cta.classList.add('visible');
    } else {
      cta.classList.remove('visible');
    }
  };
  toggle();
  window.addEventListener('scroll', toggle, { passive: true });
  window.addEventListener('resize', toggle);
}

/* ---------------------------------------------------------
   Обработка форм (заявка + модалка)
--------------------------------------------------------- */
function initForms() {
  const requestForm = document.getElementById('request-form');
  if (requestForm) {
    requestForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = requestForm.querySelector('button[type="submit"]');
      const original = btn.innerHTML;
      const lang = document.documentElement.lang === 'ro' ? 'ro' : 'ru';
      const sentText = lang === 'ro' ? 'Trimis! Vă vom suna în curând.' : 'Отправлено! Скоро свяжемся с вами.';

      btn.disabled = true;
      btn.innerHTML = `<i data-lucide="check" class="w-5 h-5"></i><span>${sentText}</span>`;
      initIcons();

      setTimeout(() => {
        requestForm.reset();
        btn.disabled = false;
        btn.innerHTML = original;
        initIcons();
      }, 3000);
    });
  }

  const modalForm = document.getElementById('modal-form');
  const modalSuccess = document.getElementById('modal-success');
  if (modalForm && modalSuccess) {
    modalForm.addEventListener('submit', (e) => {
      e.preventDefault();
      modalForm.classList.add('hidden');
      modalSuccess.classList.remove('hidden');
      initIcons();

      setTimeout(() => {
        modalForm.reset();
        modalForm.classList.remove('hidden');
        modalSuccess.classList.add('hidden');
      }, 3500);
    });
  }
}

/* ---------------------------------------------------------
   Переключатель языка RU / RO
--------------------------------------------------------- */
const I18N = {
  ru: {
    'logo.tag': 'Кишинёв · 24/7',
    'nav.services': 'Услуги',
    'nav.prices': 'Цены',
    'nav.calc': 'Заявка',
    'nav.reviews': 'Отзывы',
    'nav.contacts': 'Контакты',
    'nav.emergency': 'Срочный вызов',
    'hero.badge': 'Мастер на связи прямо сейчас',
    'hero.title': 'Срочные и плановые сантехнические работы в Кишинёве и пригороде 24/7',
    'hero.subtitle': 'Устранение протечек, ремонт котлов, установка душевых кабин и прочистка канализации с гарантией. Выезд мастера за 30–45 минут в любую точку города.',
    'hero.cta1': 'Вызвать мастера срочно',
    'hero.cta2': 'Рассчитать стоимость',
    'hero.trust1': 'Гарантия 12 мес.',
    'hero.trust2': 'Выезд 30–45 мин.',
    'hero.trust3': '4.9 из 5',
    'hero.card1title': '10+ лет опыта',
    'hero.card1sub': 'Более 3500 заявок',
    'hero.card2title': 'Выезд за 30 мин',
    'hero.card2sub': 'По всему Кишинёву',
    'why.eyebrow': 'Почему выбирают нас',
    'why.title': 'Надёжный сервис, на который можно положиться',
    'why.card1title': 'Аварийный выезд 24/7',
    'why.card1text': 'Принимаем заявки круглосуточно, включая праздники и выходные дни.',
    'why.card2title': 'Опыт более 10 лет',
    'why.card2text': 'Сотни успешно решённых задач любой сложности по сантехнике и отоплению.',
    'why.card3title': 'Гарантия до 12 месяцев',
    'why.card3text': 'На все виды работ и установленное оборудование — письменно.',
    'why.card4title': 'Фиксированные цены',
    'why.card4text': 'Озвучиваем стоимость заранее — никаких скрытых доплат по факту.',
    'services.eyebrow': 'Наши услуги',
    'services.title': 'Полный спектр сантехнических работ',
    'services.subtitle': 'От мелкого ремонта до капитальной замены систем — выполняем под ключ.',
    'services.card1title': 'Отопление и котлы',
    'services.card1li1': 'Монтаж систем отопления «под ключ»',
    'services.card1li2': 'Чистка теплообменников',
    'services.card1li3': 'Ремонт газовых и электрических котлов',
    'services.card2title': 'Сантехника под ключ',
    'services.card2li1': 'Установка унитазов и раковин',
    'services.card2li2': 'Смена стояков и труб PPR / металлопласт',
    'services.card2li3': 'Разводка водоснабжения',
    'services.card3title': 'Душевые кабины и ванные',
    'services.card3li1': 'Монтаж и подключение душевых кабин',
    'services.card3li2': 'Герметизация швов',
    'services.card3li3': 'Подключение гидромассажа',
    'services.card4title': 'Канализация',
    'services.card4li1': 'Устранение засоров механическим способом',
    'services.card4li2': 'Гидродинамическая прочистка',
    'services.card4li3': 'Замена канализационных труб',
    'services.card5title': '«Муж на час»',
    'services.card5li1': 'Мелкий бытовой ремонт',
    'services.card5li2': 'Сборка и навеска мебели, сантехники',
    'services.card5li3': 'Устранение мелких протечек',
    'services.ctaTitle': 'Не нашли нужную услугу?',
    'services.ctaText': 'Опишите проблему — подберём решение и назовём цену за 5 минут.',
    'services.ctaBtn': 'Оставить заявку',
    'prices.eyebrow': 'Прайс-лист',
    'prices.title': 'Ориентировочные цены на услуги',
    'prices.subtitle': 'Точная стоимость озвучивается мастером на месте после осмотра.',
    'prices.tab1': 'Отопление',
    'prices.tab2': 'Сантехника',
    'prices.tab3': 'Душевые кабины',
    'prices.tab4': 'Канализация',
    'prices.h1': 'Диагностика котла',
    'prices.h2': 'Установка бойлера',
    'prices.h3': 'Чистка теплообменника',
    'prices.h4': 'Монтаж системы отопления (за точку)',
    'prices.s1': 'Установка унитаза',
    'prices.s2': 'Установка раковины / смесителя',
    'prices.s3': 'Замена труб (за метр)',
    'prices.s4': 'Устранение протечки',
    'prices.sh1': 'Монтаж душевой кабины',
    'prices.sh2': 'Герметизация швов',
    'prices.sh3': 'Подключение гидромассажа',
    'prices.sw1': 'Прочистка канализации (механически)',
    'prices.sw2': 'Гидродинамическая прочистка',
    'prices.sw3': 'Замена канализационных труб (за метр)',
    'prices.note': '* Итоговая стоимость зависит от объёма работ и материалов. Выезд и диагностика — бесплатно при заказе работ.',
    'calc.eyebrow': 'Быстрая заявка',
    'calc.title': 'Опишите проблему — назовём цену за 5 минут',
    'calc.subtitle': 'Заполните форму, и мастер перезвонит вам в течение 5 минут для уточнения деталей и стоимости.',
    'calc.nameLabel': 'Ваше имя',
    'calc.namePlaceholder': 'Как к вам обращаться?',
    'calc.phoneLabel': 'Телефон',
    'calc.serviceLabel': 'Тип услуги',
    'calc.opt1': 'Аварийный выезд (протечка, засор)',
    'calc.opt2': 'Отопление / котёл',
    'calc.opt3': 'Установка сантехники',
    'calc.opt4': 'Душевая кабина',
    'calc.opt5': 'Другое / не знаю',
    'calc.descLabel': 'Опишите проблему',
    'calc.descPlaceholder': 'Например: течёт кран на кухне, нужно заменить прокладку...',
    'calc.submit': 'Отправить заявку',
    'calc.privacy': 'Нажимая кнопку, вы соглашаетесь с обработкой персональных данных.',
    'reviews.eyebrow': 'Отзывы клиентов',
    'reviews.title': 'Нам доверяют сотни клиентов',
    'reviews.r1text': '«Ночью прорвало трубу на кухне, позвонил в час ночи — мастер приехал через 40 минут, всё аккуратно устранил. Цену назвали сразу, доплат не было.»',
    'reviews.r1name': 'Олег В.',
    'reviews.r1loc': 'Ботаника, Кишинёв',
    'reviews.r2text': '«Заказывали установку душевой кабины под ключ. Приехали вовремя, работали чисто и быстро, объяснили гарантию. Рекомендую как надёжную бригаду.»',
    'reviews.r2name': 'Мария К.',
    'reviews.r2loc': 'Рышкановка, Кишинёв',
    'reviews.r3text': '«Почистили теплообменник котла перед началом сезона — котёл стал работать тише и экономичнее. Мастер грамотный, всё объяснил по-человечески.»',
    'reviews.r3name': 'Игорь Д.',
    'reviews.r3loc': 'Чеканы, Кишинёв',
    'contacts.eyebrow': 'Контакты',
    'contacts.title': 'Свяжитесь с нами любым удобным способом',
    'contacts.phoneTitle': 'Телефон 24/7',
    'contacts.messTitle': 'Мессенджеры',
    'contacts.zoneTitle': 'Зона обслуживания',
    'contacts.zoneText': 'Кишинёв и пригород (Кодру, Ставчены, Кожушна, Бубуечь)',
    'contacts.hoursTitle': 'Режим работы',
    'contacts.hoursText': 'Круглосуточно, без выходных',
    'contacts.mapTitle': 'г. Кишинёв, сектор Центр',
    'contacts.mapText': 'Выезжаем в любой район города и пригород',
    'footerCta.title': 'Труба потекла прямо сейчас?',
    'footerCta.text': 'Не ждите — звоните, мастер уже в пути через 30–45 минут.',
    'footer.copy': '© 2026 МастерСантехник. Все права защищены.',
    'sticky.call': 'Позвонить',
    'sticky.emergency': 'Срочный вызов',
    'modal.title': 'Заказать обратный звонок',
    'modal.text': 'Оставьте номер — перезвоним в течение 5 минут и вышлем мастера.',
    'modal.namePlaceholder': 'Ваше имя',
    'modal.submit': 'Заказать звонок',
    'modal.orCall': 'или звоните напрямую: <a href="tel:+37379247790" class="font-bold text-navy-900">+373 792 47 790</a>',
    'modal.successTitle': 'Заявка принята!',
    'modal.successText': 'Мы перезвоним вам в ближайшие 5 минут.'
  },
  ro: {
    'logo.tag': 'Chișinău · 24/7',
    'nav.services': 'Servicii',
    'nav.prices': 'Prețuri',
    'nav.calc': 'Cerere',
    'nav.reviews': 'Recenzii',
    'nav.contacts': 'Contacte',
    'nav.emergency': 'Apel urgent',
    'hero.badge': 'Meșterul este disponibil acum',
    'hero.title': 'Lucrări sanitare urgente și planificate în Chișinău și suburbii 24/7',
    'hero.subtitle': 'Eliminarea scurgerilor, reparația centralelor, montarea cabinelor de duș și curățarea canalizării cu garanție. Deplasarea meșterului în 30–45 minute.',
    'hero.cta1': 'Cheamă meșterul urgent',
    'hero.cta2': 'Calculează costul',
    'hero.trust1': 'Garanție 12 luni',
    'hero.trust2': 'Sosire 30–45 min.',
    'hero.trust3': '4.9 din 5',
    'hero.card1title': '10+ ani experiență',
    'hero.card1sub': 'Peste 3500 de solicitări',
    'hero.card2title': 'Sosire în 30 min',
    'hero.card2sub': 'În tot Chișinăul',
    'why.eyebrow': 'De ce ne aleg',
    'why.title': 'Un serviciu de încredere pe care te poți baza',
    'why.card1title': 'Deplasare de urgență 24/7',
    'why.card1text': 'Acceptăm cereri non-stop, inclusiv în sărbători și weekend.',
    'why.card2title': 'Experiență de peste 10 ani',
    'why.card2text': 'Sute de sarcini rezolvate cu succes de orice complexitate.',
    'why.card3title': 'Garanție până la 12 luni',
    'why.card3text': 'Pentru toate tipurile de lucrări și echipamente instalate — în scris.',
    'why.card4title': 'Prețuri fixe',
    'why.card4text': 'Anunțăm costul în avans — fără taxe ascunse ulterior.',
    'services.eyebrow': 'Serviciile noastre',
    'services.title': 'Gamă completă de lucrări sanitare',
    'services.subtitle': 'De la reparații mici până la înlocuirea completă a sistemelor — la cheie.',
    'services.card1title': 'Încălzire și centrale',
    'services.card1li1': 'Montarea sistemelor de încălzire „la cheie”',
    'services.card1li2': 'Curățarea schimbătoarelor de căldură',
    'services.card1li3': 'Reparația centralelor pe gaz și electrice',
    'services.card2title': 'Instalații sanitare la cheie',
    'services.card2li1': 'Montarea vaselor de toaletă și chiuvetelor',
    'services.card2li2': 'Înlocuirea coloanelor și țevilor PPR / metal-plastic',
    'services.card2li3': 'Distribuția rețelei de apă',
    'services.card3title': 'Cabine de duș și băi',
    'services.card3li1': 'Montarea și conectarea cabinelor de duș',
    'services.card3li2': 'Etanșarea rosturilor',
    'services.card3li3': 'Conectarea sistemelor de hidromasaj',
    'services.card4title': 'Canalizare',
    'services.card4li1': 'Eliminarea înfundărilor mecanic',
    'services.card4li2': 'Curățare hidrodinamică',
    'services.card4li3': 'Înlocuirea țevilor de canalizare',
    'services.card5title': '„Bărbat la oră”',
    'services.card5li1': 'Reparații mici casnice',
    'services.card5li2': 'Asamblare și montare mobilier, sanitare',
    'services.card5li3': 'Eliminarea scurgerilor mici',
    'services.ctaTitle': 'Nu ați găsit serviciul dorit?',
    'services.ctaText': 'Descrieți problema — vom găsi soluția și vom anunța prețul în 5 minute.',
    'services.ctaBtn': 'Trimite cererea',
    'prices.eyebrow': 'Lista de prețuri',
    'prices.title': 'Prețuri orientative pentru servicii',
    'prices.subtitle': 'Costul exact este anunțat de meșter la fața locului după inspecție.',
    'prices.tab1': 'Încălzire',
    'prices.tab2': 'Sanitare',
    'prices.tab3': 'Cabine de duș',
    'prices.tab4': 'Canalizare',
    'prices.h1': 'Diagnosticarea centralei',
    'prices.h2': 'Montarea boilerului',
    'prices.h3': 'Curățarea schimbătorului de căldură',
    'prices.h4': 'Montarea sistemului de încălzire (per punct)',
    'prices.s1': 'Montarea vasului de toaletă',
    'prices.s2': 'Montarea chiuvetei / bateriei',
    'prices.s3': 'Înlocuirea țevilor (per metru)',
    'prices.s4': 'Eliminarea scurgerii',
    'prices.sh1': 'Montarea cabinei de duș',
    'prices.sh2': 'Etanșarea rosturilor',
    'prices.sh3': 'Conectarea hidromasajului',
    'prices.sw1': 'Curățarea canalizării (mecanic)',
    'prices.sw2': 'Curățare hidrodinamică',
    'prices.sw3': 'Înlocuirea țevilor de canalizare (per metru)',
    'prices.note': '* Costul final depinde de volumul lucrărilor și materiale. Deplasarea și diagnosticarea sunt gratuite la comandarea lucrărilor.',
    'calc.eyebrow': 'Cerere rapidă',
    'calc.title': 'Descrieți problema — anunțăm prețul în 5 minute',
    'calc.subtitle': 'Completați formularul, iar meșterul vă va suna în 5 minute pentru detalii și cost.',
    'calc.nameLabel': 'Numele dvs.',
    'calc.namePlaceholder': 'Cum să vă adresăm?',
    'calc.phoneLabel': 'Telefon',
    'calc.serviceLabel': 'Tipul serviciului',
    'calc.opt1': 'Deplasare de urgență (scurgere, înfundare)',
    'calc.opt2': 'Încălzire / centrală',
    'calc.opt3': 'Montare instalații sanitare',
    'calc.opt4': 'Cabină de duș',
    'calc.opt5': 'Altceva / nu știu',
    'calc.descLabel': 'Descrieți problema',
    'calc.descPlaceholder': 'De exemplu: curge robinetul la bucătărie, trebuie schimbată garnitura...',
    'calc.submit': 'Trimite cererea',
    'calc.privacy': 'Apăsând butonul, sunteți de acord cu prelucrarea datelor personale.',
    'reviews.eyebrow': 'Recenziile clienților',
    'reviews.title': 'Suntem de încredere pentru sute de clienți',
    'reviews.r1text': '„Noaptea s-a spart o țeavă la bucătărie, am sunat la ora unu — meșterul a venit în 40 de minute, a rezolvat totul îngrijit. Prețul a fost anunțat imediat, fără taxe suplimentare.”',
    'reviews.r1name': 'Oleg V.',
    'reviews.r1loc': 'Botanica, Chișinău',
    'reviews.r2text': '„Am comandat montarea unei cabine de duș la cheie. Au venit la timp, au lucrat curat și rapid, au explicat garanția. Recomand ca echipă de încredere.”',
    'reviews.r2name': 'Maria C.',
    'reviews.r2loc': 'Râșcani, Chișinău',
    'reviews.r3text': '„Au curățat schimbătorul de căldură al centralei înainte de sezon — centrala funcționează mai silențios și mai economic. Meșter competent, a explicat totul clar.”',
    'reviews.r3name': 'Igor D.',
    'reviews.r3loc': 'Ciocana, Chișinău',
    'contacts.eyebrow': 'Contacte',
    'contacts.title': 'Contactați-ne în modul care vă convine',
    'contacts.phoneTitle': 'Telefon 24/7',
    'contacts.messTitle': 'Mesagerie',
    'contacts.zoneTitle': 'Zona de deservire',
    'contacts.zoneText': 'Chișinău și suburbii (Codru, Stăuceni, Cojușna, Bubuieci)',
    'contacts.hoursTitle': 'Program de lucru',
    'contacts.hoursText': 'Non-stop, fără zile libere',
    'contacts.mapTitle': 'Chișinău, sectorul Centru',
    'contacts.mapText': 'Ne deplasăm în orice sector al orașului și suburbii',
    'footerCta.title': 'Vi s-a spart o țeavă chiar acum?',
    'footerCta.text': 'Nu așteptați — sunați, meșterul ajunge în 30–45 minute.',
    'footer.copy': '© 2026 MasterSantehnic. Toate drepturile rezervate.',
    'sticky.call': 'Sună',
    'sticky.emergency': 'Apel urgent',
    'modal.title': 'Comandă un apel',
    'modal.text': 'Lăsați numărul — vă sunăm în 5 minute și trimitem meșterul.',
    'modal.namePlaceholder': 'Numele dvs.',
    'modal.submit': 'Comandă apel',
    'modal.orCall': 'sau sunați direct: <a href="tel:+37379247790" class="font-bold text-navy-900">+373 792 47 790</a>',
    'modal.successTitle': 'Cererea a fost acceptată!',
    'modal.successText': 'Vă vom suna în următoarele 5 minute.'
  }
};

function initLang() {
  const saved = (() => {
    try {
      return localStorage.getItem('ms_lang');
    } catch (e) {
      return null;
    }
  })();
  const lang = saved === 'ro' ? 'ro' : 'ru';
  applyLang(lang);

  document.querySelectorAll('.lang-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      applyLang(btn.dataset.lang);
      try {
        localStorage.setItem('ms_lang', btn.dataset.lang);
      } catch (e) {
        /* localStorage unavailable — ignore */
      }
    });
  });
}

function applyLang(lang) {
  const dict = I18N[lang] || I18N.ru;
  document.documentElement.lang = lang;

  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    if (dict[key] !== undefined) {
      el.innerHTML = dict[key];
    }
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (dict[key] !== undefined) {
      el.setAttribute('placeholder', dict[key]);
    }
  });

  document.querySelectorAll('.lang-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });

  initIcons();
}
