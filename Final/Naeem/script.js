  // Tab active state + status bar section label on scroll
  const tabs = document.querySelectorAll('.tab');
  const sections = document.querySelectorAll('section[id]');
  const sbSection = document.getElementById('sb-section');
  const labelMap = {
    hero: 'Ln 1, intro.js', about: 'Ln 14, about.md', skills: 'Ln 32, skills.json',
    projects: 'Ln 58, projects.js', experience: 'Ln 91, log', contact: 'Ln 120, contact.sh'
  };

  const observer = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        const id = entry.target.id;
        tabs.forEach(t=>t.classList.toggle('active', t.dataset.tab === id));
        if(labelMap[id]) sbSection.textContent = labelMap[id];
      }
    });
  }, {rootMargin:'-45% 0px -45% 0px'});
  sections.forEach(s=>observer.observe(s));

  // Skill bar fill on view
  const skillObserver = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        const row = entry.target;
        const level = row.dataset.level;
        const fill = row.querySelector('.bar-fill');
        fill.style.width = level + '%';
        skillObserver.unobserve(row);
      }
    });
  }, {threshold:0.4});
  document.querySelectorAll('.skill-row').forEach(row=>skillObserver.observe(row));

  // Gutter line numbers (purely decorative, matches viewport height)
  function buildGutter(){
    const gutter = document.getElementById('gutter');
    if(!gutter) return;
    const lh = 28;
    const totalHeight = document.body.scrollHeight;
    const count = Math.ceil(totalHeight / lh);
    let html = '';
    for(let i=1;i<=count;i++){ html += `<div class="ln" style="--lh:${lh}px">${i}</div>`; }
    gutter.innerHTML = html;
  }
  window.addEventListener('load', buildGutter);
  window.addEventListener('resize', ()=>{ clearTimeout(window._gt); window._gt = setTimeout(buildGutter, 200); });

  // Contact form fake submit
  const form = document.getElementById('contactForm');
  const output = document.getElementById('outputLine');
  form.addEventListener('submit', (e)=>{
    e.preventDefault();
    output.classList.add('show');
    setTimeout(()=>{ form.reset(); }, 50);
  });
  // Animated code-rain background (subtle, muted — matches theme colors)
  (function(){
    const canvas = document.getElementById('codeRain');
    const ctx = canvas.getContext('2d');
    const chars = '01{}();=<>/*+-#$%[]_'.split('');
    const fontSize = 15;
    const bgFill = 'rgba(13,16,23,0.08)';
    const dropColor = 'rgba(20,120,60,0.5)';
    const leadColor = 'rgba(40,180,90,0.8)';
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let columns, drops, w, h, rafId;

    function resize(){
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
      columns = Math.floor(w / fontSize);
      drops = new Array(columns).fill(0).map(()=> Math.floor(Math.random() * -40));
      ctx.fillStyle = 'rgba(13,16,23,1)';
      ctx.fillRect(0,0,w,h);
    }

    function draw(){
      ctx.fillStyle = bgFill;
      ctx.fillRect(0,0,w,h);
      ctx.font = fontSize + 'px ' + getComputedStyle(document.documentElement).getPropertyValue('--mono');

      for(let i=0;i<columns;i++){
        const char = chars[Math.floor(Math.random()*chars.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;
        ctx.fillStyle = leadColor;
        ctx.fillText(char, x, y);
        ctx.fillStyle = dropColor;
        ctx.fillText(chars[Math.floor(Math.random()*chars.length)], x, y - fontSize);

        if(y > h && Math.random() > 0.975){
          drops[i] = 0;
        }
        drops[i]++;
      }
      rafId = requestAnimationFrame(loop);
    }

    let last = 0;
    function loop(ts){
      if(ts - last < 55){ rafId = requestAnimationFrame(loop); return; } // throttle speed
      last = ts;
      draw();
    }

    resize();
    window.addEventListener('resize', ()=>{ clearTimeout(window._rt); window._rt = setTimeout(resize, 200); });

    if(!reducedMotion){
      rafId = requestAnimationFrame(loop);
    }
    // If reduced motion is preferred, canvas stays a static dark fill — no animation loop starts.
  })();
  // Mouse-following badge: arrow always points toward the cursor
  (function(){
    const badge = document.getElementById('mouseFollower');
    if(!badge) return;
    const arrow = badge.querySelector('svg');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function updateRotation(mouseX, mouseY){
      const rect = badge.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const angle = Math.atan2(mouseY - cy, mouseX - cx) * (180 / Math.PI) + 90;
      arrow.style.transform = `rotate(${angle}deg)`;
    }

    if(!reducedMotion){
      window.addEventListener('mousemove', (e)=>{
        updateRotation(e.clientX, e.clientY);
      });
    }
  })();
  // Glass cards: tilt to face the mouse + spotlight highlight that follows the cursor
  (function(){
    const cards = document.querySelectorAll('.glass-card');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if(reducedMotion || !cards.length) return;

    const maxTilt = 8; // degrees

    cards.forEach(card=>{
      card.addEventListener('mousemove', (e)=>{
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const percentX = (x / rect.width) - 0.5;
        const percentY = (y / rect.height) - 0.5;

        const rotateY = percentX * maxTilt * 2;
        const rotateX = -percentY * maxTilt * 2;

        card.style.transform = `perspective(700px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        card.style.setProperty('--mx', (x / rect.width * 100) + '%');
        card.style.setProperty('--my', (y / rect.height * 100) + '%');
      });

      card.addEventListener('mouseleave', ()=>{
        card.style.transform = 'perspective(700px) rotateX(0deg) rotateY(0deg)';
      });
    });
  })();
  // Boot screen: show briefly on load, then fade out
  (function(){
    const boot = document.getElementById('bootScreen');
    if(!boot) return;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const delay = reducedMotion ? 0 : 1700;
    setTimeout(()=>{
      boot.classList.add('hidden');
      setTimeout(()=> boot.remove(), 550);
    }, delay);
  })();

  // Custom cursor: crosshair/targeting reticle
  (function(){
    const box = document.getElementById('customCursor');
    const lineH = document.getElementById('cursorH');
    const lineV = document.getElementById('cursorV');
    if(!box || !lineH || !lineV) return;
    if(window.matchMedia('(pointer:coarse)').matches) return;

    window.addEventListener('mousemove', (e)=>{
      const x = e.clientX, y = e.clientY;
      box.style.left = x + 'px';
      box.style.top = y + 'px';
      lineH.style.top = y + 'px';
      lineV.style.left = x + 'px';
    });

    const hoverTargets = 'a, button, input, textarea, .tab, .project-card, .run-btn';
    document.addEventListener('mouseover', (e)=>{
      if(e.target.closest(hoverTargets)) box.classList.add('hover');
    });
    document.addEventListener('mouseout', (e)=>{
      if(e.target.closest(hoverTargets)) box.classList.remove('hover');
    });

    // Synthesized "gunshot" sound (Web Audio API — no external file needed)
    let audioCtx;
    function initAudio(){
      if(!audioCtx){
        const AC = window.AudioContext || window.webkitAudioContext;
        if(AC) audioCtx = new AC();
      }
      return audioCtx;
    }
    function playShotSound(){
      const ctx = initAudio();
      if(!ctx) return;
      if(ctx.state === 'suspended') ctx.resume();
      const now = ctx.currentTime;

      // Noise burst (the "crack")
      const bufferSize = ctx.sampleRate * 0.15;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = noiseBuffer.getChannelData(0);
      for(let i=0;i<bufferSize;i++){ data[i] = (Math.random()*2 - 1) * (1 - i/bufferSize); }
      const noise = ctx.createBufferSource();
      noise.buffer = noiseBuffer;

      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.value = 1800;
      noiseFilter.Q.value = 0.7;

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.5, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.13);

      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(ctx.destination);

      // Low thump (the "punch")
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.exponentialRampToValueAtTime(45, now + 0.09);

      const oscGain = ctx.createGain();
      oscGain.gain.setValueAtTime(0.7, now);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.11);

      osc.connect(oscGain);
      oscGain.connect(ctx.destination);

      noise.start(now);
      noise.stop(now + 0.15);
      osc.start(now);
      osc.stop(now + 0.12);
    }

    // Click "muzzle flash + spark" effect at the click point.
    const reducedMotionBullet = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if(!reducedMotionBullet){
      document.addEventListener('click', (e)=>{
        const x = e.clientX, y = e.clientY;

        // Flash core + 5 radiating rays
        const flash = document.createElement('div');
        flash.className = 'muzzle-flash';
        flash.style.left = x + 'px';
        flash.style.top = y + 'px';
        flash.innerHTML = '<div class="core"></div>';
        const rayCount = 5;
        const baseAngle = Math.random() * 60;
        for(let i=0;i<rayCount;i++){
          const ray = document.createElement('div');
          ray.className = 'ray';
          const angle = baseAngle + (360 / rayCount) * i + (Math.random()*14 - 7);
          ray.style.setProperty('--ang', angle + 'deg');
          ray.style.animationDelay = (Math.random()*0.03) + 's';
          flash.appendChild(ray);
        }
        document.body.appendChild(flash);
        setTimeout(()=> flash.remove(), 350);

        // Sparks flying outward
        const sparkCount = 7;
        for(let i=0;i<sparkCount;i++){
          const spark = document.createElement('div');
          spark.className = 'spark';
          spark.style.left = x + 'px';
          spark.style.top = y + 'px';
          const angle = Math.random() * Math.PI * 2;
          const dist = 18 + Math.random() * 26;
          spark.style.setProperty('--dx', Math.cos(angle) * dist + 'px');
          spark.style.setProperty('--dy', Math.sin(angle) * dist + 'px');
          spark.style.animationDelay = (Math.random()*0.02) + 's';
          document.body.appendChild(spark);
          setTimeout(()=> spark.remove(), 500);
        }

        // quick recoil pulse on the crosshair box itself
        box.classList.add('recoil');
        setTimeout(()=> box.classList.remove('recoil'), 100);

        playShotSound();
      });
    }
  })();

  // Scroll reveal for sections
  (function(){
    const revealEls = document.querySelectorAll('.reveal');
    if(!revealEls.length) return;
    const revealObserver = new IntersectionObserver((entries)=>{
      entries.forEach(entry=>{
        if(entry.isIntersecting){
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, {threshold:0.12});
    revealEls.forEach(el=>revealObserver.observe(el));
  })();

  // Theme toggle: dark (default) <-> light
  (function(){
    const toggle = document.getElementById('themeToggle');
    if(!toggle) return;
    toggle.addEventListener('click', ()=>{
      const isLight = document.body.classList.toggle('light-mode');
      toggle.textContent = isLight ? '☀️ light' : '🌙 dark';
    });
  })();

  // Contact form: show a "typing..." indicator while the message field is active
  (function(){
    const messageField = document.getElementById('message');
    const indicator = document.getElementById('typingIndicator');
    if(!messageField || !indicator) return;
    let typingTimeout;
    messageField.addEventListener('input', ()=>{
      indicator.classList.add('show');
      clearTimeout(typingTimeout);
      typingTimeout = setTimeout(()=> indicator.classList.remove('show'), 1200);
    });
    messageField.addEventListener('blur', ()=> indicator.classList.remove('show'));
  })();
