export function initializeReadAloud() {
    const readAloudButton = document.getElementById("readAloud");

    readAloudButton.addEventListener("click", () => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.scripting.executeScript({
                target: { tabId: tabs[0].id },
                function: () => {
                    const selectedText = window.getSelection().toString().trim();
                    if (selectedText) {
                        chrome.runtime.sendMessage({ action: "readText", text: selectedText });
                    } else {
                        alert("Please select text to read aloud.");
                    }
                }
            });
        });
    });
}
