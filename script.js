const formatBRL = (value) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

function initHeroTilt() {
  const hero = document.getElementById('top');
  const tilt = document.getElementById('hero-tilt');
  if (!hero || !tilt) return;

  const MAX_X = 10;
  const MAX_Y = 7;
  let frame = 0;

  const setTilt = (x, y) => {
    tilt.style.transform = `rotateX(${(-y * MAX_Y).toFixed(2)}deg) rotateY(${(x * MAX_X).toFixed(2)}deg)`;
  };

  hero.addEventListener('mousemove', (event) => {
    if (frame) return;

    const rect = hero.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;

    frame = requestAnimationFrame(() => {
      frame = 0;
      setTilt(x, y);
    });
  });

  hero.addEventListener('mouseleave', () => setTilt(0, 0));
}

function initVideo() {
  const player = document.getElementById('video-player');
  const poster = document.getElementById('video-poster');
  const playButton = document.getElementById('video-play');
  const errorMessage = document.getElementById('video-error');
  if (!player || !poster || !playButton) return;

  playButton.addEventListener('click', () => {
    errorMessage.hidden = true;
    poster.hidden = true;
    player.hidden = false;
    player.play().catch(() => {});
  });

  player.addEventListener('error', () => {
    player.hidden = true;
    poster.hidden = false;
    errorMessage.hidden = false;
  });
}

function initRevealText() {
  const section = document.getElementById('desafio');
  const text = document.getElementById('reveal-text');
  if (!section || !text) return;

  const words = text.textContent.trim().split(/\s+/);
  const highlightFrom = words.indexOf(text.dataset.highlight);

  text.setAttribute('aria-label', words.join(' '));
  text.textContent = '';

  const spans = words.map((word, index) => {
    const span = document.createElement('span');
    span.className = 'word' + (highlightFrom >= 0 && index >= highlightFrom ? ' highlight' : '');
    span.textContent = word;
    span.setAttribute('aria-hidden', 'true');
    text.appendChild(span);
    return span;
  });

  let frame = 0;

  const update = () => {
    frame = 0;

    const viewport = window.innerHeight;
    const rect = section.getBoundingClientRect();
    const span = Math.max(1, rect.height - viewport * 0.5);
    const progress = Math.min(1, Math.max(0, (viewport * 0.55 - rect.top) / span));
    const visible = progress * spans.length * 1.08;

    spans.forEach((word, index) => word.classList.toggle('on', index < visible));
  };

  const requestUpdate = () => {
    if (!frame) frame = requestAnimationFrame(update);
  };

  window.addEventListener('scroll', requestUpdate, { passive: true });
  window.addEventListener('resize', requestUpdate);
  update();
}

function initMarquee() {
  document.querySelectorAll('.marquee-row').forEach((row) => {
    const items = row.dataset.items.split('|');
    const start = Number(row.dataset.start);

    // a lista é repetida para o loop de -50% ficar contínuo
    items.concat(items).forEach((label, index) => {
      const chip = document.createElement('span');
      const number = document.createElement('i');

      chip.className = 'chip';
      number.textContent = String((index % items.length) + start).padStart(2, '0');
      chip.append(number, label);

      if (index >= items.length) chip.setAttribute('aria-hidden', 'true');
      row.appendChild(chip);
    });
  });
}

function initSimulator() {
  const MIN_YEARS = 1;
  const MAX_YEARS = 7;

  const monthlyInput = document.getElementById('sim-mensalidade');
  const discountInput = document.getElementById('sim-bolsa');
  if (!monthlyInput || !discountInput) return;

  const el = {
    monthlyOut: document.getElementById('sim-mensalidade-out'),
    discountOut: document.getElementById('sim-bolsa-out'),
    discountText: document.getElementById('sim-bolsa-txt'),
    months: document.getElementById('sim-meses'),
    years: document.getElementById('sim-anos'),
    totalWithout: document.getElementById('sim-total-sem'),
    monthlyWith: document.getElementById('sim-mensal-com'),
    totalWith: document.getElementById('sim-total-com'),
    savings: document.getElementById('sim-economia'),
    less: document.getElementById('sim-menos'),
    more: document.getElementById('sim-mais')
  };

  const state = { years: 4 };

  const fillPercent = (input) =>
    ((input.value - input.min) / (input.max - input.min)) * 100 + '%';

  const render = () => {
    const monthly = Number(monthlyInput.value);
    const discount = Number(discountInput.value);
    const months = state.years * 12;

    const monthlyWith = monthly * (1 - discount / 100);
    const totalWithout = monthly * months;
    const totalWith = monthlyWith * months;

    monthlyInput.style.setProperty('--pct', fillPercent(monthlyInput));
    discountInput.style.setProperty('--pct', fillPercent(discountInput));

    el.monthlyOut.textContent = formatBRL(monthly);
    el.discountOut.textContent = discount + '%';
    el.discountText.textContent = discount + '%';
    el.months.textContent = months + ' meses';
    el.years.textContent = state.years + (state.years === 1 ? ' ano' : ' anos');

    el.totalWithout.textContent = formatBRL(totalWithout);
    el.monthlyWith.textContent = formatBRL(monthlyWith);
    el.totalWith.textContent = formatBRL(totalWith);

    el.savings.hidden = discount === 0;
    el.savings.textContent = 'Economia de ' + formatBRL(totalWithout - totalWith);

    el.less.disabled = state.years <= MIN_YEARS;
    el.more.disabled = state.years >= MAX_YEARS;
  };

  const changeYears = (step) => {
    state.years = Math.min(MAX_YEARS, Math.max(MIN_YEARS, state.years + step));
    render();
  };

  monthlyInput.addEventListener('input', render);
  discountInput.addEventListener('input', render);
  el.less.addEventListener('click', () => changeYears(-1));
  el.more.addEventListener('click', () => changeYears(1));

  render();
}

function initModal() {
  const modal = document.getElementById('coming-soon');
  if (!modal) return;

  document.querySelectorAll('[data-open-modal]').forEach((trigger) => {
    trigger.addEventListener('click', (event) => {
      event.preventDefault();
      modal.showModal();
    });
  });

  modal.querySelectorAll('[data-close-modal]').forEach((button) => {
    button.addEventListener('click', () => modal.close());
  });

  modal.addEventListener('click', (event) => {
    if (event.target === modal) modal.close();
  });
}

initHeroTilt();
initVideo();
initRevealText();
initMarquee();
initSimulator();
initModal();
