export function initializeSyllableSplitter() {
    const syllableButton = document.getElementById("syllableButton");
  
    syllableButton.addEventListener("click", () => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          function: () => {
            // Syllable splitting function.
            function breakIntoSyllables(word) {
              const wordEndingRule = /(?<=ck)(?=le)|(?=\w(?<![aeiou]|ck)le)/g;
              const consonantRule = /(?<=[aeiouy]\w?)(?=\w(?<!sh|ch|th|wh|ck|ph|ng)[aeiouy])/g;
              const [mainWord, wordEnding] = word.split(wordEndingRule);
              const syllables = mainWord.split(consonantRule);
              if (wordEnding) syllables.push(wordEnding);
              return syllables;
            }
  
            // Get current selection
            const selection = window.getSelection();
            if (selection.rangeCount === 0) return;
            const range = selection.getRangeAt(0);
            const selectedText = selection.toString().trim();
            if (!selectedText) return;
  
            // Check if the selection is already wrapped in our undoable span.
            const container = range.startContainer.parentElement;
            if (container && container.tagName === "SPAN" && container.hasAttribute("data-original-text")) {
              // Undo: restore the original text.
              container.textContent = container.getAttribute("data-original-text");
              container.removeAttribute("data-original-text");
            } else {
              // Create a wrapper span and store the original text for undo.
              const wrapper = document.createElement("span");
              wrapper.setAttribute("data-original-text", selectedText);
  
              // Process each word to insert syllable breaks.
              const words = selectedText.split(/\s+/);
              const syllableWords = words.map(word => breakIntoSyllables(word).join("/"));
              const syllableText = syllableWords.join(" ");
  
              wrapper.textContent = syllableText;
  
              // Replace the selected text with the new span.
              range.deleteContents();
              range.insertNode(wrapper);
            }
  
            // Clear selection so the user must re-highlight for further actions.
            selection.removeAllRanges();
          }
        });
      });
    });
  }