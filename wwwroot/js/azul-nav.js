(function(){
  const toggle = document.getElementById('nav-toggle');
  const menu = document.getElementById('nav-menu');
  const logo = document.querySelector('.azul-logo');
  const nav = document.querySelector('nav');
  if(!menu) return;

  function setState(open){
    if(open){
      menu.classList.add('open');
      if(toggle) toggle.setAttribute('aria-expanded','true');
    } else {
      menu.classList.remove('open');
      if(toggle) toggle.setAttribute('aria-expanded','false');
    }
  }

  if(toggle){
    toggle.addEventListener('click', ()=>{
      const isOpen = menu.classList.contains('open');
      setState(!isOpen);
    });
  }

  // close when clicking outside on mobile
  document.addEventListener('click', (e)=>{
    if(!menu.classList.contains('open')) return;
    if(toggle && e.target === toggle) return;
    if(menu.contains(e.target) || (toggle && toggle.contains(e.target))) return;
    setState(false);
  });

  // smooth scrolling for anchor links inside the menu (and logo)
  function navHeight(){
    try{ const r = nav ? nav.getBoundingClientRect().height : 0; return Math.round(r); }catch(e){return 0}
  }

  function handleAnchorClick(e){
    const a = e.currentTarget;
    const href = a.getAttribute('href') || '';
    // support links like '/azul#sobre' or '#sobre'
    const hashIndex = href.indexOf('#');
    if(hashIndex === -1) return; // not an anchor
    const id = href.slice(hashIndex+1);
    if(!id) return;
    const target = document.getElementById(id);
    if(!target) return;

    e.preventDefault();
    // close menu on mobile
    setState(false);

    const top = target.getBoundingClientRect().top + window.scrollY - navHeight() - 8; // small gap
    window.scrollTo({ top, behavior: 'smooth' });
  }

  // attach to menu links
  const links = Array.from(menu.querySelectorAll('a[href*="#"]'));
  links.forEach(l => l.addEventListener('click', handleAnchorClick));

  // also attach to logo link if it contains a hash
  const logoLink = document.querySelector('.azul-logo-link');
  if(logoLink && logoLink.getAttribute('href') && logoLink.getAttribute('href').includes('#')){
    logoLink.addEventListener('click', function(e){
      // delegate to handler - find first anchor with same href
      handleAnchorClick.call(this, e);
    });
  }

})();
