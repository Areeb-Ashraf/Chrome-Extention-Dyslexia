export function initializeTextAdjuster() {
    const textAdjustmentsToggle = document.getElementById("textAdjustmentsToggle");
    const fontSizeInput = document.getElementById("fontSizeInput");
    const letterSpacingInput = document.getElementById("letterSpacingInput");
    const lineHeightInput = document.getElementById("lineHeightInput");
    const textAlignSelect = document.getElementById("textAlignSelect");
    const maxLineWidthInput = document.getElementById("maxLineWidthInput");

    // Load stored values or use defaults
    chrome.storage.local.get(
        ["textAdjustmentsEnabled", "fontSize", "letterSpacing", "lineHeight", "textAlign", "maxLineWidth"],
        (result) => {
            const adjustmentsEnabled = result.textAdjustmentsEnabled !== undefined ? result.textAdjustmentsEnabled : false;
            const fontSize = result.fontSize || "16";
            const letterSpacing = result.letterSpacing || "0";
            const lineHeight = result.lineHeight || "1.5";
            const textAlign = result.textAlign || "DEFAULT";
            const maxLineWidth = result.maxLineWidth || "800";

            textAdjustmentsToggle.checked = adjustmentsEnabled;
            fontSizeInput.value = fontSize;
            letterSpacingInput.value = letterSpacing;
            lineHeightInput.value = lineHeight;
            textAlignSelect.value = textAlign;
            maxLineWidthInput.value = maxLineWidth;

            // Apply adjustments if enabled
            if (adjustmentsEnabled) {
                applyTextAdjustments();
            }
        }
    );

    // Listen for toggle changes
    textAdjustmentsToggle.addEventListener("change", () => {
        const adjustmentsEnabled = textAdjustmentsToggle.checked;
        chrome.storage.local.set({ textAdjustmentsEnabled: adjustmentsEnabled });
        if (adjustmentsEnabled) {
            applyTextAdjustments();
        } else {
            removeAdjustmentStyle();
        }
    });

    // Listen for changes in each control
    fontSizeInput.addEventListener("change", () => {
        chrome.storage.local.set({ fontSize: fontSizeInput.value });
        applyTextAdjustments();
    });

    letterSpacingInput.addEventListener("change", () => {
        chrome.storage.local.set({ letterSpacing: letterSpacingInput.value });
        applyTextAdjustments();
    });

    lineHeightInput.addEventListener("change", () => {
        chrome.storage.local.set({ lineHeight: lineHeightInput.value });
        applyTextAdjustments();
    });

    textAlignSelect.addEventListener("change", () => {
        chrome.storage.local.set({ textAlign: textAlignSelect.value });
        applyTextAdjustments();
    });
    
    maxLineWidthInput.addEventListener("change", () => {
        chrome.storage.local.set({ maxLineWidth: maxLineWidthInput.value });
        applyTextAdjustments();
    });

    // Function to construct and inject the CSS for text adjustments
    function applyTextAdjustments() {
        chrome.storage.local.get(
            ["textAdjustmentsEnabled", "fontSize", "letterSpacing", "lineHeight", "textAlign", "maxLineWidth"],
            (result) => {
                if (result.textAdjustmentsEnabled) {
                    const fontSize = result.fontSize || "16";
                    const letterSpacing = result.letterSpacing || "0";
                    const lineHeight = result.lineHeight || "1.5";
                    const textAlign = result.textAlign || "DEFAULT";
                    const maxLineWidth = result.maxLineWidth || "800";

                    let cssProperties = "";

                    if (fontSize.toUpperCase() !== "DEFAULT" && fontSize.trim() !== "") {
                        cssProperties += `font-size: ${fontSize}px !important;`;
                    }
                    if (letterSpacing.toUpperCase() !== "DEFAULT" && letterSpacing.trim() !== "") {
                        cssProperties += `letter-spacing: ${letterSpacing}px !important;`;
                    }
                    if (lineHeight.toUpperCase() !== "DEFAULT" && lineHeight.trim() !== "") {
                        cssProperties += `line-height: ${lineHeight} !important;`;
                    }
                    if (textAlign.toUpperCase() !== "DEFAULT" && textAlign.trim() !== "") {
                        cssProperties += `text-align: ${textAlign} !important;`;
                    }
                    if (maxLineWidth.toUpperCase() !== "DEFAULT" && maxLineWidth.trim() !== "") {
                        cssProperties += `max-width: ${maxLineWidth}px !important;`;
                    }

                    const css = `
                        * {
                            ${cssProperties}
                        }
                    `;
                    updateAdjustmentStyle(css);
                }
            }
        );
    }

    // Injects or updates a <style> element in the active tab with the given CSS.
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

    // Removes the injected style element from the active tab.
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