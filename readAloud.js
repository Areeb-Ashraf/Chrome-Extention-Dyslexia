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

            // Stop reading if toggled off
            if (!isTTSActive) {
                chrome.runtime.sendMessage({ action: "stopReading" });
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