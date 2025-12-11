(function(){
  const items = [
    'Desenvolvedor Back-End',
    'Desenvolvedor Full-Stack',
    'Desenvolvedor Mobile',
    'Metodologias \u00C1geis',
    'Microservi\u00E7os',
    'API REST',
    'RabbitMQ',
    'Redis e SignalR'
  ];
  const delayMs = 10000; // 10 seconds per item (changed from 20s)
  const heroSub = document.querySelector('.hero-sub');
  if(!heroSub) return;

  // create span rotator
  const span = document.createElement('span');
  span.className = 'hero-rotator fade-in';
  span.textContent = items[0];
  heroSub.textContent = '';
  heroSub.appendChild(span);

  let idx = 0;

  function next(){
    // fade out
    span.classList.remove('fade-in');
    span.classList.add('fade-out');
    setTimeout(()=>{
      idx = (idx + 1) % items.length;
      span.textContent = items[idx];
      span.classList.remove('fade-out');
      span.classList.add('fade-in');
    }, 900); // match CSS transition
  }

  setInterval(next, delayMs);

})();
