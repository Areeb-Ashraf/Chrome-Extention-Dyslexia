export function initializeTextAdjuster() {
    const textAdjustmentsToggle = document.getElementById("textAdjustmentsToggle");
    const fontSizeSelect = document.getElementById("fontSizeSelect");
    const letterSpacingSelect = document.getElementById("letterSpacingSelect");
    const lineHeightSelect = document.getElementById("lineHeightSelect");
    const textAlignSelect = document.getElementById("textAlignSelect");
    const maxLineWidthSelect = document.getElementById("maxLineWidthSelect");
  
    // Load stored values or use defaults.
    chrome.storage.local.get(
      ["textAdjustmentsEnabled", "fontSize", "letterSpacing", "lineHeight", "textAlign", "maxLineWidth"],
      (result) => {
        const adjustmentsEnabled = result.textAdjustmentsEnabled !== undefined ? result.textAdjustmentsEnabled : false;
        const fontSize = result.fontSize || "DEFAULT";
        const letterSpacing = result.letterSpacing || "DEFAULT";
        const lineHeight = result.lineHeight || "DEFAULT";
        const textAlign = result.textAlign || "DEFAULT";
        const maxLineWidth = result.maxLineWidth || "DEFAULT";
  
        textAdjustmentsToggle.checked = adjustmentsEnabled;
        fontSizeSelect.value = fontSize;
        letterSpacingSelect.value = letterSpacing;
        lineHeightSelect.value = lineHeight;
        textAlignSelect.value = textAlign;
        maxLineWidthSelect.value = maxLineWidth;
  
        if (adjustmentsEnabled) {
          applyTextAdjustments();
        }
      }
    );
  
    // Listen for toggle changes.
    textAdjustmentsToggle.addEventListener("change", () => {
      const adjustmentsEnabled = textAdjustmentsToggle.checked;
      chrome.storage.local.set({ textAdjustmentsEnabled: adjustmentsEnabled });
      if (adjustmentsEnabled) {
        applyTextAdjustments();
      } else {
        removeAdjustmentStyle();
      }
    });
  
    // Listen for dropdown changes.
    fontSizeSelect.addEventListener("change", () => {
      chrome.storage.local.set({ fontSize: fontSizeSelect.value });
      applyTextAdjustments();
    });
    letterSpacingSelect.addEventListener("change", () => {
      chrome.storage.local.set({ letterSpacing: letterSpacingSelect.value });
      applyTextAdjustments();
    });
    lineHeightSelect.addEventListener("change", () => {
      chrome.storage.local.set({ lineHeight: lineHeightSelect.value });
      applyTextAdjustments();
    });
    textAlignSelect.addEventListener("change", () => {
      chrome.storage.local.set({ textAlign: textAlignSelect.value });
      applyTextAdjustments();
    });
    maxLineWidthSelect.addEventListener("change", () => {
      chrome.storage.local.set({ maxLineWidth: maxLineWidthSelect.value });
      applyTextAdjustments();
    });
  
    // Construct and inject the CSS based on the selected values.
    function applyTextAdjustments() {
      chrome.storage.local.get(
        ["textAdjustmentsEnabled", "fontSize", "letterSpacing", "lineHeight", "textAlign", "maxLineWidth"],
        (result) => {
          if (result.textAdjustmentsEnabled) {
            const fontSize = result.fontSize || "DEFAULT";
            const letterSpacing = result.letterSpacing || "DEFAULT";
            const lineHeight = result.lineHeight || "DEFAULT";
            const textAlign = result.textAlign || "DEFAULT";
            const maxLineWidth = result.maxLineWidth || "DEFAULT";
  
            let cssProperties = "";
  
            if (fontSize !== "DEFAULT" && fontSize.trim() !== "") {
              cssProperties += `font-size: ${fontSize}px !important;`;
            }
            if (letterSpacing !== "DEFAULT" && letterSpacing.trim() !== "") {
              cssProperties += `letter-spacing: ${letterSpacing}px !important;`;
            }
            if (lineHeight !== "DEFAULT" && lineHeight.trim() !== "") {
              cssProperties += `line-height: ${lineHeight} !important;`;
            }
            // For text alignment, if DEFAULT then inherit.
            if (textAlign === "DEFAULT" || textAlign.trim() === "") {
              cssProperties += `text-align: inherit !important;`;
            } else {
              cssProperties += `text-align: ${textAlign} !important;`;
            }
            if (maxLineWidth !== "DEFAULT" && maxLineWidth.trim() !== "") {
              cssProperties += `max-width: ${maxLineWidth}px !important;`;
            }
  
            const css = `* { ${cssProperties} }`;
            updateAdjustmentStyle(css);
          }
        }
      );
    }
  
    // Injects or updates a style element in the active tab.
    function updateAdjustmentStyle(css) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          function: (css) => {
            let styleElement = document.getElementById("customTextAdjustments");
            if (!styleElement) {
              styleElement = document.createElement("style");
              styleElement.id = "customTextAdjustments";
              document.head.appendChild(styleElement);
            }
            styleElement.innerHTML = css;
          },
          args: [css]
        });
      });
    }
  
    // Removes the injected style element.
    function removeAdjustmentStyle() {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          function: () => {
            const styleElement = document.getElementById("customTextAdjustments");
            if (styleElement) {
              styleElement.remove();
            }
          }
        });
      });
    }
  }