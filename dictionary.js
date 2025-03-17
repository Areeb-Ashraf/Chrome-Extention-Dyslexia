export function initializeDictionaryLookup() {
    const dictionaryLookupButton = document.getElementById("dictionaryLookupButton");
  
    dictionaryLookupButton.addEventListener("click", () => {
      // Get the highlighted text from the active tab.
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          function: () => {
            // Return the current selection.
            return window.getSelection().toString().trim();
          }
        }, (injectionResults) => {
          if (chrome.runtime.lastError) {
            alert("Error retrieving selection: " + chrome.runtime.lastError.message);
            return;
          }
          // Get the result from the first injected script.
          const selectedText = injectionResults[0].result;
          if (!selectedText) {
            alert("No text selected. Please highlight a single word.");
            return;
          }
          // Split the text by whitespace.
          const words = selectedText.split(/\s+/);
          if (words.length !== 1) {
            alert("Please select a single word only.");
            return;
          }
          const word = words[0];
  
          // Use the free Dictionary API to look up the definition.
          fetch("https://api.dictionaryapi.dev/api/v2/entries/en/" + encodeURIComponent(word))
            .then(response => {
              if (!response.ok) {
                throw new Error("Word not found.");
              }
              return response.json();
            })
            .then(data => {
              if (Array.isArray(data) && data.length > 0) {
                // Try to extract the first definition.
                const entry = data[0];
                let definition = "";
                if (entry.meanings && entry.meanings.length > 0) {
                  const meaning = entry.meanings[0];
                  if (meaning.definitions && meaning.definitions.length > 0) {
                    definition = meaning.definitions[0].definition;
                  }
                }
                if (definition) {
                  alert("Definition of " + word + ":\n" + definition);
                } else {
                  alert("No definition found for \"" + word + "\".");
                }
              } else {
                alert("No definition found for \"" + word + "\".");
              }
            })
            .catch(error => {
              alert("Error: " + error.message);
            });
        });
      });
    });
  }
  