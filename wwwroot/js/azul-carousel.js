(function(){
  const carousel = document.getElementById('azul-carousel');
  if(!carousel) return;

  carousel.style.position = 'relative';
  carousel.style.overflow = 'hidden';

  // Sequence of images
  const filenames = [
    'ia.jpg',
    'BackEnd.jpg',
    'FrontEnd.jpg',
    'AppMobile.jpg',
    'TrabalhoEquipe.jpg',
    'Python.jpg'
  ];
  const images = filenames.map(n => `/image/carrossel/${n}`);

  // Labels for overlays (for middle slots)
  const labels = {
    'ia.jpg': 'Intelig\u00EAncia Artificial',
    'BackEnd.jpg': 'Back End',
    'FrontEnd.jpg': 'Front End',
    'AppMobile.jpg': 'Aplicativos Mobile',
    'TrabalhoEquipe.jpg': 'Trabalho em Equipe',
    'Python.jpg': 'Python - Automa\u00E7\u00E3o'
  };

  // Secondary labels
  const labels2 = {
    'ia.jpg': 'RPA, Automa\u00E7\u00E3o de processo, conectar API de Modelos',
    'BackEnd.jpg': 'DotNet (5, 6, 7, 8, 9, 10) , DotNet Core (2.2 e 3.1)',
    'FrontEnd.jpg': 'Angular (7, 13, 17, 20), WebForm, MVC razor, Brazor Web Assembly',
    'AppMobile.jpg': 'Maui, Ionic e Flutter',
    'TrabalhoEquipe.jpg': 'Scrun e Kamban',
    'Python.jpg': 'Analise da dados, API, I.A.'
  };

  // Create 4 slots
  carousel.innerHTML = '';
  const slots = [];
  for(let i=0;i<4;i++){
    const slot = document.createElement('div');
    slot.className = 'azul-slot slot-' + i;

    const img = document.createElement('img');
    img.alt = `Slide slot ${i+1}`;
    img.className = 'slot-img';
    img.style.opacity = '0';
    img.style.transition = 'opacity 600ms ease';

    slot.appendChild(img);

    // Always add overlays (CSS will show/hide per breakpoint and slot)
    const overlayPrimary = document.createElement('div');
    overlayPrimary.className = 'slot-overlay-primary';
    overlayPrimary.textContent = '';

    const overlaySecondary = document.createElement('div');
    overlaySecondary.className = 'slot-overlay-secondary';
    overlaySecondary.textContent = '';

    slot.appendChild(overlayPrimary);
    slot.appendChild(overlaySecondary);

    carousel.appendChild(slot);
    slots.push({slot, img, overlayPrimary: overlayPrimary, overlaySecondary: overlaySecondary});
  }

  let startIndex = 0; // which image maps to slot 0
  let timer = null;
  const intervalMs = 4000;
  const overlayGapPercent = 0.03; // gap as percent of slot height (3%)

  function positionOverlays(slotObj){
    if(!slotObj.overlayPrimary || !slotObj.overlaySecondary) return;
    requestAnimationFrame(()=>{
      try{
        // Use slot's client dimensions (not image) as the reference
        const slotH = slotObj.slot.clientHeight;
        const slotW = slotObj.slot.clientWidth;

        // measure overlay heights using offsetHeight
        const primH = slotObj.overlayPrimary.offsetHeight;
        const secH = slotObj.overlaySecondary.offsetHeight;

        // compute gap in px from percent of slot height
        const gapPx = Math.max(6, Math.round(slotH * overlayGapPercent));

        // total stacked height in px
        const totalH = primH + gapPx + secH;

        // top offset in px so the stacked group is centered within slot
        const topPxRelative = Math.max(0, (slotH - totalH) / 2);

        // convert to percentage relative to slot height
        const topPercentPrimary = (topPxRelative / slotH) * 100;
        const topPercentSecondary = ((topPxRelative + primH + gapPx) / slotH) * 100;

        // apply percentage-based top positions so they scale with slot size
        slotObj.overlayPrimary.style.top = topPercentPrimary + '%';
        slotObj.overlaySecondary.style.top = topPercentSecondary + '%';

        // set overlay widths as percentage of slot width for consistent responsive behavior
        const desiredWidthPercent = 80;
        slotObj.overlayPrimary.style.width = desiredWidthPercent + '%';
        slotObj.overlaySecondary.style.width = desiredWidthPercent + '%';

      }catch(e){
        // ignore any measurement errors
      }
    });
  }

  function observeOverlayChanges(slotObj){
    const mo = new MutationObserver(()=> positionOverlays(slotObj));
    if(slotObj.overlayPrimary) mo.observe(slotObj.overlayPrimary, { childList:true, subtree:true, characterData:true });
    if(slotObj.overlaySecondary) mo.observe(slotObj.overlaySecondary, { childList:true, subtree:true, characterData:true });
    if(window.ResizeObserver){
      const ro = new ResizeObserver(()=> positionOverlays(slotObj));
      if(slotObj.overlayPrimary) ro.observe(slotObj.overlayPrimary);
      if(slotObj.overlaySecondary) ro.observe(slotObj.overlaySecondary);
    }
  }

  function setSlotImage(slotObj, imgSrc, filename){
    const img = slotObj.img;
    img.style.opacity = '0';
    const tmp = new Image();
    tmp.onload = function(){
      img.src = imgSrc;
      requestAnimationFrame(()=>{ img.style.opacity = '1'; positionOverlays(slotObj); });
    };
    tmp.onerror = function(){ img.src = imgSrc; img.style.opacity = '1'; positionOverlays(slotObj); };
    tmp.src = imgSrc;

    const key = filename || imgSrc.split('/').pop();
    if(slotObj.overlayPrimary) slotObj.overlayPrimary.textContent = labels[key] || '';
    if(slotObj.overlaySecondary) slotObj.overlaySecondary.textContent = labels2[key] || '';

    if(!slotObj._observing){ observeOverlayChanges(slotObj); slotObj._observing = true; }
    setTimeout(()=> positionOverlays(slotObj), 80);
  }

  function render(){
    for(let i=0;i<4;i++){
      const idx = (startIndex + i) % images.length;
      const imgSrc = images[idx];
      const filename = filenames[idx];
      setSlotImage(slots[i], imgSrc, filename);
    }
  }

  function next(){
    startIndex = (startIndex + 1) % images.length;
    render();
  }

  // initial render
  render();

  // controls (prev/next buttons expected in DOM)
  const prevBtn = document.querySelector('.carousel-prev');
  const nextBtn = document.querySelector('.carousel-next');
  if(prevBtn) prevBtn.addEventListener('click', ()=>{ startIndex = (startIndex - 1 + images.length) % images.length; render(); });
  if(nextBtn) nextBtn.addEventListener('click', ()=>{ next(); });

  const dotsWrap = document.querySelector('.carousel-dots');
  function updateDots(){ if(!dotsWrap) return; dotsWrap.innerHTML = ''; for(let i=0;i<images.length;i++){ const d = document.createElement('button'); d.className = 'carousel-dot' + (i===startIndex? ' active':''); d.setAttribute('aria-label', `Ir para slide ${i+1}`); d.onclick = ()=>{ startIndex = i; render(); }; dotsWrap.appendChild(d); } }
  updateDots();

  // keyboard navigation
  carousel.tabIndex = 0;
  carousel.addEventListener('keydown', (e)=>{ if(e.key === 'ArrowLeft'){ startIndex = (startIndex - 1 + images.length) % images.length; render(); } if(e.key === 'ArrowRight'){ next(); } });

  // start auto-rotate
  setInterval(()=>{ next(); updateDots(); }, intervalMs);

})();
