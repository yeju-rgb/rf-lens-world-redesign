// RF LENS WORLD 리디자인 — 메인 동작
(function () {
  // 1) 큰 제목 폭 맞춤: data-fit="디자인 px 폭". 서체가 달라도 원본과 같은 폭이 되게 가로만 조정한다.
  function fitTitles() {
    var unit = document.documentElement.clientWidth / 1920;
    document.querySelectorAll('[data-fit]').forEach(function (el) {
      el.style.transform = 'none';
      var target = parseFloat(el.dataset.fit) * unit;
      var w = el.getBoundingClientRect().width;
      if (w > 0) el.style.transform = 'scaleX(' + (target / w).toFixed(4) + ')';
    });
  }
  window.addEventListener('resize', fitTitles);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitTitles);
  fitTitles();

  // 2) 히스토리 문장: 스크롤에 따라 한 줄씩 밝아진다. 시안의 정지 상태는 앞 3줄이 밝은 상태다.
  var reveal = document.querySelector('[data-reveal]');
  if (reveal) {
    var lines = reveal.querySelectorAll('.l');
    var onScroll = function () {
      var r = reveal.getBoundingClientRect();
      var vh = window.innerHeight;
      // 문단이 화면 아래 85% 지점에 들어올 때 시작해 화면 25% 지점에서 끝난다
      var p = (vh * 0.85 - r.top) / (vh * 0.6 + r.height);
      var n = Math.max(0, Math.min(lines.length, Math.ceil(p * lines.length)));
      lines.forEach(function (l, i) { l.classList.toggle('is-on', i < n); });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    onScroll();
  }

  // 3) 라인업 탭·화살표. 시안에 있는 제품은 RF Lens 4종뿐이라 RF Body는 준비 중으로 표시한다.
  var cards = document.querySelector('.lineup__cards');
  if (cards) {
    var lensHTML = cards.innerHTML;
    var tabs = document.querySelectorAll('.lineup__tab');
    var show = function (tab) {
      tabs.forEach(function (t) { t.classList.toggle('is-on', t.dataset.tab === tab); });
      cards.innerHTML = tab === 'lens' ? lensHTML : '<li class="lineup__empty">RF Body 라인업은 시안에 없는 화면입니다</li>';
      cards.classList.remove('is-swap'); void cards.offsetWidth; cards.classList.add('is-swap');
    };
    tabs.forEach(function (t) { t.addEventListener('click', function () { show(t.dataset.tab); }); });
    document.querySelectorAll('.lineup__arrows button').forEach(function (b) {
      b.addEventListener('click', function () {
        var on = document.querySelector('.lineup__tab.is-on').dataset.tab;
        show(on === 'lens' ? 'body' : 'lens');
      });
    });
  }

  // 4) 푸터 FAMILY SITE 토글 (목록은 시안에 없어 아이콘 상태만 바뀐다)
  var fam = document.querySelector('.foot__family');
  if (fam) fam.addEventListener('click', function () {
    fam.setAttribute('aria-expanded', fam.getAttribute('aria-expanded') === 'true' ? 'false' : 'true');
  });
  // 5) 글래스 모드: 사진 위 유리판(흐림)이 마우스를 따라 움직이고, 버튼으로 켜고 끈다
  document.querySelectorAll('[data-glass]').forEach(function (box) {
    box.addEventListener('mousemove', function (e) {
      var r = box.getBoundingClientRect();
      box.style.setProperty('--gx', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%');
      box.style.setProperty('--gy', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%');
    });
    var t = box.querySelector('.lc__toggle');
    if (t) t.addEventListener('click', function () {
      var on = t.getAttribute('aria-pressed') !== 'true';
      t.setAttribute('aria-pressed', on ? 'true' : 'false');
      box.classList.toggle('is-off', !on);
    });
  });
  // ATELIER 히어로: 마우스 가로 위치만큼 유리 영역이 넓어진다
  var ahero = document.querySelector('[data-glass-hero]');
  if (ahero) {
    var blur = ahero.querySelector('.ahero__blur');
    ahero.addEventListener('mousemove', function (e) { blur.style.width = e.clientX + 'px'; });
    ahero.addEventListener('mouseleave', function () { blur.style.width = ''; });
  }

  // 6) ATELIER 분류 목록: 누르면 선택이 바뀌고 카드가 다시 나타난다 (시안의 제품은 한 종류뿐이라 내용은 같다)
  var cats = document.querySelectorAll('.aside__list button');
  cats.forEach(function (b) {
    b.addEventListener('click', function () {
      var target = b.hasAttribute('data-reset') ? cats[0] : b;
      cats.forEach(function (c) { c.classList.toggle('is-on', c === target); });
      document.querySelectorAll('.lc').forEach(function (c, i) {
        c.classList.add('is-out');
        setTimeout(function () { c.classList.remove('is-out'); }, 180 + i * 90);
      });
    });
  });

  // 7) 점·눈금 표시(랜딩 캐러셀, 제품 상세): 누른 위치로 선택 표시가 옮겨간다
  document.querySelectorAll('.car__ticks, .dots').forEach(function (group) {
    var btns = group.querySelectorAll('button');
    btns.forEach(function (b, i) {
      b.addEventListener('click', function () {
        btns.forEach(function (x) { x.classList.toggle('is-on', x === b); });
        var track = document.querySelector('.car__track');
        if (group.classList.contains('car__ticks') && track) track.style.transform = 'translateX(' + ((2 - i) * 6) + 'rem)';
        var lens = document.querySelector('.dpanel__lens');
        if (group.classList.contains('dots') && lens) { lens.classList.add('is-swap'); setTimeout(function () { lens.classList.remove('is-swap'); }, 260); }
      });
    });
  });

  // 8) 제품 상세: 장바구니 담기 안내
  var cart = document.querySelector('[data-cart]');
  var toast = document.querySelector('.toast');
  if (cart && toast) cart.addEventListener('click', function () {
    var inCart = cart.classList.toggle('is-in');
    cart.textContent = inCart ? '담기 완료' : '장바구니';
    toast.textContent = inCart ? '장바구니에 담았습니다' : '장바구니에서 뺐습니다';
    toast.classList.add('is-on');
    clearTimeout(toast._t); toast._t = setTimeout(function () { toast.classList.remove('is-on'); }, 1800);
  });

  // 9) 커서 빛: 커서 위치에 빛이 따라오고, 배경 빛 번짐이 커서 방향으로 기운다
  var root = document.documentElement, pending = false, mx = 0, my = 0;
  window.addEventListener('mousemove', function (e) {
    mx = e.clientX; my = e.clientY;
    if (pending) return;
    pending = true;
    requestAnimationFrame(function () {
      pending = false;
      root.style.setProperty('--mx', mx + 'px');
      root.style.setProperty('--my', my + 'px');
      root.style.setProperty('--dx', (mx / window.innerWidth * 2 - 1).toFixed(3));
      root.style.setProperty('--dy', (my / window.innerHeight * 2 - 1).toFixed(3));
      root.style.setProperty('--light-on', '1');
    });
  }, { passive: true });
  document.addEventListener('mouseleave', function () { root.style.setProperty('--light-on', '0'); });
})();
