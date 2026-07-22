/**
 * app.js - PoE Run Helper 메인 로직
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
  var externalLinksContainer = document.getElementById("external-links");

  // 타이머 관련 DOM
  var timerPanel = document.getElementById("timer-panel");
  var timerStatus = document.getElementById("timer-status");
  var timerDisplay = document.getElementById("timer-display");
  var timerRecent = document.getElementById("timer-recent");
  var btnStart = document.getElementById("btn-start");
  var btnPause = document.getElementById("btn-pause");
  var btnResume = document.getElementById("btn-resume");
  var btnReset = document.getElementById("btn-reset");
  var actBtnGroup = document.getElementById("act-btn-group");
  var btnUndoAct = document.getElementById("btn-undo-act");
  var actRecordsBody = document.getElementById("act-records-body");

  // 펼친 공략 id 저장 (목록 다시 그릴 때 상태 유지)
  var expandedGuideIds = {};

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
        switchSection(btn.getAttribute("data-section"));
      });
    });
  }

  function switchSection(sectionId) {
    sections.forEach(function (section) {
      var isTarget = section.id === sectionId;
      section.classList.toggle("is-active", isTarget);
      section.hidden = !isTarget;
    });

    navButtons.forEach(function (btn) {
      btn.classList.toggle("is-active", btn.getAttribute("data-section") === sectionId);
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
  }

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
   * 공략이 검색어와 일치하는지 확인
   * title, category, summary, sections heading/items 모두 검색
   */
  function guideMatchesSearch(guide, searchText) {
    if (!searchText) {
      return true;
    }

    var lower = searchText.toLowerCase();

    if (guide.title && guide.title.toLowerCase().indexOf(lower) !== -1) {
      return true;
    }
    if (guide.category && guide.category.toLowerCase().indexOf(lower) !== -1) {
      return true;
    }
    if (guide.summary && guide.summary.toLowerCase().indexOf(lower) !== -1) {
      return true;
    }

    var sections = guide.sections || [];
    for (var i = 0; i < sections.length; i++) {
      var section = sections[i];
      if (section.heading && section.heading.toLowerCase().indexOf(lower) !== -1) {
        return true;
      }
      var items = section.items || [];
      for (var j = 0; j < items.length; j++) {
        var item = items[j];
      
        // 기존 일반 문자열 항목
        if (typeof item === "string") {
          if (item.toLowerCase().indexOf(lower) !== -1) {
            return true;
          }
          continue;
        }
      
        // 링크 객체 항목
        if (item && typeof item === "object") {
          var itemText = item.text ? String(item.text).toLowerCase() : "";      
          var itemUrl = item.url ? String(item.url).toLowerCase() : "";
      
          if (itemText.indexOf(lower) !== -1 || itemUrl.indexOf(lower) !== -1) {
            return true;
          }
        }
      }
    }

    return false;
  }

  function renderGuideList() {
    var selectedCategory = categoryFilter.value;
    var searchText = guideSearch.value.trim().toLowerCase();

    var filtered = GUIDE_DATA.filter(function (guide) {
      var matchCategory =
        selectedCategory === "all" || guide.category === selectedCategory;
      return matchCategory && guideMatchesSearch(guide, searchText);
    });

    guideList.innerHTML = "";

    if (filtered.length === 0) {
      guideEmpty.hidden = false;
      return;
    }

    guideEmpty.hidden = true;

    filtered.forEach(function (guide) {
      guideList.appendChild(createGuideItem(guide));
    });
  }

  /**
   * 공략 카드 DOM 생성 (펼치기/접기)
   */
  function createGuideItem(guide) {
    var isExpanded = !!expandedGuideIds[guide.id];
    var li = document.createElement("li");
    li.className = "guide-item" + (isExpanded ? " is-expanded" : "");

    var cardBody = document.createElement("div");
    cardBody.className = "guide-card-body";

    var top = document.createElement("div");
    top.className = "guide-card-top";
    top.innerHTML =
      '<span class="guide-category">' + escapeHtml(guide.category || "") + "</span>" +
      '<h3 class="guide-title">' + escapeHtml(guide.title || "") + "</h3>";

    var summary = document.createElement("p");
    summary.className = "guide-summary";
    summary.textContent = guide.summary || "";

    var toggleBtn = document.createElement("button");
    toggleBtn.type = "button";
    toggleBtn.className = "guide-toggle";
    toggleBtn.setAttribute("aria-expanded", isExpanded ? "true" : "false");
    toggleBtn.setAttribute("aria-controls", "guide-detail-" + guide.id);
    toggleBtn.textContent = isExpanded ? "내용 닫기" : "내용 보기";

    var detailWrap = document.createElement("div");
    detailWrap.className = "guide-detail";
    detailWrap.id = "guide-detail-" + guide.id;
    detailWrap.setAttribute("role", "region");
    detailWrap.setAttribute("aria-label", (guide.title || "") + " 상세 내용");
    detailWrap.hidden = !isExpanded;

    toggleBtn.addEventListener("click", function () {
      toggleGuideDetail(guide.id, li, toggleBtn, detailWrap);
    });

    cardBody.appendChild(top);
    cardBody.appendChild(summary);
    cardBody.appendChild(toggleBtn);

    var detailInner = document.createElement("div");
    detailInner.className = "guide-detail-inner";

    var detailContent = document.createElement("div");
    detailContent.className = "guide-detail-content";
    detailContent.innerHTML = buildGuideDetailHtml(guide);

    detailInner.appendChild(detailContent);
    detailWrap.appendChild(detailInner);

    li.appendChild(cardBody);
    li.appendChild(detailWrap);

    return li;
  }

  function toggleGuideDetail(guideId, listItem, toggleBtn, detailWrap) {
    var willExpand = !listItem.classList.contains("is-expanded");

    if (willExpand) {
      expandedGuideIds[guideId] = true;
      detailWrap.hidden = false;
      listItem.classList.add("is-expanded");
    } else {
      delete expandedGuideIds[guideId];
      listItem.classList.remove("is-expanded");
      detailWrap.hidden = true;
    }

    toggleBtn.setAttribute("aria-expanded", willExpand ? "true" : "false");
    toggleBtn.textContent = willExpand ? "내용 닫기" : "내용 보기";
  }

  /**
   * sections 배열을 HTML로 변환 (items 없어도 오류 없음)
   */
  function buildGuideDetailHtml(guide) {
    var html = "";
    var sections = guide.sections || [];

    if (sections.length === 0) {
      return '<p class="guide-section-empty">등록된 상세 내용이 없습니다.</p>';
    }

    sections.forEach(function (section) {
      html += '<section class="guide-detail-section">';

      if (section.heading) {
        html += '<h4 class="guide-section-heading">' + escapeHtml(section.heading) + "</h4>";
      }

      var items = section.items || [];
      if (items.length > 0) {
        html += '<ul class="guide-section-list">';
        items.forEach(function (item) {
          // 기존 문자열 항목
          if (typeof item === "string") {
            html += "<li>" + escapeHtml(item) + "</li>";
            return;
          }
        
          // 링크 객체 항목
          if (item && typeof item === "object") {
            var linkText = item.text || item.url || "링크";
        
            if (isSafeUrl(item.url)) {
              html +=
                '<li class="guide-link-item">' +
                  '<a class="guide-content-link"' +
                    ' href="' + escapeHtml(item.url) + '"' +
                    ' target="_blank"' +
                    ' rel="noopener noreferrer">' +
                    escapeHtml(linkText) +
                    ' <span aria-hidden="true">↗</span>' +
                  "</a>" +
                "</li>";
            } else {
              // URL이 잘못되어도 화면 전체가 깨지지 않게 일반 텍스트로 표시
              html +=
                '<li class="guide-invalid-link">' +
                  escapeHtml(linkText) +
                "</li>";
            }
          }
        });
        html += "</ul>";
      }

      html += "</section>";
    });

    return html;
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

    updateTimerUI();
  }

  function createActButtons() {
    actBtnGroup.innerHTML = "";

    for (var act = 1; act <= 10; act++) {
      (function (actNum) {
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "btn act-btn";
        btn.textContent = "액트 " + actNum + " 완료";
        btn.setAttribute("data-act", actNum);
        btn.disabled = true;

        btn.addEventListener("click", function () {
          recordAct(actNum);
        });

        actBtnGroup.appendChild(btn);
      })(act);
    }
  }

  function getElapsedMs() {
    if (timerState.status === "idle") {
      return 0;
    }

    if (timerState.status === "paused") {
      return timerState.pauseStartedAt - timerState.startTime - timerState.pausedTotal;
    }

    return Date.now() - timerState.startTime - timerState.pausedTotal;
  }

  /**
   * ms를 HH:MM:SS.d 형식으로 변환 (0.1초 단위)
   */
  function formatTime(ms) {
    var totalTenths = Math.floor(ms / 100);
    var hours = Math.floor(totalTenths / 36000);
    var minutes = Math.floor((totalTenths % 36000) / 600);
    var seconds = Math.floor((totalTenths % 600) / 10);
    var tenths = totalTenths % 10;

    return pad(hours) + ":" + pad(minutes) + ":" + pad(seconds) + "." + tenths;
  }

  function pad(num) {
    return num < 10 ? "0" + num : String(num);
  }

  /**
   * setInterval 중복 방지: 기존 interval을 먼저 정리
   */
  function clearDisplayInterval() {
    if (timerState.displayInterval !== null) {
      clearInterval(timerState.displayInterval);
      timerState.displayInterval = null;
    }
  }

  function startDisplayInterval() {
    clearDisplayInterval();
    // 0.1초 단위 표시를 위해 100ms마다 갱신 (실제 시간은 Date.now()로 계산)
    timerState.displayInterval = setInterval(updateTimerDisplay, 100);
  }

  function updateTimerDisplay() {
    timerDisplay.textContent = formatTime(getElapsedMs());
  }

  function updateTimerStatusUI() {
    timerPanel.classList.remove("is-running", "is-paused");

    if (timerState.status === "running") {
      timerStatus.textContent = "실행 중";
      timerPanel.classList.add("is-running");
    } else if (timerState.status === "paused") {
      timerStatus.textContent = "일시정지";
      timerPanel.classList.add("is-paused");
    } else {
      timerStatus.textContent = "대기";
    }
  }

  function updateRecentActUI() {
    var last = timerState.actRecords[timerState.actRecords.length - 1];

    if (!last) {
      timerRecent.textContent = "";
      return;
    }

    timerRecent.textContent =
      "최근 기록: 액트 " + last.act +
      " · 누적 " + formatTime(last.cumulativeMs) +
      " · 구간 " + formatTime(last.segmentMs);
  }

  function updateTimerButtons() {
    var status = timerState.status;
    var actEnabled = status === "running" || status === "paused";

    btnStart.disabled = status !== "idle";
    btnPause.disabled = status !== "running";
    btnResume.disabled = status !== "paused";
    btnReset.disabled = status === "idle" && timerState.actRecords.length === 0;

    // 순서 강제 없음: 타이머 실행 중이면 모든 액트 버튼 사용 가능
    var recordedActs = {};
    timerState.actRecords.forEach(function (record) {
      recordedActs[record.act] = true;
    });

    actBtnGroup.querySelectorAll(".act-btn").forEach(function (btn) {
      var actNum = parseInt(btn.getAttribute("data-act"), 10);
      btn.disabled = !actEnabled;
      btn.classList.toggle("is-recorded", !!recordedActs[actNum]);
    });

    btnUndoAct.disabled = timerState.actRecords.length === 0;
  }

  function updateTimerUI() {
    updateTimerDisplay();
    updateTimerStatusUI();
    updateRecentActUI();
    updateTimerButtons();
  }

  function startTimer() {
    timerState.status = "running";
    timerState.startTime = Date.now();
    timerState.pausedTotal = 0;
    timerState.pauseStartedAt = 0;

    startDisplayInterval();
    updateTimerUI();
  }

  function pauseTimer() {
    timerState.status = "paused";
    timerState.pauseStartedAt = Date.now();
    clearDisplayInterval();
    updateTimerUI();
  }

  function resumeTimer() {
    timerState.pausedTotal += Date.now() - timerState.pauseStartedAt;
    timerState.status = "running";
    timerState.pauseStartedAt = 0;

    startDisplayInterval();
    updateTimerUI();
  }

  function resetTimer() {
    clearDisplayInterval();
    timerState.status = "idle";
    timerState.startTime = 0;
    timerState.pausedTotal = 0;
    timerState.pauseStartedAt = 0;
    timerState.actRecords = [];

    timerDisplay.textContent = "00:00:00.0";
    renderActRecords();
    updateTimerUI();
  }

  function recordAct(actNum) {
    var cumulativeMs = getElapsedMs();
    var segmentMs;

    if (timerState.actRecords.length === 0) {
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
    updateTimerUI();
  }

  function undoLastActRecord() {
    if (timerState.actRecords.length === 0) {
      return;
    }
    timerState.actRecords.pop();
    renderActRecords();
    updateTimerUI();
  }

  function renderActRecords() {
    actRecordsBody.innerHTML = "";

    if (timerState.actRecords.length === 0) {
      var emptyRow = document.createElement("tr");
      emptyRow.className = "empty-row";
      emptyRow.innerHTML =
        '<td colspan="3">아직 기록이 없습니다. 타이머를 시작한 뒤 액트 완료 버튼을 눌러보세요.</td>';
      actRecordsBody.appendChild(emptyRow);
      return;
    }

    timerState.actRecords.forEach(function (record, index) {
      var row = document.createElement("tr");
      var isLatest = index === timerState.actRecords.length - 1;

      if (isLatest) {
        row.className = "is-latest";
      }

      row.innerHTML =
        "<td>액트 " + record.act + "</td>" +
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
        '<span class="link-card-action">바로가기 ↗</span>';

      externalLinksContainer.appendChild(anchor);
    });
  }

  // ==============================
  // 유틸리티
  // ==============================

  function isSafeUrl(url) {
    if (typeof url !== "string") {
      return false;
    }
  
    try {
      var parsedUrl = new URL(url);
  
      return (
        parsedUrl.protocol === "https:" ||
        parsedUrl.protocol === "http:"
      );
    } catch (error) {
      return false;
    }
  }

  function escapeHtml(text) {
    var div = document.createElement("div");
    div.textContent = text == null ? "" : String(text);
    return div.innerHTML;
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
