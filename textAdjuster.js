export function initializeTextAdjuster() {
  const fontFamilySelect = document.getElementById("fontFamilySelect");
  const fontSizeRange = document.getElementById("fontSizeRange");
  const letterSpacingRange = document.getElementById("letterSpacingRange");
  const wordSpacingRange = document.getElementById("wordSpacingRange");
  const lineHeightRange = document.getElementById("lineHeightRange");
  const previewBox = document.getElementById("previewBox");
  const saveBtn = document.querySelector(".buttons button:last-child");
  const resetBtn = document.querySelector(".buttons button:first-child");
  const alignButtons = document.querySelectorAll(".align-btn");

  let textAlign = "left";

  // Safely parse values
  const parseOr = (val, fallback) => {
    const parsed = parseFloat(val);
    return isNaN(parsed) ? fallback : parsed;
  };

  // Fallback defaults in case computed styles are missing
  const computed = window.getComputedStyle(previewBox);
  const initialStyles = {
    fontFamily: matchFontOption(computed.fontFamily),
    fontSize: parseOr(computed.fontSize, 16),
    letterSpacing: parseOr(computed.letterSpacing, 1),
    wordSpacing: parseOr(computed.wordSpacing, 1),
    lineHeight: parseOr(computed.lineHeight, 10),
    textAlign: computed.textAlign || "left"
  };

  // Initialize controls
  fontFamilySelect.value = initialStyles.fontFamily;
  fontSizeRange.value = initialStyles.fontSize;
  letterSpacingRange.value = initialStyles.letterSpacing;
  wordSpacingRange.value = initialStyles.wordSpacing;
  lineHeightRange.value = initialStyles.lineHeight;
  setAlignButton(initialStyles.textAlign);
  updateLabels();
  updatePreview();

  // Event Listeners
  fontFamilySelect.addEventListener("change", updatePreview);
  fontSizeRange.addEventListener("input", () => { updateLabels(); updatePreview(); });
  letterSpacingRange.addEventListener("input", () => { updateLabels(); updatePreview(); });
  wordSpacingRange.addEventListener("input", () => { updateLabels(); updatePreview(); });
  lineHeightRange.addEventListener("input", () => { updateLabels(); updatePreview(); });
  alignButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      alignButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      textAlign = btn.getAttribute("data-align");
      updatePreview();
    });
  });

  saveBtn.addEventListener("click", () => {
    const settings = getCurrentSettings();
    chrome.storage.local.set(settings, () => {
      applyTextAdjustments(settings);
    });
  });

  resetBtn.addEventListener("click", () => {
    chrome.storage.local.clear();
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        function: () => {
          const style = document.getElementById("customTypography");
          if (style) style.remove();
        }
      });
    });

    // Reset inputs
    fontFamilySelect.value = initialStyles.fontFamily;
    fontSizeRange.value = initialStyles.fontSize;
    letterSpacingRange.value = initialStyles.letterSpacing;
    wordSpacingRange.value = initialStyles.wordSpacing;
    lineHeightRange.value = initialStyles.lineHeight;
    setAlignButton(initialStyles.textAlign);
    textAlign = initialStyles.textAlign;

    updateLabels();
    updatePreview();
  });

  function updateLabels() {
    document.getElementById("fontSizeLabel").textContent = fontSizeRange.value;
    document.getElementById("letterSpacingLabel").textContent = letterSpacingRange.value;
    document.getElementById("wordSpacingLabel").textContent = wordSpacingRange.value;
    document.getElementById("lineHeightLabel").textContent = lineHeightRange.value;
  }

  function setAlignButton(value) {
    alignButtons.forEach(b => b.classList.remove("active"));
    alignButtons.forEach(btn => {
      if (btn.getAttribute("data-align") === value) {
        btn.classList.add("active");
      }
    });
  }

  function updatePreview() {
    const settings = getCurrentSettings();
    previewBox.style.fontFamily = settings.selectedFont;
    previewBox.style.fontSize = settings.fontSize + "px";
    previewBox.style.letterSpacing = settings.letterSpacing + "px";
    previewBox.style.wordSpacing = settings.wordSpacing + "px";
    previewBox.style.lineHeight = settings.lineHeight + "px";
    previewBox.style.textAlign = settings.textAlign;
  }

  function getCurrentSettings() {
    return {
      selectedFont: fontFamilySelect.value,
      fontSize: fontSizeRange.value,
      letterSpacing: letterSpacingRange.value,
      wordSpacing: wordSpacingRange.value,
      lineHeight: lineHeightRange.value,
      textAlign: textAlign
    };
  }

  function applyTextAdjustments(settings) {
    const css = `
      * {
        font-family: '${settings.selectedFont}', sans-serif !important;
        font-size: ${settings.fontSize}px !important;
        letter-spacing: ${settings.letterSpacing}px !important;
        word-spacing: ${settings.wordSpacing}px !important;
        line-height: ${settings.lineHeight}px !important;
        text-align: ${settings.textAlign} !important;
      }
    `;

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        function: (css) => {
          let styleElement = document.getElementById("customTypography");
          if (!styleElement) {
            styleElement = document.createElement("style");
            styleElement.id = "customTypography";
            document.head.appendChild(styleElement);
          }
          styleElement.innerHTML = css;
        },
        args: [css]
      });
    });
  }

  function matchFontOption(fontFamily) {
    const options = ["OpenDyslexic", "Arial", "Comic Sans MS", "Times New Roman"];
    return options.find(opt => fontFamily.toLowerCase().includes(opt.toLowerCase())) || "OpenDyslexic";
  }
}

export const initializeFontSwitcher = initializeTextAdjuster;