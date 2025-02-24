export function initializeColorOverlay() {
    const overlayToggle = document.getElementById("overlayToggle");
    const overlayColor = document.getElementById("overlayColor");
    const overlayOpacity = document.getElementById("overlayOpacity");

    // Load stored preferences
    chrome.storage.local.get(["overlayEnabled", "overlayColor", "overlayOpacity"], (result) => {
        const isEnabled = result.overlayEnabled || false;
        const color = result.overlayColor || "#ffffff";
        const opacity = result.overlayOpacity || 0.2;

        overlayToggle.checked = isEnabled;
        overlayColor.value = color;
        overlayOpacity.value = opacity;

        if (isEnabled) {
            applyOverlay(color, opacity);
        }
    });

    // Listen for toggle changes
    overlayToggle.addEventListener("change", () => {
        const isEnabled = overlayToggle.checked;
        chrome.storage.local.set({ overlayEnabled: isEnabled });
        if (isEnabled) {
            applyOverlay(overlayColor.value, overlayOpacity.value);
        } else {
            removeOverlay();
        }
    });

    // Listen for color changes
    overlayColor.addEventListener("change", () => {
        const color = overlayColor.value;
        chrome.storage.local.set({ overlayColor: color });
        if (overlayToggle.checked) {
            applyOverlay(color, overlayOpacity.value);
        }
    });

    // Listen for opacity changes
    overlayOpacity.addEventListener("change", () => {
        const opacity = overlayOpacity.value;
        chrome.storage.local.set({ overlayOpacity: opacity });
        if (overlayToggle.checked) {
            applyOverlay(overlayColor.value, opacity);
        }
    });

    function applyOverlay(color, opacity) {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.scripting.executeScript({
                target: { tabId: tabs[0].id },
                function: (color, opacity) => {
                    let overlay = document.getElementById("dyslexiaOverlay");
                    if (!overlay) {
                        overlay = document.createElement("div");
                        overlay.id = "dyslexiaOverlay";
                        document.body.appendChild(overlay);
                        overlay.style.position = "fixed";
                        overlay.style.top = "0";
                        overlay.style.left = "0";
                        overlay.style.width = "100%";
                        overlay.style.height = "100%";
                        overlay.style.pointerEvents = "none";
                        overlay.style.zIndex = "999999";
                    }
                    overlay.style.backgroundColor = color;
                    overlay.style.opacity = opacity;
                },
                args: [color, parseFloat(opacity)]
            });
        });
    }

    function removeOverlay() {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.scripting.executeScript({
                target: { tabId: tabs[0].id },
                function: () => {
                    const overlay = document.getElementById("dyslexiaOverlay");
                    if (overlay) {
                        overlay.remove();
                    }
                }
            });
        });
    }
}