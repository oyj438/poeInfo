/**
 * app.js - PoE Info 메인 로직
 *
 * 페이지 로드 시 init()이 실행되어
 * 탭 전환, 공략 목록, 타이머, 외부 링크 기능을 초기화합니다.
 */

(function () {
  "use strict";

  // ===== DOM 요소 참조 =====
  var navButtons = document.querySelectorAll(".nav-btn");
  var sections = document.querySelectorAll(".content-section");
  var categoryFilter = document.getElementById("category-filter");
  var guideSearch = document.getElementById("guide-search");
  var guideList = document.getElementById("guide-list");
  var guideEmpty = document.getElementById("guide-empty");
  var guideModal = document.getElementById("guide-modal");
  var modalTitle = document.getElementById("modal-title");
  var modalCategory = document.getElementById("modal-category");
  var modalBody = document.getElementById("modal-body");
  var externalLinksContainer = document.getElementById("external-links");

  // 타이머 관련 DOM
  var timerDisplay = document.getElementById("timer-display");
  var btnStart = document.getElementById("btn-start");
  var btnPause = document.getElementById("btn-pause");
  var btnResume = document.getElementById("btn-resume");
  var btnReset = document.getElementById("btn-reset");
  var actBtnGroup = document.getElementById("act-btn-group");
  var btnUndoAct = document.getElementById("btn-undo-act");
  var actRecordsBody = document.getElementById("act-records-body");

  // ===== 타이머 상태 =====
  // Date.now() 기준으로 계산해 탭 비활성화에도 시간 오차를 줄임
  var timerState = {
    status: "idle",       // idle | running | paused
    startTime: 0,         // 타이머 시작 시점 (ms)
    pausedTotal: 0,       // 일시정지로 멈춘 총 시간 (ms)
    pauseStartedAt: 0,    // 일시정지를 누른 시점 (ms)
    displayInterval: null,
    actRecords: []        // { act, cumulativeMs, segmentMs }
  };

  /**
   * 페이지 전체 초기화
   */
  function init() {
    initNavigation();
    initGuides();
    initTimer();
    initExternalLinks();
  }

  // ==============================
  // 탭(섹션) 전환
  // ==============================

  function initNavigation() {
    navButtons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var sectionId = btn.getAttribute("data-section");
        switchSection(sectionId);
      });
    });
  }

  /**
   * 선택한 섹션만 보이게 하고 메뉴 활성 표시를 갱신
   */
  function switchSection(sectionId) {
    sections.forEach(function (section) {
      var isTarget = section.id === sectionId;
      section.classList.toggle("is-active", isTarget);
      section.hidden = !isTarget;
    });

    navButtons.forEach(function (btn) {
      var isActive = btn.getAttribute("data-section") === sectionId;
      btn.classList.toggle("is-active", isActive);
    });
  }

  // ==============================
  // 공략 목록
  // ==============================

  function initGuides() {
    populateCategoryFilter();
    renderGuideList();

    categoryFilter.addEventListener("change", renderGuideList);
    guideSearch.addEventListener("input", renderGuideList);

    // 모달 닫기 (X 버튼, 배경 클릭)
    document.querySelectorAll("[data-close-modal]").forEach(function (el) {
      el.addEventListener("click", closeGuideModal);
    });

    // ESC 키로 모달 닫기
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !guideModal.hidden) {
        closeGuideModal();
      }
    });
  }

  /**
   * 공략 데이터에서 카테고리 목록을 추출해 select에 채움
   */
  function populateCategoryFilter() {
    var categories = [];
    GUIDE_DATA.forEach(function (guide) {
      if (categories.indexOf(guide.category) === -1) {
        categories.push(guide.category);
      }
    });

    categories.sort();
    categories.forEach(function (cat) {
      var option = document.createElement("option");
      option.value = cat;
      option.textContent = cat;
      categoryFilter.appendChild(option);
    });
  }

  /**
   * 필터·검색 조건에 맞는 공략만 목록에 표시
   */
  function renderGuideList() {
    var selectedCategory = categoryFilter.value;
    var searchText = guideSearch.value.trim().toLowerCase();

    var filtered = GUIDE_DATA.filter(function (guide) {
      var matchCategory =
        selectedCategory === "all" || guide.category === selectedCategory;
      var matchSearch =
        searchText === "" ||
        guide.title.toLowerCase().indexOf(searchText) !== -1;
      return matchCategory && matchSearch;
    });

    guideList.innerHTML = "";

    if (filtered.length === 0) {
      guideEmpty.hidden = false;
      return;
    }

    guideEmpty.hidden = true;

    filtered.forEach(function (guide) {
      var li = document.createElement("li");
      li.className = "guide-item";

      var button = document.createElement("button");
      button.type = "button";
      button.className = "guide-item-btn";
      button.setAttribute("aria-label", guide.title + " 상세 보기");

      button.innerHTML =
        '<div class="guide-item-header">' +
        '<span class="guide-category">' + escapeHtml(guide.category) + "</span>" +
        '<h3 class="guide-title">' + escapeHtml(guide.title) + "</h3>" +
        "</div>" +
        '<p class="guide-summary">' + escapeHtml(guide.summary) + "</p>";

      button.addEventListener("click", function () {
        openGuideModal(guide);
      });

      li.appendChild(button);
      guideList.appendChild(li);
    });
  }

  /**
   * 공략 상세 모달 열기
   */
  function openGuideModal(guide) {
    modalCategory.textContent = guide.category;
    modalTitle.textContent = guide.title;
    modalBody.textContent = guide.content;
    guideModal.hidden = false;
    guideModal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  /**
   * 공략 상세 모달 닫기
   */
  function closeGuideModal() {
    guideModal.hidden = true;
    guideModal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  // ==============================
  // 액트런 타이머
  // ==============================

  function initTimer() {
    createActButtons();

    btnStart.addEventListener("click", startTimer);
    btnPause.addEventListener("click", pauseTimer);
    btnResume.addEventListener("click", resumeTimer);
    btnReset.addEventListener("click", resetTimer);
    btnUndoAct.addEventListener("click", undoLastActRecord);
  }

  /**
   * 액트 1~10 완료 버튼 생성
   */
  function createActButtons() {
    actBtnGroup.innerHTML = "";

    for (var act = 1; act <= 10; act++) {
      (function (actNum) {
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "btn act-btn";
        btn.textContent = "Act " + actNum;
        btn.setAttribute("data-act", actNum);
        btn.disabled = true;

        btn.addEventListener("click", function () {
          recordAct(actNum);
        });

        actBtnGroup.appendChild(btn);
      })(act);
    }
  }

  /**
   * 현재까지 경과 시간(ms) 계산
   */
  function getElapsedMs() {
    if (timerState.status === "idle") {
      return 0;
    }

    if (timerState.status === "paused") {
      return timerState.pauseStartedAt - timerState.startTime - timerState.pausedTotal;
    }

    // running
    return Date.now() - timerState.startTime - timerState.pausedTotal;
  }

  /**
   * ms를 HH:MM:SS 문자열로 변환
   */
  function formatTime(ms) {
    var totalSeconds = Math.floor(ms / 1000);
    var hours = Math.floor(totalSeconds / 3600);
    var minutes = Math.floor((totalSeconds % 3600) / 60);
    var seconds = totalSeconds % 60;

    return (
      pad(hours) + ":" + pad(minutes) + ":" + pad(seconds)
    );
  }

  function pad(num) {
    return num < 10 ? "0" + num : String(num);
  }

  /**
   * 화면의 타이머 숫자 갱신
   */
  function updateTimerDisplay() {
    timerDisplay.textContent = formatTime(getElapsedMs());
  }

  /**
   * 타이머 버튼 활성/비활성 상태 갱신
   */
  function updateTimerButtons() {
    var status = timerState.status;

    btnStart.disabled = status !== "idle";
    btnPause.disabled = status !== "running";
    btnResume.disabled = status !== "paused";
    btnReset.disabled = status === "idle" && timerState.actRecords.length === 0;

    // 액트 버튼: 타이머가 돌아가거나 일시정지 중일 때만 사용 가능
    var actEnabled = status === "running" || status === "paused";
    var actButtons = actBtnGroup.querySelectorAll(".act-btn");
    var recordedActs = timerState.actRecords.map(function (r) {
      return r.act;
    });

    actButtons.forEach(function (btn) {
      var actNum = parseInt(btn.getAttribute("data-act"), 10);
      var alreadyRecorded = recordedActs.indexOf(actNum) !== -1;
      btn.disabled = !actEnabled || alreadyRecorded;
      btn.classList.toggle("is-done", alreadyRecorded);
    });

    btnUndoAct.disabled = timerState.actRecords.length === 0;
  }

  function startTimer() {
    timerState.status = "running";
    timerState.startTime = Date.now();
    timerState.pausedTotal = 0;
    timerState.pauseStartedAt = 0;

    // 1초마다 화면 갱신 (실제 시간은 Date.now()로 계산)
    timerState.displayInterval = setInterval(updateTimerDisplay, 1000);
    updateTimerDisplay();
    updateTimerButtons();
  }

  function pauseTimer() {
    timerState.status = "paused";
    timerState.pauseStartedAt = Date.now();
    clearInterval(timerState.displayInterval);
    timerState.displayInterval = null;
    updateTimerDisplay();
    updateTimerButtons();
  }

  function resumeTimer() {
    // 이번 일시정지 구간만큼 pausedTotal에 더함
    timerState.pausedTotal += Date.now() - timerState.pauseStartedAt;
    timerState.status = "running";
    timerState.pauseStartedAt = 0;

    timerState.displayInterval = setInterval(updateTimerDisplay, 1000);
    updateTimerDisplay();
    updateTimerButtons();
  }

  function resetTimer() {
    clearInterval(timerState.displayInterval);
    timerState.status = "idle";
    timerState.startTime = 0;
    timerState.pausedTotal = 0;
    timerState.pauseStartedAt = 0;
    timerState.displayInterval = null;
    timerState.actRecords = [];

    timerDisplay.textContent = "00:00:00";
    renderActRecords();
    updateTimerButtons();
  }

  /**
   * 액트 완료 기록
   */
  function recordAct(actNum) {
    var cumulativeMs = getElapsedMs();
    var segmentMs;

    if (timerState.actRecords.length === 0) {
      // 첫 액트: 구간 = 시작부터 현재까지
      segmentMs = cumulativeMs;
    } else {
      var prev = timerState.actRecords[timerState.actRecords.length - 1];
      segmentMs = cumulativeMs - prev.cumulativeMs;
    }

    timerState.actRecords.push({
      act: actNum,
      cumulativeMs: cumulativeMs,
      segmentMs: segmentMs
    });

    renderActRecords();
    updateTimerButtons();
  }

  /**
   * 마지막 액트 기록 취소
   */
  function undoLastActRecord() {
    if (timerState.actRecords.length === 0) {
      return;
    }
    timerState.actRecords.pop();
    renderActRecords();
    updateTimerButtons();
  }

  /**
   * 액트 기록 테이블 갱신
   */
  function renderActRecords() {
    actRecordsBody.innerHTML = "";

    if (timerState.actRecords.length === 0) {
      var emptyRow = document.createElement("tr");
      emptyRow.className = "empty-row";
      emptyRow.innerHTML = '<td colspan="3">아직 기록이 없습니다.</td>';
      actRecordsBody.appendChild(emptyRow);
      return;
    }

    timerState.actRecords.forEach(function (record) {
      var row = document.createElement("tr");
      row.innerHTML =
        "<td>Act " + record.act + "</td>" +
        "<td>" + formatTime(record.cumulativeMs) + "</td>" +
        "<td>" + formatTime(record.segmentMs) + "</td>";
      actRecordsBody.appendChild(row);
    });
  }

  // ==============================
  // 외부 링크
  // ==============================

  function initExternalLinks() {
    externalLinksContainer.innerHTML = "";

    EXTERNAL_LINKS.forEach(function (link) {
      var anchor = document.createElement("a");
      anchor.className = "link-card";
      anchor.href = link.url;
      anchor.target = "_blank";
      anchor.rel = "noopener noreferrer";

      anchor.innerHTML =
        '<h3 class="link-card-name">' + escapeHtml(link.name) + "</h3>" +
        '<p class="link-card-desc">' + escapeHtml(link.description) + "</p>" +
        '<span class="link-card-url">' + escapeHtml(link.url) + "</span>";

      externalLinksContainer.appendChild(anchor);
    });
  }

  // ==============================
  // 유틸리티
  // ==============================

  /**
   * HTML 특수문자 이스케이프 (XSS 방지)
   */
  function escapeHtml(text) {
    var div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  // DOM 준비 완료 후 실행
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
