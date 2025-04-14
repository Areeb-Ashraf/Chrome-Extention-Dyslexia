export function initializeTextSimplifier() {
    const simplifyButton = document.getElementById("geminiShortenButton");
    const resultBox = document.getElementById("result22");
    const inputBox = document.getElementById("chatInput");
  
    simplifyButton.addEventListener("click", () => {
      const inputText = inputBox.value.trim();
  
      if (inputText) {
        // Use the input directly
        simplifyTextAndShow(inputText);
      } else {
        // Try getting selected text from the webpage
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            func: () => window.getSelection().toString().trim()
          }, (results) => {
            const selectedText = results?.[0]?.result;
            if (selectedText) {
              simplifyTextAndShow(selectedText);
            } else {
              resultBox.textContent = "Please enter text or highlight something on the page.";
              resultBox.style.display = "block";
            }
          });
        });
      }
    });
  
    async function simplifyTextAndShow(text) {
      resultBox.textContent = "Simplifying...";
      resultBox.style.display = "block";
  
      try {
        const keys = await new Promise(resolve => {
          chrome.storage.sync.get(['openaiApiKey'], resolve);
        });
  
        if (!keys.openaiApiKey) {
          resultBox.textContent = "OpenAI API key not set in options.";
          return;
        }
  
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${keys.openaiApiKey}`
          },
          body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [
              {
                role: "system",
                content: "You simplify text for people with dyslexia. Use short, clear sentences."
              },
              {
                role: "user",
                content: `Simplify this: ${text}`
              }
            ],
            max_tokens: 1024,
            temperature: 0.3
          })
        });
  
        if (!response.ok) {
          const errorText = await response.text();
          resultBox.textContent = `Error: ${errorText}`;
          return;
        }
  
        const data = await response.json();
        const simplified = data.choices?.[0]?.message?.content?.trim();
        resultBox.textContent = simplified || "No response received.";
      } catch (err) {
        resultBox.textContent = "Error: " + err.message;
      }
    }
  }
  