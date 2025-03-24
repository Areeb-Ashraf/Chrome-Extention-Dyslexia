export function initializeReadAloud() {
    const readAloudButton = document.getElementById("readAloudToggle");

    // Retrieve stored TTS state and update UI on popup load
    chrome.storage.local.get(["ttsEnabled"], (result) => {
        const isTTSActive = result.ttsEnabled || false;
        readAloudButton.textContent = isTTSActive ? "Toggle Off Highlighted Text-to-Speech" : "Toggle On Highlighted Text-to-Speech";
    });

    readAloudButton.addEventListener("click", () => {
        chrome.storage.local.get(["ttsEnabled"], (result) => {
            const isTTSActive = !result.ttsEnabled;
            chrome.runtime.sendMessage({ action: "toggleTTS", state: isTTSActive });

            // Update button text
            readAloudButton.textContent = isTTSActive ? "Toggle Off Highlighted Text-to-Speech" : "Toggle On Highlighted Text-to-Speech";

            // Save new state
            chrome.storage.local.set({ ttsEnabled: isTTSActive });

            if (!isTTSActive) {
                chrome.runtime.sendMessage({ action: "stopReading" });
                // Remove the speaker icon when TTS is turned off.
                chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                    chrome.scripting.executeScript({
                        target: { tabId: tabs[0].id },
                        function: removeSpeakerIcon
                    });
                });
            } else {
                // Add the speaker icon when TTS is enabled.
                chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                    chrome.scripting.executeScript({
                        target: { tabId: tabs[0].id },
                        function: attachSpeakerIcon,
                        args: [chrome.runtime.getURL("speaker.png")]
                    });
                });
            }
        });
    });

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            function: () => {
                let previousText = "";
                function checkSelection() {
                    chrome.storage.local.get(["ttsEnabled"], (result) => {
                        if (!result.ttsEnabled) return; // Do nothing if TTS is off

                        const selectedText = window.getSelection().toString().trim();
                        if (selectedText && selectedText !== previousText) {
                            previousText = selectedText;
                            chrome.runtime.sendMessage({ action: "readText", text: selectedText });
                        } else if (!selectedText && previousText) {
                            previousText = "";
                            chrome.runtime.sendMessage({ action: "stopReading" });
                        }
                    });
                }
                document.addEventListener("selectionchange", checkSelection);
            }
        });
    });
}

// Function that injects a small speaker icon that follows the mouse cursor.
function attachSpeakerIcon() {
    if (document.getElementById("speakerIcon")) return;
    const indicator = document.createElement("div");
    indicator.id = "speakerIcon";
    // Instead of an image, we use a Unicode speaker emoji.
    indicator.textContent = "🔊";
    indicator.style.position = "fixed";
    indicator.style.fontSize = "16px"; // adjust size as needed
    indicator.style.pointerEvents = "none";
    indicator.style.zIndex = "1000000";
    indicator.style.textAlign = "center";
    indicator.style.lineHeight = "20px";

    document.body.appendChild(indicator);

    window.speakerIconMouseMove = function(e) {
        // Offset the icon slightly so it doesn't obscure the pointer.
        indicator.style.left = (e.clientX + 5) + "px";
        indicator.style.top = (e.clientY + -10) + "px";
    };
    document.addEventListener("mousemove", window.speakerIconMouseMove);
}

// Function to remove the speaker icon and its associated mousemove listener.
function removeSpeakerIcon() {
    const img = document.getElementById("speakerIcon");
    if (img) {
        img.remove();
    }
    if (window.speakerIconMouseMove) {
        document.removeEventListener("mousemove", window.speakerIconMouseMove);
        delete window.speakerIconMouseMove;
    }
}