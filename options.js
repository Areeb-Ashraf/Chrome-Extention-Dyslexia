document.addEventListener('DOMContentLoaded', () => {
    const openaiApiKeyInput = document.getElementById('openaiApiKey');
    const saveButton = document.getElementById('saveApiKeys');
    const statusDiv = document.getElementById('status');

    // Load saved API key
    chrome.storage.sync.get(['openaiApiKey'], (data) => {
        if (data.openaiApiKey) {
            openaiApiKeyInput.value = data.openaiApiKey;
        }
    });

    // Save API key
    saveButton.addEventListener('click', () => {
        const openaiApiKey = openaiApiKeyInput.value;
        
        chrome.storage.sync.set({ 
            openaiApiKey: openaiApiKey
        }, () => {
            statusDiv.textContent = 'API Key saved successfully.';
            setTimeout(() => {
                statusDiv.textContent = '';
            }, 2000);
        });
    });
});