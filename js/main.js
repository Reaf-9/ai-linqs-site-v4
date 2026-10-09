/* Shared behavior; all page content and navigation remain usable without JS. */
(() => {
  'use strict';
  const d = document;
  const LINE_URL = 'https://lin.ee/XFEkgJS';
  d.querySelectorAll('[data-line-cta]').forEach(link => {
    link.href = LINE_URL;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
  });

  const burger = d.getElementById('burger');
  const menu = d.getElementById('spMenu');
  function setMenu(open, restoreFocus = false) {
    menu.hidden = !open;
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'メニューを閉じる' : 'メニューを開く');
    if (restoreFocus) burger.focus();
    schedule();
  }
  burger.addEventListener('click', () => setMenu(menu.hidden));
  menu.addEventListener('click', event => {
    if (event.target.closest('a')) setMenu(false);
  });
  d.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !menu.hidden) setMenu(false, true);
  });
  d.addEventListener('click', event => {
    if (!menu.hidden && !event.target.closest('.site-header')) setMenu(false);
  });

  const sticky = d.getElementById('stickyCta');
  const first = d.querySelector('.hero, .page-band');
  const footer = d.querySelector('.footer');
  const contact = d.getElementById('contact');
  const line = d.getElementById('line');
  let scheduled = false;
  function inView(element) {
    if (!element) return false;
    const rect = element.getBoundingClientRect();
    return rect.top < innerHeight && rect.bottom > 0;
  }
  function update() {
    scheduled = false;
    sticky.hidden = !(innerWidth < 768 && first && first.getBoundingClientRect().bottom <= 0 && !inView(contact) && !inView(line) && !inView(footer) && menu.hidden);
    if (innerWidth >= 1200 && !menu.hidden) setMenu(false);
  }
  function schedule() {
    if (!scheduled) { scheduled = true; requestAnimationFrame(update); }
  }
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', schedule);
  burger.addEventListener('click', schedule);
  menu.addEventListener('click', schedule);
  update();

  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const heroVideo = d.querySelector('video.hero-image');
  const videoSource = heroVideo?.querySelector('source');
  const videoUrl = videoSource?.getAttribute('src');
  function syncHeroMotion() {
    if (!heroVideo) return;
    if (reducedMotion.matches) {
      heroVideo.pause();
      heroVideo.autoplay = false;
      // Reset the media to its poster, even when the preference changes mid-playback.
      videoSource.removeAttribute('src');
      heroVideo.load();
    } else {
      videoSource.setAttribute('src', videoUrl);
      heroVideo.autoplay = true;
      heroVideo.load();
      heroVideo.play().catch(() => {});
    }
  }
  syncHeroMotion();
  reducedMotion.addEventListener('change', syncHeroMotion);
  const timingVisual = d.querySelector('.timing-visual');
  if (timingVisual && 'IntersectionObserver' in window && !reducedMotion.matches) {
    timingVisual.classList.add('is-pending');
    const timingObserver = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        timingVisual.classList.remove('is-pending');
        timingObserver.disconnect();
      }
    }, { threshold: 0.05 });
    timingObserver.observe(d.getElementById('timing'));
    reducedMotion.addEventListener('change', event => {
      if (event.matches) {
        timingObserver.disconnect();
        timingVisual.classList.remove('is-pending');
      }
    });
  }
  if ('IntersectionObserver' in window && !reducedMotion.matches) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.remove('is-pending');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.05 });
    d.querySelectorAll('.section-head, .card, .case-detail, .message-block, .detail-content').forEach(element => {
      // Already visible content never flashes or vanishes on load.
      if (element.getBoundingClientRect().top >= innerHeight) {
        element.classList.add('reveal', 'is-pending');
        observer.observe(element);
      }
    });
    reducedMotion.addEventListener('change', event => {
      if (event.matches) {
        observer.disconnect();
        d.querySelectorAll('.is-pending').forEach(element => element.classList.remove('is-pending'));
      }
    });
  }
  if (/\.github\.io$/.test(location.hostname) || location.protocol === 'file:' || /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname)) {
    d.getElementById('testBadge').hidden = false;
  }
})();
