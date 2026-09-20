(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const menuButton = document.querySelector('.menu-toggle');
  const menu = document.querySelector('.menu-panel');
  const journey = document.querySelector('.journey');
  const progressPath = document.querySelector('.path-progress');
  const stages = [...document.querySelectorAll('.stage')];
  const reveals = [...document.querySelectorAll('.stage, .closing')];

  const closeMenu = () => {
    menuButton.setAttribute('aria-expanded', 'false');
    menu.setAttribute('aria-hidden', 'true');
    menu.classList.remove('is-open');
  };

  menuButton.addEventListener('click', () => {
    const open = menuButton.getAttribute('aria-expanded') === 'true';
    menuButton.setAttribute('aria-expanded', String(!open));
    menu.setAttribute('aria-hidden', String(open));
    menu.classList.toggle('is-open', !open);
  });

  menu.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));

  if (reduceMotion) {
    reveals.forEach((item) => item.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      entry.target.classList.toggle('is-visible', entry.isIntersecting && entry.intersectionRatio >= .12);
    });
  }, { rootMargin: '-7% 0px -9% 0px', threshold: [0, .12, .3] });

  reveals.forEach((item) => observer.observe(item));

  const pathLength = progressPath.getTotalLength();
  progressPath.style.strokeDasharray = pathLength;
  progressPath.style.strokeDashoffset = pathLength;

  let ticking = false;
  const updatePath = () => {
    const rect = journey.getBoundingClientRect();
    const start = window.innerHeight * .72;
    const travel = rect.height + window.innerHeight * .28;
    const progress = Math.min(1, Math.max(0, (start - rect.top) / travel));
    progressPath.style.strokeDashoffset = String(pathLength * (1 - progress));
    ticking = false;
  };

  const requestPathUpdate = () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(updatePath);
    }
  };

  updatePath();
  window.addEventListener('scroll', requestPathUpdate, { passive: true });
  window.addEventListener('resize', requestPathUpdate);

  stages.forEach((stage) => {
    stage.addEventListener('pointermove', (event) => {
      if (!window.matchMedia('(pointer: fine)').matches) return;
      const art = stage.querySelector('.stage-art');
      const rect = stage.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width - .5) * 5;
      const y = ((event.clientY - rect.top) / rect.height - .5) * 4;
      art.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    });
    stage.addEventListener('pointerleave', () => {
      stage.querySelector('.stage-art').style.transform = '';
    });
  });
})();
