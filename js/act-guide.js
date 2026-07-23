/**
 * act-guide.js - 일반/스피드런 액트 가이드 렌더링
 */
(function () {
  "use strict";

  var section = document.getElementById("act-guide");

  if (!section || typeof ACT_GUIDE_DATA === "undefined") {
    return;
  }

  var modeButtons = section.querySelectorAll("[data-guide-mode]");
  var actButtons = section.querySelectorAll("[data-guide-act]");
  var modeLabel = document.getElementById("act-guide-mode-label");
  var title = document.getElementById("act-guide-title");
  var summary = document.getElementById("act-guide-summary");
  var steps = document.getElementById("act-guide-steps");

  var state = {
    mode: "normal",
    act: 1
  };

  function escapeHtml(text) {
    var div = document.createElement("div");
    div.textContent = text == null ? "" : String(text);
    return div.innerHTML;
  }

  function renderTags(tags) {
    if (!tags || tags.length === 0) {
      return "";
    }

    return '<div class="act-guide-tags">' + tags.map(function (tag) {
      return '<span class="act-guide-tag">' + escapeHtml(tag) + '</span>';
    }).join("") + "</div>";
  }

  function render() {
    var modeData = ACT_GUIDE_DATA[state.mode] || {};
    var guide = modeData[state.act];

    modeButtons.forEach(function (button) {
      var active = button.getAttribute("data-guide-mode") === state.mode;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-selected", active ? "true" : "false");
    });

    actButtons.forEach(function (button) {
      var active = Number(button.getAttribute("data-guide-act")) === state.act;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-selected", active ? "true" : "false");
    });

    modeLabel.textContent = state.mode === "normal" ? "일반 가이드" : "스피드런 가이드";
    steps.innerHTML = "";

    if (!guide) {
      title.textContent = state.act + "장 준비 중";
      summary.textContent = "이 액트의 가이드 내용은 아직 작성 중입니다.";
      return;
    }

    title.textContent = guide.title;
    summary.textContent = guide.summary || "";

    guide.steps.forEach(function (step, index) {
      var item = document.createElement("li");
      item.className = "act-guide-step";
      item.innerHTML =
        '<div class="act-guide-step-number" aria-hidden="true">' + (index + 1) + '</div>' +
        '<div class="act-guide-step-content">' +
          '<div class="act-guide-step-heading">' +
            '<h4>' + escapeHtml(step.area) + '</h4>' +
            renderTags(step.tags) +
          '</div>' +
          '<p class="act-guide-action">' + escapeHtml(step.action) + '</p>' +
          (step.note ? '<p class="act-guide-note">' + escapeHtml(step.note) + '</p>' : '') +
        '</div>';
      steps.appendChild(item);
    });
  }

  modeButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      state.mode = button.getAttribute("data-guide-mode");
      render();
    });
  });

  actButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      if (button.disabled || !button.hasAttribute("data-guide-act")) {
        return;
      }
      state.act = Number(button.getAttribute("data-guide-act"));
      render();
    });
  });

  render();
}());
