export function initializeTextAdjuster() {
    const textAdjustmentsToggle = document.getElementById("textAdjustmentsToggle");
    const fontSizeInput = document.getElementById("fontSizeInput");
    const letterSpacingInput = document.getElementById("letterSpacingInput");
    const lineHeightInput = document.getElementById("lineHeightInput");
    const textAlignSelect = document.getElementById("textAlignSelect");

    // Load stored values or use defaults
    chrome.storage.local.get(
        ["textAdjustmentsEnabled", "fontSize", "letterSpacing", "lineHeight", "textAlign"],
        (result) => {
            const adjustmentsEnabled = result.textAdjustmentsEnabled !== undefined ? result.textAdjustmentsEnabled : false;
            const fontSize = result.fontSize || "16";
            const letterSpacing = result.letterSpacing || "0";
            const lineHeight = result.lineHeight || "1.5";
            const textAlign = result.textAlign || "initial";

            textAdjustmentsToggle.checked = adjustmentsEnabled;
            fontSizeInput.value = fontSize;
            letterSpacingInput.value = letterSpacing;
            lineHeightInput.value = lineHeight;
            textAlignSelect.value = textAlign;

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
        const fontSize = fontSizeInput.value;
        chrome.storage.local.set({ fontSize });
        applyTextAdjustments();
    });

    letterSpacingInput.addEventListener("change", () => {
        const letterSpacing = letterSpacingInput.value;
        chrome.storage.local.set({ letterSpacing });
        applyTextAdjustments();
    });

    lineHeightInput.addEventListener("change", () => {
        const lineHeight = lineHeightInput.value;
        chrome.storage.local.set({ lineHeight });
        applyTextAdjustments();
    });

    textAlignSelect.addEventListener("change", () => {
        const textAlign = textAlignSelect.value;
        chrome.storage.local.set({ textAlign });
        applyTextAdjustments();
    });

    // Function to construct and inject the CSS for text adjustments
    function applyTextAdjustments() {
        chrome.storage.local.get(
            ["textAdjustmentsEnabled", "fontSize", "letterSpacing", "lineHeight", "textAlign"],
            (result) => {
                if (result.textAdjustmentsEnabled) {
                    const fontSize = result.fontSize || "16";
                    const letterSpacing = result.letterSpacing || "0";
                    const lineHeight = result.lineHeight || "1.5";
                    const textAlign = result.textAlign || "initial";

                    const css = `
                        * {
                            font-size: ${fontSize}px !important;
                            letter-spacing: ${letterSpacing}px !important;
                            line-height: ${lineHeight} !important;
                            text-align: ${textAlign} !important;
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