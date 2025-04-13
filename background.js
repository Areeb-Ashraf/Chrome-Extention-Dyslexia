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

// Load TTS state from storage
chrome.storage.local.get({ ttsEnabled: false }, (data) => {
    isTTSActive = data.ttsEnabled;
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    try {
        if (message.action === "toggleTTS") {
            isTTSActive = message.state;
            chrome.storage.local.set({ ttsEnabled: isTTSActive }); // Save state in storage
            console.log(`Text-to-Speech is now ${isTTSActive ? "ON" : "OFF"}`);
            sendResponse({ success: true });
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
            sendResponse({ success: true });
        } else if (message.action === "stopReading") {
            chrome.tts.stop();
            console.log("Reading stopped.");
            sendResponse({ success: true });
        } else {
            // Any other messages just acknowledge receipt
            sendResponse({ success: true, unhandled: true });
        }
    } catch (error) {
        console.error("Error handling message:", error);
        sendResponse({ success: false, error: error.message });
    }
    
    // Return true to indicate we will send a response asynchronously
    return true;
});