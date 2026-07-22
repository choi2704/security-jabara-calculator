(() => {
  "use strict";

  const T = window.SECURITY_JABARA_TABLE;
  const $ = (id) => document.getElementById(id);

  const state = {
    product: "알루미늄 방범자바라",
    opening: "편개형",
    color: "화이트",
    centerLock: "자동키",
    lowerLock: "자동키",
  };

  const lockTypes = [
    { name: "자동키", image: "images/lock-auto.jpg" },
    { name: "관통키", image: "images/lock-pass.jpg" },
    { name: "백화점키", image: "images/lock-dept.jpg" },
  ];

  const e = {
    productOptions: $("productOptions"),
    openOptions: $("openOptions"),
    colorOptions: $("colorOptions"),
    centerLockOptions: $("centerLockOptions"),
    lowerLockOptions: $("lowerLockOptions"),
    lowerLockPosition: $("lowerLockPosition"),
    lockRuleText: $("lockRuleText"),
    width: $("width"),
    height: $("height"),
    qty: $("qty"),
    minus: $("minus"),
    plus: $("plus"),
    pyeongText: $("pyeongText"),
    total: $("total"),
    productText: $("productText"),
    openText: $("openText"),
    colorText: $("colorText"),
    lockText: $("lockText"),
    sizeText: $("sizeText"),
    appliedPyeongText: $("appliedPyeongText"),
    rateText: $("rateText"),
    unitText: $("unitText"),
    qtyText: $("qtyText"),
    guideText: $("guideText"),
    copy: $("copy"),
    toggleTable: $("toggleTable"),
    tables: $("tables"),
  };

  function comma(n) {
    return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }
  function won(n) {
    return `${comma(n)}원`;
  }
  function prod() {
    return T.products.find((p) => p.name === state.product) || T.products[0];
  }
  function button(container, value, onClick) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "optBtn";
    b.dataset.value = value;
    b.textContent = value;
    b.addEventListener("click", onClick);
    container.appendChild(b);
  }

  function renderLockCards(container, position) {
    container.innerHTML = "";
    lockTypes.forEach((type) => {
      const label = document.createElement("label");
      label.className = "lockCard";
      label.dataset.value = type.name;
      label.innerHTML = `
        <img src="${type.image}" alt="${type.name}">
        <span class="lockCheck"><input type="checkbox" aria-label="${position} ${type.name}"><i></i>${type.name}</span>
      `;
      label.addEventListener("click", (event) => {
        event.preventDefault();
        if (position === "center") state.centerLock = type.name;
        else state.lowerLock = type.name;
        updateLockUI();
        calc();
      });
      container.appendChild(label);
    });
  }

  function render() {
    e.productOptions.innerHTML = "";
    e.openOptions.innerHTML = "";
    e.colorOptions.innerHTML = "";

    T.products.forEach((p) => button(e.productOptions, p.name, () => {
      state.product = p.name;
      active();
      calc();
    }));
    T.openings.forEach((v) => button(e.openOptions, v, () => {
      state.opening = v;
      active();
      calc();
    }));
    T.colors.forEach((v) => button(e.colorOptions, v, () => {
      state.color = v;
      active();
      calc();
    }));

    renderLockCards(e.centerLockOptions, "center");
    renderLockCards(e.lowerLockOptions, "lower");
    active();
    updateLockUI();
  }

  function active() {
    [...e.productOptions.children].forEach((b) => b.classList.toggle("isActive", b.dataset.value === state.product));
    [...e.openOptions.children].forEach((b) => b.classList.toggle("isActive", b.dataset.value === state.opening));
    [...e.colorOptions.children].forEach((b) => b.classList.toggle("isActive", b.dataset.value === state.color));
  }

  function isTwoLockHeight() {
    return Number(e.height.value || 0) >= 2000;
  }

  function lockSummary() {
    return isTwoLockHeight()
      ? `센터 ${state.centerLock} · 하부 ${state.lowerLock}`
      : `센터 ${state.centerLock}`;
  }

  function updateLockUI() {
    const twoLocks = isTwoLockHeight();
    e.lowerLockPosition.hidden = !twoLocks;
    e.lockRuleText.textContent = twoLocks
      ? "세로 2m 이상: 센터키·하부키 각각 1개 선택"
      : "세로 2m 미만: 센터키 1개 선택";

    [...e.centerLockOptions.children].forEach((card) => {
      const selected = card.dataset.value === state.centerLock;
      card.classList.toggle("isActive", selected);
      const input = card.querySelector("input");
      if (input) input.checked = selected;
    });
    [...e.lowerLockOptions.children].forEach((card) => {
      const selected = card.dataset.value === state.lowerLock;
      card.classList.toggle("isActive", selected);
      const input = card.querySelector("input");
      if (input) input.checked = selected;
    });

    e.lockText.textContent = lockSummary();
  }

  function reset(qty) {
    updateLockUI();
    e.pyeongText.textContent = "0평";
    e.total.textContent = "0원";
    e.productText.textContent = state.product;
    e.openText.textContent = state.opening;
    e.colorText.textContent = state.color;
    e.sizeText.textContent = "사이즈를 입력해주세요";
    e.appliedPyeongText.textContent = "0평";
    e.rateText.textContent = `${won(prod().rate)}/평`;
    e.unitText.textContent = "0원";
    e.qtyText.textContent = `${qty}EA`;
    e.guideText.textContent = "가로와 세로를 입력하면 예상 견적이 자동 계산됩니다.";
  }

  function calc() {
    updateLockUI();
    const widthRaw = String(e.width.value).trim();
    const heightRaw = String(e.height.value).trim();
    const qty = Math.max(1, Number(e.qty.value || 1));

    if (!widthRaw || !heightRaw) {
      reset(qty);
      return {
        width: 0, height: 0, calcWidth: 0, calcHeight: 0,
        rawPyeong: 0, appliedPyeong: 0, rate: prod().rate,
        unit: 0, qty, total: 0, lockSummary: lockSummary(),
      };
    }

    const width = Math.max(0, Number(widthRaw));
    const height = Math.max(0, Number(heightRaw));
    const calcWidth = Math.max(width, height);
    const calcHeight = Math.min(width, height);
    const rawPyeong = (calcWidth * calcHeight) / T.divisor;
    const rounded = Math.round(rawPyeong);
    const appliedPyeong = Math.max(T.minPyeong, rounded);
    const rate = prod().rate;
    const unit = appliedPyeong * rate;
    const total = unit * qty;

    e.pyeongText.textContent = `${rawPyeong.toFixed(1)}평 → ${appliedPyeong}평 적용`;
    e.total.textContent = won(total);
    e.productText.textContent = state.product;
    e.openText.textContent = state.opening;
    e.colorText.textContent = state.color;
    e.lockText.textContent = lockSummary();
    e.sizeText.textContent = width === calcWidth && height === calcHeight
      ? `${width} × ${height}mm`
      : `${width} × ${height}mm 입력 → ${calcWidth} × ${calcHeight}mm 기준`;
    e.appliedPyeongText.textContent = `${appliedPyeong}평`;
    e.rateText.textContent = `${won(rate)}/평`;
    e.unitText.textContent = won(unit);
    e.qtyText.textContent = `${qty}EA`;
    e.guideText.textContent = `적용 평수는 반올림 기준입니다.${rounded < T.minPyeong ? " 최소 주문 20평 기준으로 계산되었습니다." : ""}${height > width ? " 세로가 더 큰 값으로 입력되어 큰 값을 가로 기준으로 계산했습니다." : ""} 열쇠 옵션은 추가비용이 없습니다.`;

    return {
      width, height, calcWidth, calcHeight, rawPyeong, appliedPyeong,
      rate, unit, qty, total, lockSummary: lockSummary(),
    };
  }

  function text() {
    const r = calc();
    return `강동자바라 방범자바라 견적 문의\n\n제품: ${state.product}\n개폐 방식: ${state.opening}\n색상: ${state.color}\n열쇠 구성: ${r.lockSummary} (추가비용 없음)\n입력 사이즈: ${r.width} × ${r.height}mm\n계산 기준 사이즈: ${r.calcWidth} × ${r.calcHeight}mm\n계산 평수: ${r.rawPyeong.toFixed(1)}평\n적용 평수: ${r.appliedPyeong}평\n평당 단가: ${won(r.rate)}\n장당 금액: ${won(r.unit)}\n수량: ${r.qty}EA\n예상금액: ${won(r.total)}\n\n※ 적용 평수는 반올림 기준입니다.\n※ 최소 주문은 20평부터 적용됩니다.\n※ 열쇠 선택은 추가비용이 없습니다.\n※ 정확한 견적을 위해 설치 위치 사진을 보내주세요.\n문의: 010-7595-0484\n네이버 톡톡: https://talk.naver.com/ct/w4a85f?frm=psf`;
  }

  async function copy() {
    const content = text();
    try {
      await navigator.clipboard.writeText(content);
      alert("견적내용이 복사되었습니다.");
    } catch (err) {
      prompt("아래 내용을 복사해주세요.", content);
    }
  }

  async function orderGo(event) {
    event.preventDefault();
    try { await navigator.clipboard.writeText(text()); } catch (err) {}
    window.open("https://kdjavara.kr/product/%EB%A7%9E%EC%B6%A4%EC%A0%9C%EC%9E%91-%EC%9E%90%EB%B0%94%EB%9D%BC-%EB%B0%A9%EB%B2%94%EC%B0%BD-%EC%A0%91%EC%9D%B4%EC%8B%9D-%ED%98%84%EA%B4%80%EB%AC%B8-%EC%B0%BD%EB%AC%B8-%EB%B2%A0%EB%9E%80%EB%8B%A4-%EC%8A%AC%EB%9D%BC%EC%9D%B4%EB%94%A9-%EB%8F%84%EC%96%B4-%EA%B3%B5%EC%9E%A5%EC%A7%81%EC%98%81/726/category/1/display/2/?icid=MAIN.product_listmain_1", "_blank");
  }

  function bind() {
    [e.width, e.height, e.qty].forEach((input) => input.addEventListener("input", calc));
    e.minus.addEventListener("click", () => {
      e.qty.value = Math.max(1, Number(e.qty.value || 1) - 1);
      calc();
    });
    e.plus.addEventListener("click", () => {
      e.qty.value = Number(e.qty.value || 1) + 1;
      calc();
    });
    e.copy.addEventListener("click", copy);
    e.toggleTable.addEventListener("click", () => e.tables.classList.toggle("open"));
    const order = document.querySelector(".order");
    if (order) order.addEventListener("click", orderGo);
  }

  document.addEventListener("DOMContentLoaded", () => {
    render();
    bind();
    calc();
  });
})();
