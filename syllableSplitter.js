export function initializeSyllableSplitter() {
    const syllableButton = document.getElementById("syllableButton");
    const resultBox = document.getElementById("result");
  
    syllableButton.addEventListener("click", () => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          func: () => {
            function breakIntoSyllables(word) {
              const wordEndingRule = /(?<=ck)(?=le)|(?=\w(?<![aeiou]|ck)le)/g;
              const consonantRule = /(?<=[aeiouy]\w?)(?=\w(?<!sh|ch|th|wh|ck|ph|ng)[aeiouy])/g;
              const [mainWord, wordEnding] = word.split(wordEndingRule);
              const syllables = mainWord.split(consonantRule);
              if (wordEnding) syllables.push(wordEnding);
              return syllables;
            }
  
            const markerId = "syllable-span-marker";
            const existingSpan = document.getElementById(markerId);
  
            if (existingSpan) {
              const original = existingSpan.getAttribute("data-original");
              const textNode = document.createTextNode(original);
              existingSpan.replaceWith(textNode);
              return { mode: "revert", result: original };
            } else {
              const selection = window.getSelection();
              if (!selection.rangeCount) return;
  
              const range = selection.getRangeAt(0);
              const selectedText = selection.toString().trim();
              if (!selectedText) return;
  
              const words = selectedText.split(/\s+/);
              const syllableWords = words.map(word => breakIntoSyllables(word).join("/"));
              const syllableText = syllableWords.join(" ");
  
              const span = document.createElement("span");
              span.id = markerId;
              span.textContent = syllableText;
              span.setAttribute("data-original", selectedText);
  
              range.deleteContents();
              range.insertNode(span);
  
              return { mode: "split", result: syllableText };
            }
          }
        }, (results) => {
          const response = results[0]?.result;
          const mode = results[0]?.result?.mode || results[0]?.mode;
          const value = typeof response === "object" ? response.result : response;
  
          if (!response) return;
  
          if (mode === "split") {
            resultBox.style.display = "block";
            resultBox.innerText = "Syllables: " + value;
          } else if (mode === "revert") {
            resultBox.style.display = "none";
          }
        });
      });
    });
  }
  