// ============================================================
// Ahmad Maaz — Portfolio interactions
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  const navbar = document.getElementById('navbar');
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');
  const navLinkEls = document.querySelectorAll('.nav-link');
  const progressBar = document.getElementById('progressBar');
  const yearEl = document.getElementById('year');

  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ---- mobile menu toggle ----
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('open');
      navToggle.classList.toggle('open', isOpen);
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });

    navLinkEls.forEach((link) => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        navToggle.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // ---- navbar background + scroll progress ----
  const onScroll = () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

    if (progressBar) progressBar.style.width = pct + '%';
    if (navbar) navbar.classList.toggle('scrolled', scrollTop > 10);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ---- active nav link highlighting ----
  const sections = document.querySelectorAll('main section[id]');
  const navMap = new Map();
  navLinkEls.forEach((link) => {
    const id = link.getAttribute('href').replace('#', '');
    navMap.set(id, link);
  });

  const navObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const link = navMap.get(entry.target.id);
        if (!link) return;
        if (entry.isIntersecting) {
          navLinkEls.forEach((l) => l.classList.remove('active'));
          link.classList.add('active');
        }
      });
    },
    { rootMargin: '-45% 0px -50% 0px', threshold: 0 }
  );
  sections.forEach((section) => navObserver.observe(section));

  // ---- scroll-reveal animations ----
  const revealEls = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
  );
  revealEls.forEach((el) => revealObserver.observe(el));

  // ---- testimonial fanned-deck carousel ----
  const stack = document.getElementById('testimonialStack');
  const dotsWrap = document.getElementById('testimonialDots');
  if (stack && dotsWrap) {
    const cards = Array.from(stack.querySelectorAll('.testimonial-card'));
    // order[0]=front order[1]=back1(peeks one side) order[2]=back2(peeks other side), rest hidden
    let order = cards.map((_, i) => i);
    const AUTO_MS = 6000;
    const POS_CLASSES = ['stack-front', 'stack-back1', 'stack-back2'];
    let timer = null;
    let resizeTimer = null;

    cards.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'testimonial-dot';
      dot.setAttribute('aria-label', `Show testimonial ${i + 1}`);
      dot.dataset.index = String(i);
      dotsWrap.appendChild(dot);
    });
    const dots = Array.from(dotsWrap.querySelectorAll('.testimonial-dot'));

    // measure every card's natural height at the stack's current width, so all
    // cards can share one fixed, coherent height sized to the tallest testimonial
    function syncHeight() {
      const probe = document.createElement('div');
      probe.style.position = 'absolute';
      probe.style.visibility = 'hidden';
      probe.style.pointerEvents = 'none';
      probe.style.width = stack.getBoundingClientRect().width + 'px';
      document.body.appendChild(probe);
      let max = 0;
      cards.forEach((card) => {
        const clone = card.cloneNode(true);
        clone.style.position = 'static';
        clone.classList.remove('stack-front', 'stack-back1', 'stack-back2', 'stack-hidden');
        probe.appendChild(clone);
        max = Math.max(max, clone.offsetHeight);
        probe.removeChild(clone);
      });
      document.body.removeChild(probe);
      stack.style.height = max + 'px';
    }

    function applyPositions() {
      order.forEach((cardIdx, pos) => {
        const card = cards[cardIdx];
        card.classList.remove('stack-front', 'stack-back1', 'stack-back2', 'stack-hidden');
        card.classList.add(POS_CLASSES[pos] || 'stack-hidden');
      });
      dots.forEach((dot) => {
        dot.classList.toggle('active', Number(dot.dataset.index) === order[0]);
      });
    }

    function advance() {
      order.push(order.shift());
      applyPositions();
    }

    function startAuto() {
      stopAuto();
      timer = setInterval(advance, AUTO_MS);
    }
    function stopAuto() {
      if (timer) clearInterval(timer);
      timer = null;
    }

    dots.forEach((dot) => {
      dot.addEventListener('click', () => {
        const target = Number(dot.dataset.index);
        if (target === order[0]) return;
        while (order[0] !== target) order.push(order.shift());
        applyPositions();
        startAuto();
      });
    });

    stack.addEventListener('mouseenter', stopAuto);
    stack.addEventListener('mouseleave', startAuto);
    stack.addEventListener('focusin', stopAuto);
    stack.addEventListener('focusout', startAuto);
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(syncHeight, 150);
    });

    syncHeight();
    applyPositions();
    startAuto();
  }
});
