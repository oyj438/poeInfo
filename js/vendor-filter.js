/**
 * vendor-filter.js
 * PoE 액트 상점 검색용 정규식 생성기
 */
(function () {
  "use strict";

  var VENDOR_FILTER_OPTIONS = [
    { id: "movement-speed", label: "이동속도", patterns: ["주자", "단거리"] },
    { id: "maximum-life", label: "생명력", patterns: ["생명력"] },
    { id: "fire-resistance", label: "화염 저항", patterns: ["화염 저항"] },
    { id: "cold-resistance", label: "냉기 저항", patterns: ["냉기 저항"] },
    { id: "lightning-resistance", label: "번개 저항", patterns: ["번개 저항"] },
    { id: "all-resistance", label: "모든 원소 저항", patterns: ["모든 원소 저항"] },
    { id: "attack-speed", label: "공격", patterns: ["공격"] },
    { id: "cast-speed", label: "시전", patterns: ["시전"] },
    { id: "spell-damage", label: "주문", patterns: ["주문"] },
    { id: "physical-damage", label: "물리", patterns: ["물리"] }
  ];

  var optionList;
  var keywordInput;
  var resultTextarea;
  var lengthLabel;
  var copyButton;
  var resetButton;
  var copyMessage;
  var copyMessageTimer = null;

  function initVendorFilter() {
    optionList = document.getElementById("vendor-option-list");
    keywordInput = document.getElementById("vendor-keywords");
    resultTextarea = document.getElementById("vendor-regex-result");
    lengthLabel = document.getElementById("vendor-regex-length");
    copyButton = document.getElementById("vendor-copy");
    resetButton = document.getElementById("vendor-reset");
    copyMessage = document.getElementById("vendor-copy-message");

    if (!optionList || !keywordInput || !resultTextarea) {
      return;
    }

    renderOptions();
    bindEvents();
    updateVendorRegex();
  }

  function renderOptions() {
    optionList.innerHTML = "";

    VENDOR_FILTER_OPTIONS.forEach(function (option) {
      var label = document.createElement("label");
      label.className = "vendor-choice";

      var checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.value = option.id;
      checkbox.setAttribute("data-vendor-option", option.id);

      var text = document.createElement("span");
      text.textContent = option.label;

      label.appendChild(checkbox);
      label.appendChild(text);
      optionList.appendChild(label);
    });
  }

  function bindEvents() {
    document.querySelectorAll('input[name="vendor-link-count"]').forEach(function (radio) {
      radio.addEventListener("change", updateVendorRegex);
    });

    optionList.addEventListener("change", updateVendorRegex);
    keywordInput.addEventListener("input", updateVendorRegex);

    document.querySelectorAll(".vendor-preset").forEach(function (button) {
      button.addEventListener("click", function () {
        applyPreset(button.getAttribute("data-preset"));
      });
    });

    copyButton.addEventListener("click", copyVendorRegex);
    resetButton.addEventListener("click", resetVendorFilter);
  }

  function getSelectedLinkPattern() {
    var selected = document.querySelector('input[name="vendor-link-count"]:checked');
    return selected ? selected.value : "";
  }

  function getSelectedOptionPatterns() {
    var patterns = [];

    optionList.querySelectorAll("input[data-vendor-option]:checked").forEach(function (checkbox) {
      var option = findOption(checkbox.value);
      if (!option) {
        return;
      }

      option.patterns.forEach(function (pattern) {
        patterns.push(pattern);
      });
    });

    return patterns;
  }

  function getKeywordPatterns() {
    return keywordInput.value
      .split(",")
      .map(function (keyword) {
        return keyword.trim();
      })
      .filter(function (keyword) {
        return keyword.length > 0;
      })
      .map(escapeRegex);
  }

  function updateVendorRegex() {
    var parts = [];
    var linkPattern = getSelectedLinkPattern();

    if (linkPattern) {
      parts.push(linkPattern);
    }

    parts = parts.concat(getSelectedOptionPatterns());
    parts = parts.concat(getKeywordPatterns());
    parts = unique(parts);

    var regex = parts.join("|");
    resultTextarea.value = regex;
    lengthLabel.textContent = regex.length + "자";
    copyButton.disabled = regex.length === 0;
    clearCopyMessage();
  }

  function applyPreset(presetName) {
    resetSelectionsOnly();

    if (presetName === "three-link") {
      selectLinkPattern("[rgbw]-[rgbw]-[rgbw]");
    } else if (presetName === "three-link-move") {
      selectLinkPattern("[rgbw]-[rgbw]-[rgbw]");
      selectOption("movement-speed");
    } else if (presetName === "four-link-move") {
      selectLinkPattern("[rgbw]-[rgbw]-[rgbw]-[rgbw]");
      selectOption("movement-speed");
    } else if (presetName === "life-resistance") {
      selectOption("maximum-life");
      selectOption("fire-resistance");
      selectOption("cold-resistance");
      selectOption("lightning-resistance");
      selectOption("all-resistance");
    }

    updateVendorRegex();
  }

  function resetVendorFilter() {
    resetSelectionsOnly();
    keywordInput.value = "";
    updateVendorRegex();
  }

  function resetSelectionsOnly() {
    selectLinkPattern("");
    optionList.querySelectorAll("input[data-vendor-option]").forEach(function (checkbox) {
      checkbox.checked = false;
    });
  }

  function selectLinkPattern(value) {
    var matched = false;

    document.querySelectorAll('input[name="vendor-link-count"]').forEach(function (radio) {
      radio.checked = radio.value === value;
      if (radio.checked) {
        matched = true;
      }
    });

    if (!matched) {
      var none = document.querySelector('input[name="vendor-link-count"][value=""]');
      if (none) {
        none.checked = true;
      }
    }
  }

  function selectOption(optionId) {
    var checkbox = optionList.querySelector('input[data-vendor-option="' + optionId + '"]');
    if (checkbox) {
      checkbox.checked = true;
    }
  }

  function findOption(optionId) {
    for (var i = 0; i < VENDOR_FILTER_OPTIONS.length; i++) {
      if (VENDOR_FILTER_OPTIONS[i].id === optionId) {
        return VENDOR_FILTER_OPTIONS[i];
      }
    }
    return null;
  }

  function unique(items) {
    var result = [];
    items.forEach(function (item) {
      if (item && result.indexOf(item) === -1) {
        result.push(item);
      }
    });
    return result;
  }

  function escapeRegex(text) {
    return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  function copyVendorRegex() {
    var text = resultTextarea.value;
    if (!text) {
      return;
    }

    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(
        function () {
          showCopyMessage("복사되었습니다.");
        },
        fallbackCopy
      );
      return;
    }

    fallbackCopy();
  }

  function fallbackCopy() {
    resultTextarea.focus();
    resultTextarea.select();
    resultTextarea.setSelectionRange(0, resultTextarea.value.length);

    try {
      var copied = document.execCommand("copy");
      showCopyMessage(copied ? "복사되었습니다." : "복사하지 못했습니다.");
    } catch (error) {
      showCopyMessage("복사하지 못했습니다.");
    }
  }

  function showCopyMessage(message) {
    clearTimeout(copyMessageTimer);
    copyMessage.textContent = message;
    copyMessageTimer = setTimeout(clearCopyMessage, 1800);
  }

  function clearCopyMessage() {
    if (copyMessage) {
      copyMessage.textContent = "";
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initVendorFilter);
  } else {
    initVendorFilter();
  }
})();
