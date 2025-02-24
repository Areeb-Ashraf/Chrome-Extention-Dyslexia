export function initializeFontSwitcher() {
    const fontSelect = document.getElementById("fontSelect");
    const fontSwitcherToggle = document.getElementById("fontSwitcherToggle");

    // Load stored preferences (if any)
    chrome.storage.local.get(["fontSwitcherEnabled", "selectedFont"], (result) => {
        const isEnabled = result.fontSwitcherEnabled !== undefined ? result.fontSwitcherEnabled : false;
        const selectedFont = result.selectedFont || "OpenDyslexic";
        
        fontSwitcherToggle.checked = isEnabled;
        fontSelect.value = selectedFont;
        
        if (isEnabled) {
            applyFont(selectedFont);
        }
    });

    // Listen for font selection changes
    fontSelect.addEventListener("change", () => {
        const selectedFont = fontSelect.value;
        chrome.storage.local.set({ selectedFont });
        if (fontSwitcherToggle.checked) {
            applyFont(selectedFont);
        }
    });

    // Listen for toggle changes
    fontSwitcherToggle.addEventListener("change", () => {
        const isEnabled = fontSwitcherToggle.checked;
        chrome.storage.local.set({ fontSwitcherEnabled: isEnabled });
        if (isEnabled) {
            const selectedFont = fontSelect.value;
            applyFont(selectedFont);
        } else {
            removeFont();
        }
    });

    // Function to inject/update the style tag with the chosen font
    function applyFont(font) {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.scripting.executeScript({
                target: { tabId: tabs[0].id },
                function: (font) => {
                    let styleElement = document.getElementById("customFontStyle");
                    if (!styleElement) {
                        styleElement = document.createElement("style");
                        styleElement.id = "customFontStyle";
                        document.head.appendChild(styleElement);
                    }
                    styleElement.innerHTML = `* { font-family: '${font}', sans-serif !important; }`;
                },
                args: [font]
            });
        });
    }

    // Function to remove the injected custom font style
    function removeFont() {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.scripting.executeScript({
                target: { tabId: tabs[0].id },
                function: () => {
                    const styleElement = document.getElementById("customFontStyle");
                    if (styleElement) {
                        styleElement.remove();
                    }
                }
            });
        });
    }
}