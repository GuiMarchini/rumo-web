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

function initQuiz() {
  const card = document.getElementById('quiz');
  if (!card) return;

  const POINTS_PER_ANSWER = 3;

  const C = {
    cc: 'Ciência da Computação',
    si: 'Sistemas de Informação',
    adm: 'Administração',
    dir: 'Direito',
    med: 'Medicina',
    eciv: 'Engenharia Civil',
    eprod: 'Engenharia de Produção',
    psi: 'Psicologia',
    enf: 'Enfermagem',
    arq: 'Arquitetura e Urbanismo'
  };

  const QUESTIONS = [
    { text: 'Qual afirmação mais combina com você?', options: [
      ['Gosto de resolver problemas lógicos e criar soluções passo a passo', C.cc],
      ['Tenho facilidade em organizar dados e integrar sistemas', C.si],
      ['Gosto de liderar pessoas e tomar decisões estratégicas', C.adm],
      ['Tenho interesse em leis, normas e defesa de direitos', C.dir]
    ] },
    { text: 'Em um trabalho em grupo, qual função você assume naturalmente?', options: [
      ['Desenvolvo a parte técnica ou o algoritmo da solução', C.cc],
      ['Cuido da integração entre as ferramentas e os dados do projeto', C.si],
      ['Organizo prazos, tarefas e a comunicação entre a equipe', C.adm],
      ['Reviso regras, contratos e responsabilidades do projeto', C.dir]
    ] },
    { text: 'O que mais te motivaria numa carreira?', options: [
      ['Criar tecnologia que resolva problemas complexos', C.cc],
      ['Unir tecnologia e gestão para melhorar processos de negócio', C.si],
      ['Empreender e conduzir decisões estratégicas', C.adm],
      ['Atuar em causas justas e na resolução de conflitos', C.dir]
    ] },
    { text: 'Qual tema desperta mais sua curiosidade?', options: [
      ['Inteligência artificial e desenvolvimento de software', C.cc],
      ['Como a tecnologia impulsiona o crescimento das empresas', C.si],
      ['Estratégias de negócio e empreendedorismo', C.adm],
      ['Casos jurídicos e o funcionamento das leis', C.dir]
    ] },
    { text: 'Qual atividade te traria mais satisfação profissional?', options: [
      ['Cuidar da saúde e do bem-estar de outras pessoas', C.med],
      ['Projetar e acompanhar a construção de uma obra', C.eciv],
      ['Otimizar processos e a produtividade de uma linha de produção', C.eprod],
      ['Compreender o comportamento humano e apoiar emocionalmente alguém', C.psi]
    ] },
    { text: 'No seu tempo livre, você prefere se aprofundar em:', options: [
      ['Assuntos relacionados ao corpo humano e à saúde', C.med],
      ['Estruturas, cálculos e projetos de construção', C.eciv],
      ['Formas de melhorar processos e reduzir desperdícios', C.eprod],
      ['Comportamento humano e relações interpessoais', C.psi]
    ] },
    { text: 'Que tipo de impacto você gostaria de gerar no mundo?', options: [
      ['Contribuir para salvar ou melhorar vidas', C.med],
      ['Construir cidades e espaços mais funcionais', C.eciv],
      ['Tornar indústrias e processos mais eficientes', C.eprod],
      ['Melhorar a saúde mental e o bem-estar das pessoas', C.psi]
    ] },
    { text: 'Qual conteúdo você assistiria com mais interesse?', options: [
      ['Avanços científicos na área da medicina', C.med],
      ['Documentário sobre grandes obras de engenharia', C.eciv],
      ['Como indústrias produzem em larga escala', C.eprod],
      ['Como funciona a mente e o comportamento humano', C.psi]
    ] },
    { text: 'Qual rotina de trabalho combina mais com seu perfil?', options: [
      ['Cuidar diretamente de pacientes no dia a dia', C.enf],
      ['Criar espaços esteticamente agradáveis e funcionais', C.arq],
      ['Desenvolver soluções e sistemas de software', C.cc],
      ['Gerenciar a infraestrutura de tecnologia de uma empresa', C.si]
    ] },
    { text: 'O que você mais valoriza em uma profissão?', options: [
      ['O cuidado direto e humano com as pessoas', C.enf],
      ['A criatividade e a estética aplicadas ao espaço', C.arq],
      ['A inovação e o raciocínio tecnológico', C.cc],
      ['A organização e a eficiência de processos digitais', C.si]
    ] },
    { text: 'Qual área de estudo mais te atrai?', options: [
      ['Biologia e ciências da saúde', C.enf],
      ['Artes, desenho e representação espacial', C.arq],
      ['Matemática, lógica e algoritmos', C.cc],
      ['Informática e infraestrutura de sistemas', C.si]
    ] },
    { text: 'Se pudesse mudar algo no mundo, você escolheria:', options: [
      ['Melhorar o acesso e a qualidade da saúde pública', C.enf],
      ['Melhorar o planejamento dos espaços urbanos', C.arq],
      ['Criar tecnologia que facilite a vida das pessoas', C.cc],
      ['Digitalizar e simplificar processos manuais', C.si]
    ] },
    { text: 'Você se identifica mais com o perfil de quem:', options: [
      ['Gerencia uma equipe ou conduz um negócio', C.adm],
      ['Interpreta e aplica normas e legislações', C.dir],
      ['Diagnostica e cuida da saúde de pacientes', C.med],
      ['Planeja e executa projetos de construção', C.eciv]
    ] },
    { text: 'Qual situação te motivaria mais no trabalho?', options: [
      ['Fechar um bom negócio ou uma parceria estratégica', C.adm],
      ['Resolver um conflito com justiça e imparcialidade', C.dir],
      ['Contribuir para a recuperação da saúde de alguém', C.med],
      ['Ver uma obra de engenharia sendo concluída', C.eciv]
    ] },
    { text: 'Qual tipo de conteúdo você escolheria para se atualizar?', options: [
      ['Tendências de mercado e empreendedorismo', C.adm],
      ['Análises de casos e decisões jurídicas', C.dir],
      ['Novidades da área da saúde', C.med],
      ['Projetos de infraestrutura e construção civil', C.eciv]
    ] },
    { text: 'O que mais chama sua atenção no dia a dia?', options: [
      ['Estratégia, finanças e gestão', C.adm],
      ['Direitos, deveres e regras da sociedade', C.dir],
      ['O funcionamento do corpo humano', C.med],
      ['Como prédios, pontes e estruturas são construídos', C.eciv]
    ] },
    { text: 'Você se imagina mais atuando em:', options: [
      ['Melhoria contínua de processos industriais', C.eprod],
      ['Compreensão de emoções e comportamentos humanos', C.psi],
      ['Cuidado direto com pacientes em tratamento', C.enf],
      ['Concepção e projeto de novos espaços', C.arq]
    ] },
    { text: 'Qual desses desafios parece mais interessante pra você?', options: [
      ['Reduzir desperdício e aumentar a eficiência de uma produção', C.eprod],
      ['Ajudar alguém a lidar com ansiedade ou outro desafio emocional', C.psi],
      ['Fazer diferença direta na recuperação de um paciente', C.enf],
      ['Repensar o layout e a funcionalidade de um espaço', C.arq]
    ] },
    { text: 'Se fosse apresentar um projeto, o tema seria:', options: [
      ['Gestão da qualidade e produtividade industrial', C.eprod],
      ['Saúde mental e bem-estar psicológico', C.psi],
      ['Boas práticas de cuidado e enfermagem', C.enf],
      ['Arquitetura sustentável e uso do espaço', C.arq]
    ] },
    { text: 'O que te traria mais realização profissional?', options: [
      ['Ver processos ficarem mensuravelmente mais eficientes', C.eprod],
      ['Ajudar pessoas a se compreenderem melhor', C.psi],
      ['Fazer diferença real na vida de um paciente', C.enf],
      ['Criar um projeto arquitetônico marcante', C.arq]
    ] }
  ];

  // pontuação máxima possível por curso (cada pergunta soma uma vez por curso presente)
  const maxScores = {};
  QUESTIONS.forEach((question) => {
    new Set(question.options.map(([, course]) => course)).forEach((course) => {
      maxScores[course] = (maxScores[course] || 0) + POINTS_PER_ANSWER;
    });
  });

  const el = {
    intro: document.getElementById('quiz-intro'),
    step: document.getElementById('quiz-step'),
    result: document.getElementById('quiz-result'),
    start: document.getElementById('quiz-start'),
    restart: document.getElementById('quiz-restart'),
    count: document.getElementById('quiz-count'),
    bar: document.getElementById('quiz-bar'),
    barFill: document.getElementById('quiz-bar-fill'),
    question: document.getElementById('quiz-question'),
    options: document.getElementById('quiz-options'),
    resultName: document.getElementById('quiz-result-name'),
    resultMatch: document.getElementById('quiz-result-match')
  };

  const state = { index: 0, scores: {} };

  const show = (view) => {
    el.intro.hidden = view !== 'intro';
    el.step.hidden = view !== 'step';
    el.result.hidden = view !== 'result';
  };

  const renderQuestion = () => {
    const question = QUESTIONS[state.index];
    const total = QUESTIONS.length;

    el.count.textContent = `Pergunta ${state.index + 1} de ${total}`;
    el.barFill.style.width = ((state.index + 1) / total) * 100 + '%';
    el.bar.setAttribute('aria-valuenow', String(state.index + 1));
    el.question.textContent = question.text;

    el.options.replaceChildren(
      ...question.options.map(([text, course]) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'quiz-option';
        button.textContent = text;
        button.addEventListener('click', () => answer(course));
        return button;
      })
    );

    el.question.focus({ preventScroll: true });
  };

  const renderResult = () => {
    const [course, percent] = Object.entries(maxScores)
      .map(([name, max]) => [name, ((state.scores[name] || 0) / max) * 100])
      .sort((a, b) => b[1] - a[1])[0];

    el.resultName.textContent = course;
    el.resultMatch.textContent = Math.round(percent) + '% de compatibilidade';
    show('result');
    el.result.focus({ preventScroll: true });
  };

  const answer = (course) => {
    state.scores[course] = (state.scores[course] || 0) + POINTS_PER_ANSWER;

    if (state.index < QUESTIONS.length - 1) {
      state.index += 1;
      renderQuestion();
    } else {
      renderResult();
    }
  };

  const begin = () => {
    state.index = 0;
    state.scores = {};
    show('step');
    renderQuestion();
  };

  el.start.addEventListener('click', begin);
  el.restart.addEventListener('click', begin);
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
initQuiz();
initModal();
