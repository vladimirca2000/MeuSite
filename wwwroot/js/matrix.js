// Implementação da chuva estilo Matrix (sem dependências externas)
(function () {
  const canvas = document.getElementById('matrix-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  // Caracteres: katakana + ASCII + números para um visual mais "Matrix"
  const chars = (
    'ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜｦﾝ' +
    'ABCDEFGHIJKLMNOPQRSTUVWXYZ' +
    'abcdefghijklmnopqrstuvwxyz' +
    '0123456789@#$%^&*()-+=<>?/\\|'
  ).split('');

  let width = 0;
  let height = 0;
  let columns = 0;
  let drops = [];
  let animationId = null;
  let fontSize = 18; // base font size in CSS pixels

  // Configura cores que se aproximam do filme: fundo escuro, tons de verde
  const bgFade = 0.05; // opacidade do retângulo de desvanecimento (traço de rastro)
  const baseGreen = [0, 255, 65]; // verde clássico
  const bright = '#ddffdd';

  // Ajusta canvas para DPI e tamanhos
  function resize() {
    const dpr = window.devicePixelRatio || 1;
    width = Math.max(window.innerWidth, 300);
    height = Math.max(window.innerHeight, 200);
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // adapt font size based on width to keep density similar em telas grandes
    fontSize = Math.max(12, Math.floor(Math.min(24, width / 64)));
    ctx.font = fontSize + 'px monospace';

    columns = Math.floor(width / fontSize) + 1;
    drops = new Array(columns).fill(0).map(() => Math.floor(Math.random() * Math.floor(height / fontSize)));
  }

  function randChoice(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function draw() {
    // Fundo semi-transparente para efeito de rastro
    ctx.fillStyle = 'rgba(0, 0, 0, ' + bgFade + ')';
    ctx.fillRect(0, 0, width, height);

    for (let i = 0; i < columns; i++) {
      const x = i * fontSize;
      const y = drops[i] * fontSize;

      // Escolha do caractere e cor
      const ch = randChoice(chars);

      // O caractere líder é mais brilhante
      ctx.fillStyle = i % 6 === 0 ? bright : `rgba(${baseGreen[0]}, ${baseGreen[1]}, ${baseGreen[2]}, ${Math.random() * 0.6 + 0.35})`;
      ctx.fillText(ch, x, y);

      // mover para baixo com velocidade variável
      drops[i]++;

      // reinicia com probabilidade ao sair da tela para variar o efeito
      if (drops[i] * fontSize > height && Math.random() > 0.975) {
        drops[i] = 0;
      }
    }

    animationId = requestAnimationFrame(draw);
  }

  // Inicializa e trata resize
  function start() {
    cancelAnimationFrame(animationId);
    resize();
    // preenche o fundo totalmente preto inicialmente
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, width, height);
    animationId = requestAnimationFrame(draw);
  }

  window.addEventListener('resize', () => {
    // debounce simples
    clearTimeout(window.__matrixResizeTimeout);
    window.__matrixResizeTimeout = setTimeout(() => {
      start();
    }, 120);
  });

  // Try to start after page load; if already loaded, start immediately
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    start();
  } else {
    window.addEventListener('DOMContentLoaded', start);
  }

  // Expose control for debugging (opcional)
  window.__matrix = {
    start: start,
    stop: () => cancelAnimationFrame(animationId)
  };
})();

