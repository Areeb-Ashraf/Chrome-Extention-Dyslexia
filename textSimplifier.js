export function initializeTextSimplifier() {
    const simplifyButton = document.getElementById("geminiShortenButton");

    simplifyButton.addEventListener("click", () => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.scripting.executeScript({
                target: { tabId: tabs[0].id },
                function: async () => {
                    const selection = window.getSelection();
                    if (selection.rangeCount > 0) {
                        const selectedText = window.getSelection().toString().trim();
                        if (selectedText) {
                            try {
                                // Get API key from storage
                                const keys = await new Promise((resolve) => {
                                    chrome.storage.sync.get(['openaiApiKey'], resolve);
                                });
                                
                                // Check if OpenAI API key is available
                                if (keys.openaiApiKey) {
                                    // Insert loading indicator where the text was
                                    const range = selection.getRangeAt(0);
                                    const loadingEl = document.createElement('span');
                                    loadingEl.textContent = "Simplifying text...";
                                    loadingEl.style.backgroundColor = "#f0f8ff";
                                    loadingEl.style.color = "#0066cc";
                                    loadingEl.style.padding = "2px 4px";
                                    loadingEl.style.borderRadius = "3px";
                                    loadingEl.style.display = "inline-block";
                                    loadingEl.setAttribute('id', 'dyslexia-extension-loading');
                                    
                                    range.deleteContents();
                                    range.insertNode(loadingEl);
                                    
                                    // Call OpenAI to simplify the text
                                    await simplifyWithOpenAI(keys.openaiApiKey, selectedText);
                                } else {
                                    alert('Please enter your OpenAI API key in the extension options.');
                                }
                            } catch (error) {
                                console.error('Error in text simplification:', error);
                                alert('An error occurred: ' + error.message);
                                
                                // Remove loading indicator if there was an error
                                const loadingEl = document.getElementById('dyslexia-extension-loading');
                                if (loadingEl) {
                                    loadingEl.textContent = selectedText;
                                    // Remove styling
                                    loadingEl.removeAttribute('style');
                                    loadingEl.removeAttribute('id');
                                }
                            }
                        }
                    }
                    
                    // Function to handle OpenAI API
                    async function simplifyWithOpenAI(apiKey, text) {
                        try {
                            const prompt = `Simplify the following text to make it easier for people with dyslexia to read. Use short sentences, simple words, and clear structure: ${text}`;
                            
                            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${apiKey}`
                                },
                                body: JSON.stringify({
                                    model: "gpt-3.5-turbo",
                                    messages: [
                                        {
                                            role: "system",
                                            content: "You are a helpful assistant that simplifies text for people with dyslexia. Use short sentences, simple words, and clear structure."
                                        },
                                        {
                                            role: "user",
                                            content: prompt
                                        }
                                    ],
                                    max_tokens: 1024,
                                    temperature: 0.3
                                })
                            });
                            
                            // Check if response is ok
                            if (!response.ok) {
                                const errorText = await response.text();
                                console.error('OpenAI API Error Response:', errorText);
                                
                                try {
                                    const errorData = JSON.parse(errorText);
                                    throw new Error(`OpenAI API Error: ${errorData.error?.message || 'Unknown error'}`);
                                } catch (e) {
                                    throw new Error(`HTTP error! Status: ${response.status}`);
                                }
                            }
                            
                            const responseData = await response.json();
                            console.log('OpenAI API Response:', responseData);
                            
                            if (responseData.choices && responseData.choices.length > 0 && 
                                responseData.choices[0].message && responseData.choices[0].message.content) {
                                const simplifiedText = responseData.choices[0].message.content.trim();
                                
                                // Replace loading indicator with simplified text
                                const loadingEl = document.getElementById('dyslexia-extension-loading');
                                if (loadingEl) {
                                    loadingEl.textContent = simplifiedText;
                                    // Change styling to indicate success
                                    loadingEl.style.backgroundColor = "#f0fff0";
                                    loadingEl.style.color = "#006600";
                                    
                                    // Remove styling after a short delay for a smooth transition
                                    setTimeout(() => {
                                        // Create a text node with the simplified text
                                        const textNode = document.createTextNode(simplifiedText);
                                        // Replace the loading element with the text node
                                        loadingEl.parentNode.replaceChild(textNode, loadingEl);
                                    }, 1500);
                                }
                            } else {
                                throw new Error('Invalid response format from OpenAI API');
                            }
                        } catch (error) {
                            console.error('Error in OpenAI text simplification:', error);
                            throw error;
                        }
                    }
                },
            });
        });
    });
}