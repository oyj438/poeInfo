/**
 * act-maps.js - 액트 1~10 지역 지도 모달
 */
(function () {
  "use strict";

  var MAPS = [];
  var MIN_SCALE = 0.5;
  var MAX_SCALE = 3;
  var SCALE_STEP = 0.2;

  for (var i = 1; i <= 10; i += 1) {
    MAPS.push({
      act: i,
      title: i + "장 지역 지도",
      src: "assets/maps/act-" + i + ".png"
    });
  }

  var openButton = document.getElementById("open-act-map");
  var modal = document.getElementById("act-map-modal");

  if (!openButton || !modal) {
    return;
  }

  var closeButton = document.getElementById("close-act-map");
  var title = document.getElementById("act-map-title");
  var tabs = document.getElementById("act-map-tabs");
  var image = document.getElementById("act-map-image");
  var viewport = document.getElementById("act-map-viewport");
  var prevButton = document.getElementById("act-map-prev");
  var nextButton = document.getElementById("act-map-next");
  var zoomOutButton = document.getElementById("act-map-zoom-out");
  var zoomInButton = document.getElementById("act-map-zoom-in");
  var fitButton = document.getElementById("act-map-fit");
  var zoomLabel = document.getElementById("act-map-zoom-label");

  var state = {
    act: 1,
    scale: 1,
    fitScale: 1,
    x: 0,
    y: 0,
    dragging: false,
    dragStartX: 0,
    dragStartY: 0,
    originX: 0,
    originY: 0,
    lastFocused: null
  };

  function createTabs() {
    MAPS.forEach(function (map) {
      var button = document.createElement("button");
      button.type = "button";
      button.className = "act-map-tab";
      button.setAttribute("role", "tab");
      button.setAttribute("data-act", String(map.act));
      button.textContent = map.act + "장";
      button.addEventListener("click", function () {
        selectAct(map.act);
      });
      tabs.appendChild(button);
    });
  }

  function openModal() {
    state.lastFocused = document.activeElement;
    modal.hidden = false;
    document.body.classList.add("act-map-open");
    selectAct(state.act);
    closeButton.focus();
  }

  function closeModal() {
    modal.hidden = true;
    document.body.classList.remove("act-map-open");
    stopDragging();

    if (state.lastFocused && typeof state.lastFocused.focus === "function") {
      state.lastFocused.focus();
    }
  }

  function selectAct(act) {
    var map = MAPS[act - 1];

    if (!map) {
      return;
    }

    state.act = act;
    title.textContent = map.title;
    image.alt = map.title;
    image.src = map.src;
    prevButton.disabled = act === 1;
    nextButton.disabled = act === 10;

    Array.prototype.forEach.call(tabs.querySelectorAll(".act-map-tab"), function (button) {
      var isActive = Number(button.getAttribute("data-act")) === act;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-selected", isActive ? "true" : "false");
      button.tabIndex = isActive ? 0 : -1;
    });
  }

  function fitImage() {
    if (!image.naturalWidth || !image.naturalHeight) {
      return;
    }

    var viewportWidth = viewport.clientWidth;
    var viewportHeight = viewport.clientHeight;
    var horizontalScale = viewportWidth / image.naturalWidth;
    var verticalScale = viewportHeight / image.naturalHeight;

    state.fitScale = Math.min(horizontalScale, verticalScale, 1);
    state.scale = state.fitScale;
    state.x = 0;
    state.y = 0;
    renderTransform();
  }

  function setScale(nextScale) {
    var minimum = Math.min(MIN_SCALE, state.fitScale);
    state.scale = Math.max(minimum, Math.min(MAX_SCALE, nextScale));
    renderTransform();
  }

  function renderTransform() {
    image.style.transform =
      "translate(calc(-50% + " + state.x + "px), calc(-50% + " + state.y + "px)) scale(" + state.scale + ")";
    zoomLabel.textContent = Math.round(state.scale * 100) + "%";
  }

  function startDragging(clientX, clientY) {
    if (state.scale <= state.fitScale + 0.001) {
      return;
    }

    state.dragging = true;
    state.dragStartX = clientX;
    state.dragStartY = clientY;
    state.originX = state.x;
    state.originY = state.y;
    viewport.classList.add("is-dragging");
  }

  function moveDragging(clientX, clientY) {
    if (!state.dragging) {
      return;
    }

    state.x = state.originX + clientX - state.dragStartX;
    state.y = state.originY + clientY - state.dragStartY;
    renderTransform();
  }

  function stopDragging() {
    state.dragging = false;
    viewport.classList.remove("is-dragging");
  }

  function handleKeydown(event) {
    if (modal.hidden) {
      return;
    }

    if (event.key === "Escape") {
      closeModal();
      return;
    }

    if (event.key === "ArrowLeft" && state.act > 1) {
      selectAct(state.act - 1);
    } else if (event.key === "ArrowRight" && state.act < 10) {
      selectAct(state.act + 1);
    }
  }

  createTabs();

  openButton.addEventListener("click", openModal);
  closeButton.addEventListener("click", closeModal);
  modal.querySelector("[data-act-map-close]").addEventListener("click", closeModal);

  prevButton.addEventListener("click", function () {
    selectAct(state.act - 1);
  });

  nextButton.addEventListener("click", function () {
    selectAct(state.act + 1);
  });

  zoomOutButton.addEventListener("click", function () {
    setScale(state.scale - SCALE_STEP);
  });

  zoomInButton.addEventListener("click", function () {
    setScale(state.scale + SCALE_STEP);
  });

  fitButton.addEventListener("click", fitImage);
  image.addEventListener("load", fitImage);

  viewport.addEventListener("wheel", function (event) {
    event.preventDefault();
    setScale(state.scale + (event.deltaY < 0 ? SCALE_STEP : -SCALE_STEP));
  }, { passive: false });

  viewport.addEventListener("pointerdown", function (event) {
    viewport.setPointerCapture(event.pointerId);
    startDragging(event.clientX, event.clientY);
  });

  viewport.addEventListener("pointermove", function (event) {
    moveDragging(event.clientX, event.clientY);
  });

  viewport.addEventListener("pointerup", stopDragging);
  viewport.addEventListener("pointercancel", stopDragging);
  document.addEventListener("keydown", handleKeydown);

  window.addEventListener("resize", function () {
    if (!modal.hidden) {
      fitImage();
    }
  });
}());
