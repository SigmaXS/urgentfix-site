// =========================================================
// UrgentFix — интерактивная логика сайта
// =========================================================

document.addEventListener('DOMContentLoaded', () => {
  initIcons();
  initHeaderScroll();
  initMobileMenu();
  initSmoothAnchors();
  initPriceTabs();
  initServiceTabs();
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
   Вкладки услуг (Котлы / Сантехника)
--------------------------------------------------------- */
function initServiceTabs() {
  const tabs = document.querySelectorAll('.service-tab');
  const panels = document.querySelectorAll('.service-panel');
  if (!tabs.length) return;

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.serviceTab;

      tabs.forEach((t) => t.classList.toggle('active', t === tab));
      panels.forEach((p) => p.classList.toggle('hidden', p.dataset.servicePanel !== target));
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
const WA_NUMBER = '37378293919';

const WA_LABELS = {
  ru: { title: 'Заявка с сайта UrgentFix:', name: 'Имя:', phone: 'Телефон:', service: 'Услуга:', desc: 'Проблема:', notSpecified: 'не указано' },
  ro: { title: 'Cerere de pe site-ul UrgentFix:', name: 'Nume:', phone: 'Telefon:', service: 'Serviciu:', desc: 'Problema:', notSpecified: 'nespecificat' }
};

function currentWaLabels() {
  const lang = document.documentElement.lang === 'ro' ? 'ro' : 'ru';
  return WA_LABELS[lang];
}

function initForms() {
  const requestForm = document.getElementById('request-form');
  const requestSuccess = document.getElementById('request-success');
  const requestAgainBtn = document.getElementById('request-success-again');

  if (requestForm && requestSuccess) {
    requestForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const L = currentWaLabels();
      const name = document.getElementById('fName').value.trim();
      const phone = document.getElementById('fPhone').value.trim();
      const service = document.getElementById('fService').value;
      const desc = document.getElementById('fDesc').value.trim();

      const lines = [L.title];
      lines.push(`${L.name} ${name || '—'}`);
      lines.push(`${L.phone} ${phone || L.notSpecified}`);
      lines.push(`${L.service} ${service}`);
      if (desc) lines.push(`${L.desc} ${desc}`);

      window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(lines.join('\n'))}`, '_blank');

      requestForm.classList.add('hidden');
      requestSuccess.classList.remove('hidden');
      initIcons();
    });
  }

  if (requestAgainBtn && requestForm && requestSuccess) {
    requestAgainBtn.addEventListener('click', () => {
      requestForm.reset();
      requestSuccess.classList.add('hidden');
      requestForm.classList.remove('hidden');
    });
  }

  const modalForm = document.getElementById('modal-form');
  const modalSuccess = document.getElementById('modal-success');
  if (modalForm && modalSuccess) {
    modalForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const L = currentWaLabels();
      const name = document.getElementById('mName').value.trim();
      const phone = document.getElementById('mPhone').value.trim();

      const lines = [L.title];
      lines.push(`${L.name} ${name || '—'}`);
      lines.push(`${L.phone} ${phone || L.notSpecified}`);

      window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(lines.join('\n'))}`, '_blank');

      modalForm.classList.add('hidden');
      modalSuccess.classList.remove('hidden');
      initIcons();
    });
  }

  // Сбрасываем модалку к состоянию формы при каждом открытии
  document.querySelectorAll('[data-open-modal]').forEach((el) => {
    el.addEventListener('click', () => {
      if (modalForm && modalSuccess) {
        modalForm.classList.remove('hidden');
        modalSuccess.classList.add('hidden');
        modalForm.reset();
      }
    });
  });
}

/* ---------------------------------------------------------
   Переключатель языка RU / RO
--------------------------------------------------------- */
const I18N = {
  ru: {
    'logo.tag': 'Мастер на все руки',
    'nav.services': 'Услуги',
    'nav.prices': 'Цены',
    'nav.calc': 'Заявка',
    'nav.reviews': 'Отзывы',
    'nav.contacts': 'Контакты',
    'nav.emergency': 'Срочный вызов',
    'hero.badge': 'Скорая помощь для вашего дома',
    'hero.title': 'Срочный ремонт <span class="text-transparent bg-clip-text bg-gradient-to-r from-aqua-400 to-aqua-500">газовых котлов</span> и сантехники в Кишинёве 24/7',
    'hero.subtitle': 'Остались без тепла? Мы уже в пути. Оставьте заявку — устраним поломку за один визит, с гарантией.',
    'hero.cta1': 'Вызвать мастера срочно',
    'hero.cta2': 'Рассчитать стоимость',
    'hero.orWrite': 'или напишите:',
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
    'services.title': 'Ремонт котлов и сантехника под ключ',
    'services.subtitle': 'Главное направление — газовые котлы. Плюс все мелкие сантехнические работы по дому.',
    'services.tabBoilers': 'Котлы',
    'services.tabPlumbing': 'Сантехника',
    'services.boilersTitle': 'Решаем любые проблемы с газовым котлом',
    'services.boilersSubtitle': 'Независимо от марки и модели. Диагностика, чистка, ремонт и профилактика.',
    'services.b1': 'Котёл не запускается или запускается с трудом',
    'services.b2': 'Ошибка давления, пламя не удерживается',
    'services.b3': 'Горячая вода с задержкой или без давления',
    'services.b4': 'Профилактика и профессиональная чистка',
    'services.b5': 'Котёл не греет воду, радиаторы холодные',
    'services.b6': 'Посторонние звуки во время работы',
    'services.b7': 'Утечки и проблемы с давлением в системе',
    'services.b8': 'Ремонт и обслуживание всех марок и моделей',
    'services.boilersCta': 'Вызвать мастера по котлу',
    'services.plumbingTitle': 'Быстро решаем сантехнические задачи',
    'services.plumbingSubtitle': 'В ванной, на кухне или в любой другой части дома — аккуратно и с гарантией.',
    'services.p1': 'Ремонт и замена кранов, смесителей',
    'services.p2': 'Капающий кран, протечки под раковиной',
    'services.p3': 'Замена унитаза, смесителя, душевой кабины',
    'services.p4': 'Протечки в трубах',
    'services.p5': 'Низкое давление воды в системе',
    'services.p6': 'Установка бойлера, фильтра, гибких подводок',
    'services.p7': 'Мелкий ремонт по дому («муж на час»)',
    'services.plumbingCta': 'Вызвать мастера',
    'prices.eyebrow': 'Прайс-лист',
    'prices.title': 'Ориентировочные цены на услуги',
    'prices.subtitle': 'Точная стоимость озвучивается мастером на месте после осмотра.',
    'prices.tab1': 'Котлы',
    'prices.tab2': 'Сантехника',
    'prices.tab3': 'Душевые кабины',
    'prices.h1': 'Диагностика котла',
    'prices.h2': 'Установка бойлера',
    'prices.h3': 'Чистка теплообменника',
    'prices.h4': 'Монтаж системы отопления (за точку)',
    'prices.h5': 'Ремонт платы управления',
    'prices.s1': 'Установка унитаза',
    'prices.s2': 'Установка раковины / смесителя',
    'prices.s3': 'Замена труб (за метр)',
    'prices.s4': 'Устранение протечки',
    'prices.sh1': 'Монтаж душевой кабины',
    'prices.sh2': 'Герметизация швов',
    'prices.sh3': 'Подключение гидромассажа',
    'prices.note': '* Итоговая стоимость зависит от объёма работ и материалов. Выезд и диагностика — бесплатно при заказе работ.',
    'calc.eyebrow': 'Быстрая заявка',
    'calc.title': 'Опишите проблему — назовём цену за 5 минут',
    'calc.subtitle': 'Заполните форму, и мастер перезвонит вам в течение 5 минут для уточнения деталей и стоимости.',
    'calc.nameLabel': 'Ваше имя',
    'calc.namePlaceholder': 'Как к вам обращаться?',
    'calc.phoneLabel': 'Телефон',
    'calc.serviceLabel': 'Тип услуги',
    'calc.opt1': 'Аварийный выезд (протечка)',
    'calc.opt2': 'Ремонт / чистка котла',
    'calc.opt3': 'Сантехнические работы',
    'calc.opt4': 'Душевая кабина',
    'calc.opt5': 'Другое / не знаю',
    'calc.descLabel': 'Опишите проблему',
    'calc.descPlaceholder': 'Например: котёл не держит давление, нужна диагностика...',
    'calc.submit': 'Отправить заявку',
    'calc.privacy': 'Нажимая кнопку, вы соглашаетесь с обработкой персональных данных.',
    'calc.successTitle': 'Заявка отправлена в WhatsApp!',
    'calc.successText': 'Если чат не открылся автоматически — позвоните нам напрямую. Мы свяжемся с вами в течение 5 минут.',
    'calc.newRequest': 'Оставить ещё одну заявку',
    'calc.reviewPrompt': 'Уже обращались к нам раньше? Будем благодарны за отзыв о нашей работе!',
    'calc.reviewBtn': 'Оставить отзыв в Google',
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
    'footer.copy': '© 2026 UrgentFix. Все права защищены.',
    'sticky.call': 'Позвонить',
    'sticky.emergency': 'Срочный вызов',
    'modal.title': 'Заказать обратный звонок',
    'modal.text': 'Оставьте номер — перезвоним в течение 5 минут и вышлем мастера.',
    'modal.namePlaceholder': 'Ваше имя',
    'modal.submit': 'Заказать звонок',
    'modal.orCall': 'или звоните напрямую: <a href="tel:+37378293919" class="font-bold text-navy-900">+373 78 293 919</a>',
    'modal.successTitle': 'Заявка отправлена в WhatsApp!',
    'modal.successText': 'Если чат не открылся — позвоните нам напрямую, мы уже ждём.'
  },
  ro: {
    'logo.tag': 'Meșter bun la toate',
    'nav.services': 'Servicii',
    'nav.prices': 'Prețuri',
    'nav.calc': 'Cerere',
    'nav.reviews': 'Recenzii',
    'nav.contacts': 'Contacte',
    'nav.emergency': 'Apel urgent',
    'hero.badge': 'Ajutor rapid pentru casa ta',
    'hero.title': 'Reparație urgentă a <span class="text-transparent bg-clip-text bg-gradient-to-r from-aqua-400 to-aqua-500">centralelor pe gaz</span> și instalații sanitare în Chișinău 24/7',
    'hero.subtitle': 'Ați rămas fără căldură? Suntem deja pe drum. Trimiteți cererea — rezolvăm defecțiunea într-o singură vizită, cu garanție.',
    'hero.cta1': 'Cheamă meșterul urgent',
    'hero.cta2': 'Calculează costul',
    'hero.orWrite': 'sau scrieți-ne:',
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
    'services.title': 'Reparația centralelor și instalații sanitare la cheie',
    'services.subtitle': 'Direcția principală — centrale pe gaz. Plus toate lucrările sanitare mici din casă.',
    'services.tabBoilers': 'Centrale',
    'services.tabPlumbing': 'Sanitare',
    'services.boilersTitle': 'Rezolvăm orice problemă cu centrala pe gaz',
    'services.boilersSubtitle': 'Indiferent de marcă și model. Diagnosticare, curățare, reparație și profilaxie.',
    'services.b1': 'Centrala nu pornește sau pornește greu',
    'services.b2': 'Eroare de presiune, flacăra nu se menține',
    'services.b3': 'Apă caldă cu întârziere sau fără presiune',
    'services.b4': 'Este necesară profilaxia sau curățarea profesională',
    'services.b5': 'Centrala nu încălzește apa, radiatoarele rămân reci',
    'services.b6': 'Zgomote străine în timpul funcționării',
    'services.b7': 'Scurgeri și probleme de presiune în sistem',
    'services.b8': 'Reparație și mentenanță pentru toate mărcile și modelele',
    'services.boilersCta': 'Cheamă meșterul pentru centrală',
    'services.plumbingTitle': 'Rezolvăm rapid sarcinile sanitare',
    'services.plumbingSubtitle': 'În baie, bucătărie sau orice altă parte a casei — cu grijă și garanție.',
    'services.p1': 'Reparație și înlocuire robinete, baterii',
    'services.p2': 'Robinet care picură, scurgeri sub chiuvetă',
    'services.p3': 'Înlocuirea vasului de toaletă, bateriei, cabinei de duș',
    'services.p4': 'Scurgeri în țevi',
    'services.p5': 'Presiune scăzută a apei în sistem',
    'services.p6': 'Montarea boilerului, filtrului, racordurilor flexibile',
    'services.p7': 'Reparații mici casnice („bărbat la oră”)',
    'services.plumbingCta': 'Cheamă meșterul',
    'prices.eyebrow': 'Lista de prețuri',
    'prices.title': 'Prețuri orientative pentru servicii',
    'prices.subtitle': 'Costul exact este anunțat de meșter la fața locului după inspecție.',
    'prices.tab1': 'Centrale',
    'prices.tab2': 'Sanitare',
    'prices.tab3': 'Cabine de duș',
    'prices.h1': 'Diagnosticarea centralei',
    'prices.h2': 'Montarea boilerului',
    'prices.h3': 'Curățarea schimbătorului de căldură',
    'prices.h4': 'Montarea sistemului de încălzire (per punct)',
    'prices.h5': 'Reparația plăcii de comandă',
    'prices.s1': 'Montarea vasului de toaletă',
    'prices.s2': 'Montarea chiuvetei / bateriei',
    'prices.s3': 'Înlocuirea țevilor (per metru)',
    'prices.s4': 'Eliminarea scurgerii',
    'prices.sh1': 'Montarea cabinei de duș',
    'prices.sh2': 'Etanșarea rosturilor',
    'prices.sh3': 'Conectarea hidromasajului',
    'prices.note': '* Costul final depinde de volumul lucrărilor și materiale. Deplasarea și diagnosticarea sunt gratuite la comandarea lucrărilor.',
    'calc.eyebrow': 'Cerere rapidă',
    'calc.title': 'Descrieți problema — anunțăm prețul în 5 minute',
    'calc.subtitle': 'Completați formularul, iar meșterul vă va suna în 5 minute pentru detalii și cost.',
    'calc.nameLabel': 'Numele dvs.',
    'calc.namePlaceholder': 'Cum să vă adresăm?',
    'calc.phoneLabel': 'Telefon',
    'calc.serviceLabel': 'Tipul serviciului',
    'calc.opt1': 'Deplasare de urgență (scurgere)',
    'calc.opt2': 'Reparație / curățare centrală',
    'calc.opt3': 'Lucrări sanitare',
    'calc.opt4': 'Cabină de duș',
    'calc.opt5': 'Altceva / nu știu',
    'calc.descLabel': 'Descrieți problema',
    'calc.descPlaceholder': 'De exemplu: centrala nu ține presiunea, e nevoie de diagnosticare...',
    'calc.submit': 'Trimite cererea',
    'calc.privacy': 'Apăsând butonul, sunteți de acord cu prelucrarea datelor personale.',
    'calc.successTitle': 'Cererea a fost trimisă pe WhatsApp!',
    'calc.successText': 'Dacă chat-ul nu s-a deschis automat — sunați-ne direct. Vă contactăm în 5 minute.',
    'calc.newRequest': 'Trimite încă o cerere',
    'calc.reviewPrompt': 'Ați mai apelat la noi înainte? Vă vom fi recunoscători pentru o recenzie!',
    'calc.reviewBtn': 'Lasă o recenzie pe Google',
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
    'footer.copy': '© 2026 UrgentFix. Toate drepturile rezervate.',
    'sticky.call': 'Sună',
    'sticky.emergency': 'Apel urgent',
    'modal.title': 'Comandă un apel',
    'modal.text': 'Lăsați numărul — vă sunăm în 5 minute și trimitem meșterul.',
    'modal.namePlaceholder': 'Numele dvs.',
    'modal.submit': 'Comandă apel',
    'modal.orCall': 'sau sunați direct: <a href="tel:+37378293919" class="font-bold text-navy-900">+373 78 293 919</a>',
    'modal.successTitle': 'Cererea a fost trimisă pe WhatsApp!',
    'modal.successText': 'Dacă chat-ul nu s-a deschis — sunați-ne direct, vă așteptăm.'
  }
};

function detectLang() {
  // Приоритет — язык, который пользователь выбрал вручную раньше
  try {
    const saved = localStorage.getItem('ms_lang');
    if (saved === 'ru' || saved === 'ro') return saved;
  } catch (e) {
    /* localStorage unavailable — ignore */
  }

  // Иначе — по языку телефона/браузера: русский считаем "ru",
  // всё остальное (ro, en и т.д.) по умолчанию открываем на румынском
  const browserLangs = navigator.languages && navigator.languages.length
    ? navigator.languages
    : [navigator.language || navigator.userLanguage || ''];

  const isRussian = browserLangs.some((l) => (l || '').toLowerCase().startsWith('ru'));
  return isRussian ? 'ru' : 'ro';
}

function initLang() {
  const lang = detectLang();
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
