chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "readText" && message.text) {
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
    }
});
