(function(){
  const toggle = document.getElementById('nav-toggle');
  const menu = document.getElementById('nav-menu');
  const logo = document.querySelector('.azul-logo');
  if(!toggle || !menu) return;

  function setState(open){
    if(open){
      menu.classList.add('open');
      toggle.setAttribute('aria-expanded','true');
    } else {
      menu.classList.remove('open');
      toggle.setAttribute('aria-expanded','false');
    }
  }

  toggle.addEventListener('click', ()=>{
    const isOpen = menu.classList.contains('open');
    setState(!isOpen);
  });

  // close when clicking outside on mobile
  document.addEventListener('click', (e)=>{
    if(!menu.classList.contains('open')) return;
    if(e.target === toggle) return;
    if(menu.contains(e.target) || toggle.contains(e.target)) return;
    setState(false);
  });

})();
