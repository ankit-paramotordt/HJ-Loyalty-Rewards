function serializeForm(form){return Object.fromEntries(new FormData(form).entries());}
async function fakeSubmit(){return new Promise(r=>setTimeout(r,700));}

function setupForm(id, okId){
  const form=document.getElementById(id);
  const ok=document.getElementById(okId);
  if(!form) return;
  form.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const payload=serializeForm(form);
    console.log(id, payload); // TODO: replace with your API call
    const btn=form.querySelector('button');
    btn.disabled=true;
    await fakeSubmit();
    btn.disabled=false;
    if(ok) ok.classList.remove('hidden');
    form.reset();
  });
}

setupForm('customer-form','customer-success');
setupForm('merchant-form','merchant-success');

(function () {
  const onReady = (fn) =>
    document.readyState !== 'loading'
      ? fn()
      : document.addEventListener('DOMContentLoaded', fn);

  onReady(() => {
    const header        = document.getElementById('siteHeader');
    const inner         = document.getElementById('headerInner');
    const menuToggle    = document.getElementById('menuToggle');
    const mobileMenu    = document.getElementById('mobileMenu');
    const mobileBackdrop= document.getElementById('mobileBackdrop');
    const iconOpen      = document.getElementById('iconOpen');
    const iconClose     = document.getElementById('iconClose');

    if (!header || !inner) return; // header markup not present

    /* ===== shrink + bg + auto hide/show on scroll ===== */
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      const scrolled = y > 8;

      header.classList.toggle('is-scrolled', scrolled);
      header.style.boxShadow = scrolled ? '0 4px 16px rgba(0,0,0,.06)' : 'none';
      header.style.background = scrolled ? 'rgba(255,255,255,.75)' : 'rgba(82,193,226,.10)';
      header.style.backdropFilter = 'blur(8px)';
      header.style.borderBottomColor = scrolled ? 'rgba(82,193,226,.30)' : 'rgba(82,193,226,.20)';

      // hide on scroll down, show on up
      header.style.transform = (y > lastY && y > 120) ? 'translateY(-100%)' : 'translateY(0)';
      lastY = y;
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    /* ===== mobile menu (toggle + focus trap + ESC/overlay) ===== */
    if (menuToggle && mobileMenu && mobileBackdrop && iconOpen && iconClose) {
      let lastFocused = null;
      const FOCUSABLE = 'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])';

      const openMenu = () => {
        lastFocused = document.activeElement;
        mobileMenu.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        menuToggle.setAttribute('aria-expanded', 'true');
        iconOpen.classList.add('hidden');
        iconClose.classList.remove('hidden');

        const first = mobileMenu.querySelector(FOCUSABLE);
        first && first.focus();
      };

      const closeMenu = () => {
        mobileMenu.classList.add('hidden');
        document.body.style.overflow = '';
        menuToggle.setAttribute('aria-expanded', 'false');
        iconOpen.classList.remove('hidden');
        iconClose.classList.add('hidden');
        lastFocused && lastFocused.focus();
      };

      menuToggle.addEventListener('click', () => {
        const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
        isOpen ? closeMenu() : openMenu();
      });

      mobileBackdrop.addEventListener('click', closeMenu);

      window.addEventListener('keydown', (e) => {
        if (menuToggle.getAttribute('aria-expanded') !== 'true') return;

        if (e.key === 'Escape') closeMenu();

        if (e.key === 'Tab') {
          const nodes = mobileMenu.querySelectorAll(FOCUSABLE);
          if (!nodes.length) return;
          const first = nodes[0];
          const last  = nodes[nodes.length - 1];

          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault(); last.focus();
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault(); first.focus();
          }
        }
      });

      // Close when any link inside the drawer is clicked
      mobileMenu.addEventListener('click', (e) => {
        if (e.target.closest('a[href]')) closeMenu();
      });
    }

    /* ===== smooth scroll with header offset ===== */
    const anchors = document.querySelectorAll('a[href^="#"]');
    const offsetScroll = (el) => {
      const y = el.getBoundingClientRect().top + window.pageYOffset - (inner.offsetHeight + 8);
      window.scrollTo({ top: y, behavior: 'smooth' });
    };
    anchors.forEach(a => {
      a.addEventListener('click', (e) => {
        const hash = a.getAttribute('href');
        if (!hash || hash === '#') return;
        const id = hash.slice(1);
        const target = document.getElementById(id);
        if (target) { e.preventDefault(); offsetScroll(target); }
      });
    });

    /* ===== scrollspy (highlight active nav item) ===== */
    const desktopLinks = document.querySelectorAll('#desktopNav .nav-link');
    const mobileLinks  = document.querySelectorAll('.nav-link-mobile');
    const linksById = {};
    [...desktopLinks, ...mobileLinks].forEach(link => {
      const id = link.getAttribute('href')?.replace('#', '');
      if (!id) return;
      (linksById[id] ||= []).push(link);
    });

    const observer = new IntersectionObserver((entries) => {
      let activeId = null;
      entries.forEach(entry => { if (entry.isIntersecting) activeId = entry.target.id; });
      if (!activeId) return;
      Object.values(linksById).flat().forEach(l => l.classList.remove('active-link'));
      (linksById[activeId] || []).forEach(l => l.classList.add('active-link'));
    }, { rootMargin: '-45% 0px -55% 0px', threshold: [0, 0.25, 0.5, 0.75, 1] });

    Object.keys(linksById).forEach(id => {
      const section = document.getElementById(id);
      if (section) observer.observe(section);
    });

    /* ===== optional: swap CTAs if user is “logged in” via localStorage ===== */
    try {
      if (localStorage.getItem('memberLoggedIn') === 'true') {
        document.querySelectorAll('#memberCta, #memberCtaMobile').forEach(el => {
          el.textContent = 'My Account';
          el.setAttribute('href', '/dashboard.html');
        });
      }
      if (localStorage.getItem('merchantLoggedIn') === 'true') {
        document.querySelectorAll('#merchantCta, #merchantCtaMobile').forEach(el => {
          el.textContent = 'Merchant Dashboard';
          el.setAttribute('href', '/merchant-dashboard.html');
        });
      }
    } catch (e) { /* ignore */ }
  });
})();