export function initializeDictionaryLookup() {
  const dictionaryLookupButton = document.getElementById("dictionaryLookupButton");
  const wordInput = document.getElementById("wordInput");
  const resultBox = document.getElementById("result1");
  const defList = document.getElementById("definitionList");
  const posText = document.getElementById("partOfSpeechText");
  const audioSection = document.getElementById("audioSection");
  const playAudioBtn = document.getElementById("playAudio");
  let currentAudio = null;

  dictionaryLookupButton.addEventListener("click", () => {
    let word = wordInput.value.trim();
    console.log("Input word:", word);  // ✅ Log input

    if (!word) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          function: () => window.getSelection().toString().trim()
        }, (injectionResults) => {
          if (chrome.runtime.lastError) {
            console.error("Error retrieving selection: " + chrome.runtime.lastError.message);
            return;
          }

          const selectedText = injectionResults[0].result;
          if (selectedText) {
            word = selectedText;
            wordInput.value = word;
            console.log("Selected word:", word); // ✅ Log selected word
          }

          fetchDefinition(word);
        });
      });
    } else {
      fetchDefinition(word);
    }
  });

  function fetchDefinition(word) {
    fetch("https://api.dictionaryapi.dev/api/v2/entries/en/" + encodeURIComponent(word))
      .then(response => {
        if (!response.ok) {
          throw new Error("Word not found.");
        }
        return response.json();
      })
      .then(data => {
        console.log("API response:", data); // ✅ Log full response

        defList.innerHTML = '';
        posText.textContent = '';
        audioSection.style.display = "none";
        resultBox.style.display = "none";

        if (Array.isArray(data) && data.length > 0) {
          const entry = data[0];
          let definition = "";
          if (entry.meanings && entry.meanings.length > 0) {
            const meaning = entry.meanings[0];
            if (meaning.definitions && meaning.definitions.length > 0) {
              definition = meaning.definitions[0].definition;
            }
          }

          if (definition) {
            defList.innerHTML = `<span>${definition}</span>`;
            posText.textContent = entry.meanings[0]?.partOfSpeech || "No part of speech found";
            resultBox.style.display = "block";
          } else {
            defList.innerHTML = `<span>No definition found for "${word}".</span>`;
            posText.textContent = "";
            resultBox.style.display = "block";
          }

          const phonetics = entry.phonetics || [];
          const audioSrc = phonetics.find(p => p.audio)?.audio;
          if (audioSrc) {
            currentAudio = new Audio(audioSrc);
            audioSection.style.display = "block";
          } else {
            currentAudio = null;
            audioSection.style.display = "none";
          }

        } else {
          defList.innerHTML = `<span>No definition found for "${word}".</span>`;
          posText.textContent = "";
          resultBox.style.display = "block";
        }
      })
      .catch(error => {
        defList.innerHTML = `<span>Error: ${error.message}</span>`;
        posText.textContent = "";
        resultBox.style.display = "block";
      });
  }

  playAudioBtn.addEventListener("click", () => {
    if (currentAudio) currentAudio.play();
  });
}
