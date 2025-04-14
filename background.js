let isTTSActive = false;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "toggleTTS") {
    isTTSActive = message.state;
    chrome.storage.local.set({ ttsEnabled: isTTSActive });
  }

  else if (message.action === "readText" && message.text) {
    chrome.tts.getVoices((voices) => {
      const voice = voices[message.voiceIndex] || voices[0];
      chrome.tts.speak(message.text, {
        voiceName: voice.voiceName,
        rate: message.speed || 1.0,
        pitch: 1.0,
        volume: 1.0
      });
    });
  }

  else if (message.action === "stopReading") {
    chrome.tts.stop();
  }
});
