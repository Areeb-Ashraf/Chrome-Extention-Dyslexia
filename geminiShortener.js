export function initializeGeminiShortener() {
    const geminiShortenButton = document.getElementById("geminiShortenButton");

    geminiShortenButton.addEventListener("click", () => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.scripting.executeScript({
                target: { tabId: tabs[0].id },
                function: () => {
                    const selection = window.getSelection();
                    if (selection.rangeCount > 0) {
                        const selectedText = selection.toString().trim();
                        if (selectedText) {
                            chrome.storage.sync.get('geminiApiKey', (data) => {
                                const apiKey = data.geminiApiKey;
                                if (apiKey) {
                                    const prompt = `Shorten the following text to make it easier for people with dyslexia to read: ${selectedText}`;
                                    fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
                                        method: 'POST',
                                        headers: {
                                            'Content-Type': 'application/json',
                                        },
                                        body: JSON.stringify({
                                            contents: [{
                                                parts: [{ text: prompt }],
                                            }],
                                        }),
                                    })
                                        .then((response) => response.json())
                                        .then((data) => {
                                            if (data.candidates && data.candidates.length > 0 && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts.length > 0) {
                                                const shortenedText = data.candidates[0].content.parts[0].text;
                                                const range = selection.getRangeAt(0);
                                                range.deleteContents();
                                                range.insertNode(document.createTextNode(shortenedText));
                                            } else {
                                                alert('Failed to shorten text.');
                                            }
                                        })
                                        .catch((error) => {
                                            console.error('Error shortening text:', error);
                                            alert('An error occurred while shortening text.');
                                        });
                                } else {
                                    alert('Please enter your Gemini API key in the extension options.');
                                }
                            });
                        }
                    }
                },
            });
        });
    });
}