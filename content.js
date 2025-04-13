document.addEventListener("mouseup", () => {
    const selectedText = window.getSelection().toString().trim();
    if (selectedText) {
        try {
            chrome.runtime.sendMessage({ action: "readText", text: selectedText }, (response) => {
                // Handle response if needed
                if (chrome.runtime.lastError) {
                    console.debug('Chrome runtime error:', chrome.runtime.lastError.message);
                    // Don't throw errors here, just log them - this is expected behavior when extension context changes
                }
            });
        } catch (error) {
            // Just log the error, don't break the page
            console.debug('Error sending message to extension:', error);
        }
    }
});
