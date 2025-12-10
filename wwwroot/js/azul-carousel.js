(function(){
  // Carousel that loads specific images from /image/carrossel
  const carousel = document.getElementById('azul-carousel');
  if(!carousel) return;

  function setHeight(){
    // Attempt to compute available height between nav and footer
    const nav = document.querySelector('nav');
    const footer = document.querySelector('.azul-footer');
    const navH = nav ? nav.getBoundingClientRect().height : 0;
    const footerH = footer ? footer.getBoundingClientRect().height : 0;
    const avail = Math.max(200, window.innerHeight - navH - footerH);
    // We will set slide heights via CSS (height:70vh), but ensure carousel height matches that
    carousel.style.height = Math.max(300, Math.round(avail)) + 'px';
  }

  setHeight();
  window.addEventListener('resize', setHeight);

  carousel.style.position = 'relative';
  carousel.style.overflow = 'hidden';

  // Use user-provided sequence: left=ia, center=BackEnd, right=FrontEnd
  const filenames = [
    'ia.jpg',
    'BackEnd.jpg',
    'FrontEnd.jpg',
    'TrabalhoEquipe.jpg',
    'Python.jpg'
  ];
  const images = filenames.map(name => `/image/carrossel/${name}`);

  // Validate images but preserve original order
  const loaded = new Array(images.length).fill(null);
  let checked = 0;

  function checkDone(){
    if(checked === images.length){
      const valid = loaded.filter(Boolean);
      if(valid.length===0){
        carousel.innerHTML = '<div style="padding:1rem;color:#00293b;background:#fff;text-align:center">Nenhuma imagem encontrada em /image/carrossel</div>';
        return;
      }
      buildCarousel(valid);
    }
  }

  images.forEach((src, idx)=>{
    const img = new Image();
    img.onload = function(){ loaded[idx] = src; checked++; checkDone(); };
    img.onerror = function(){ checked++; checkDone(); };
    img.src = src;
  });

  function buildCarousel(list){
    // Create slides
    carousel.innerHTML = '';
    const track = document.createElement('div');
    track.className = 'azul-carousel-track';
    track.style.position = 'relative';
    track.style.height = '100%';

    // transition on left for smooth moves
    track.style.transition = 'left 800ms cubic-bezier(.22,.9,.36,1)';

    // labels for overlays (primary)
    const labels = {
      'ia.jpg': 'Intelig\u00EAncia Artificial',
      'BackEnd.jpg': 'Back End',
      'FrontEnd.jpg': 'Front End',
      'TrabalhoEquipe.jpg': 'Metodologia \u00C1geis',
      'Python.jpg': 'Python - Automa\u00E7\u00E3o'
    };

    // labels for second overlay (10% below)
    const labels2 = {
      'ia.jpg': 'Integra\u00E7\u00E3o de API dos modelos de IA e N8N e outros',
      'BackEnd.jpg': 'Focado na Tecnol\u00F3gia DotNet e C#',
      'FrontEnd.jpg': 'Focado em Angular e WebForms, MVC e Blazor',
      'TrabalhoEquipe.jpg': 'Habituado ao SCRUM e Kanban',
      'Python.jpg': 'Focado em Automa\u00E7\u00E3o, RPA e API'
    };

    list.forEach((src, idx)=>{
      const slide = document.createElement('div');
      slide.className = 'azul-slide loading'; // start loading
      slide.dataset.index = idx;
      slide.style.position = 'absolute';
      slide.style.top = '0';
      // store filename for CSS targeting
      slide.dataset.name = src.split('/').pop();

      // loading placeholder (shimmer)
      const placeholder = document.createElement('div');
      placeholder.className = 'loading-placeholder';
      slide.appendChild(placeholder);

      const img = document.createElement('img');
      img.src = src;
      img.alt = `Slide ${idx+1}`;
      img.style.display = 'block';
      img.style.width = '100%';
      img.style.height = '100%';
      img.style.objectFit = 'cover';
      img.onload = function(){
        // remove loading state
        slide.classList.remove('loading');
        if(placeholder && placeholder.parentNode) placeholder.parentNode.removeChild(placeholder);
        // after image load, recompute overlay positions
        computeLayout();
      };
      img.onerror = function(){
        // remove loading and show fallback background
        slide.classList.remove('loading');
        if(placeholder && placeholder.parentNode) placeholder.parentNode.removeChild(placeholder);
      };

      // primary overlay element (will be visible via CSS when slide is active)
      const overlay = document.createElement('div');
      overlay.className = 'slide-overlay';
      const baseName = slide.dataset.name || '';
      if(labels[baseName]){
        overlay.textContent = labels[baseName];
      }

      // secondary overlay element 10% below primary
      const overlay2 = document.createElement('div');
      overlay2.className = 'slide-overlay-2';
      if(labels2[baseName]){
        overlay2.textContent = labels2[baseName];
      }

      slide.appendChild(img);
      slide.appendChild(overlay);
      slide.appendChild(overlay2);
      track.appendChild(slide);
    });

    carousel.appendChild(track);

    const slides = Array.from(track.children);
    const n = slides.length;
    let centerIndex = 1; // start with BackEnd.jpg centered (index 1)

    function computeLayout(){
      // compute widths
      const totalW = carousel.clientWidth;
      const centerW = Math.round(totalW * 0.5); // 50%
      const sideW = Math.round(totalW * 0.25); // 25%

      // Build ordered array in circular order with relative positions (-k..+k)
      const arr = [];
      for(let i=0;i<n;i++){
        // relative distance from centerIndex in circular space
        let rel = (i - centerIndex) % n;
        if(rel < -n/2) rel += n;
        if(rel > n/2) rel -= n;
        arr.push({ idx: i, rel });
      }
      // Sort by rel ascending to get left-to-right order
      arr.sort((a,b)=> a.rel - b.rel);

      // compute widths for ordered array
      const widths = arr.map(item => item.rel === 0 ? centerW : sideW);

      // find position of center in ordered array
      const centerPos = arr.findIndex(item => item.rel === 0);

      // sum widths of elements before center
      let sumLeft = 0;
      for(let i=0;i<centerPos;i++) sumLeft += widths[i];

      const carouselCenter = carousel.clientWidth / 2;
      const centerLeft = carouselCenter - centerW / 2;
      const leftmost = centerLeft - sumLeft;

      // assign left positions to each ordered element
      let cursor = leftmost;
      for(let i=0;i<arr.length;i++){
        const item = arr[i];
        const w = widths[i];
        const slide = slides[item.idx];
        slide.style.width = w + 'px';
        slide.style.height = '100%';
        slide.style.left = cursor + 'px';
        slide.classList.toggle('active', item.rel === 0);

        // position overlays: primary overlay already positioned via CSS top:25%; center horizontally
        // overlay2 should be 10% below the bottom of primary overlay
        const overlay = slide.querySelector('.slide-overlay');
        const overlay2 = slide.querySelector('.slide-overlay-2');
        if(overlay && overlay2){
          const carouselRect = carousel.getBoundingClientRect();
          const primaryRect = overlay.getBoundingClientRect();
          // compute y offset relative to carousel top
          const primaryBottomRelative = primaryRect.bottom - carouselRect.top;
          const offset = Math.round(carousel.clientHeight * 0.10); // 10% of carousel height
          overlay2.style.left = '50%';
          overlay2.style.transform = 'translate(-50%,8px)';
          overlay2.style.top = (primaryBottomRelative + offset) + 'px';
        }

        cursor += w;
      }
    }

    // initial layout
    computeLayout();
    // re-run shortly after to ensure measurements correct
    setTimeout(computeLayout, 80);
    window.addEventListener('resize', computeLayout);

    // controls
    const prev = document.querySelector('.carousel-prev');
    const next = document.querySelector('.carousel-next');
    const dotsWrap = document.querySelector('.carousel-dots');

    function updateDots(){
      if(!dotsWrap) return;
      dotsWrap.innerHTML = '';
      for(let i=0;i<n;i++){
        const d = document.createElement('button');
        d.className = 'carousel-dot' + (i===centerIndex ? ' active' : '');
        d.setAttribute('aria-label', `Ir para slide ${i+1}`);
        d.onclick = ()=>{ centerIndex = i; computeLayout(); updateDots(); };
        dotsWrap.appendChild(d);
      }
    }

    if(prev) prev.onclick = ()=>{ centerIndex = (centerIndex - 1 + n) % n; computeLayout(); updateDots(); };
    if(next) next.onclick = ()=>{ centerIndex = (centerIndex + 1) % n; computeLayout(); updateDots(); };

    updateDots();

    // auto rotate every 4 seconds (4000ms) in infinite loop
    const intervalMs = 4000;
    let timer = setInterval(() => { centerIndex = (centerIndex + 1) % n; computeLayout(); updateDots(); }, intervalMs);
    carousel.addEventListener('mouseenter', () => clearInterval(timer));
    carousel.addEventListener('mouseleave', () => { clearInterval(timer); timer = setInterval(() => { centerIndex = (centerIndex + 1) % n; computeLayout(); updateDots(); }, intervalMs); });

    // expose navigation by keyboard
    carousel.tabIndex = 0;
    carousel.addEventListener('keydown', (e)=>{
      if(e.key === 'ArrowLeft') { centerIndex = (centerIndex - 1 + n) % n; computeLayout(); updateDots(); }
      if(e.key === 'ArrowRight') { centerIndex = (centerIndex + 1) % n; computeLayout(); updateDots(); }
    });
  }

})();
