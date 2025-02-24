chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "dyslexiaOptions",
        title: "Dyslexia Toolkit Options",
        contexts: ["browser_action"]
    });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "dyslexiaOptions") {
        chrome.runtime.openOptionsPage();
    }
});

let isTTSActive = false;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "toggleTTS") {
        isTTSActive = message.state;
        chrome.storage.local.set({ ttsEnabled: isTTSActive }); // Save state in storage
        console.log(`Text-to-Speech is now ${isTTSActive ? "ON" : "OFF"}`);
    } else if (message.action === "readText" && message.text && isTTSActive) {
        chrome.tts.speak(message.text, {
            rate: 1.0,
            pitch: 1.0,
            volume: 1.0,
            onEvent: (event) => {
                if (event.type === "end") {
                    console.log("Finished reading text.");
                }
            }
        });
    } else if (message.action === "stopReading") {
        chrome.tts.stop();
        console.log("Reading stopped.");
    }
});