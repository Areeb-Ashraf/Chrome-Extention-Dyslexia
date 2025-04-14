let isSpeaking = false;
let currentUtterance = null;

export function initializeReadAloud() {
  const playBtn = document.getElementById("readAloudToggle");
  const voiceSelect = document.getElementById("ttsVoiceSelect");
  const speedSlider = document.getElementById("speedSlider");
  const speedValue = document.getElementById("speedValue");

  let voices = [];

  function populateVoices() {
    voices = speechSynthesis.getVoices();
    voiceSelect.innerHTML = "";
    voices.forEach((voice, index) => {
      const option = document.createElement("option");
      option.value = index;
      option.textContent = `${voice.name} (${voice.lang})`;
      voiceSelect.appendChild(option);
    });
  }

  // Load voices initially and on change
  if (speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = populateVoices;
  }
  populateVoices();

  speedSlider.addEventListener("input", () => {
    speedValue.textContent = `${speedSlider.value}x`;
  });

  playBtn.addEventListener("click", () => {
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
      isSpeaking = false;
      playBtn.innerHTML = `<span style="display: inline-block; transform: translateX(2px);">▶</span>`;
      return;
    }

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        func: () => window.getSelection().toString().trim()
      }, (results) => {
        const selectedText = results[0].result;
        if (!selectedText) {
          alert("Please highlight some text.");
          return;
        }

        const selectedVoice = speechSynthesis.getVoices()[voiceSelect.value];
        const speed = parseFloat(speedSlider.value);
        const utterance = new SpeechSynthesisUtterance(selectedText);
        utterance.voice = selectedVoice;
        utterance.rate = speed;

        playBtn.innerHTML = `⏸`;

        speechSynthesis.speak(utterance);
        isSpeaking = true;
        currentUtterance = utterance;

        utterance.onend = () => {
          isSpeaking = false;
          playBtn.innerHTML = `<span style="display: inline-block; transform: translateX(2px);">▶</span>`;
        };
      });
    });
  });
}
