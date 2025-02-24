document.addEventListener('DOMContentLoaded', () => {
    const apiKeyInput = document.getElementById('geminiApiKey');
    const saveButton = document.getElementById('saveApiKey');
    const statusDiv = document.getElementById('status');

    chrome.storage.sync.get('geminiApiKey', (data) => {
        if (data.geminiApiKey) {
            apiKeyInput.value = data.geminiApiKey;
        }
    });

    saveButton.addEventListener('click', () => {
        const apiKey = apiKeyInput.value;
        chrome.storage.sync.set({ geminiApiKey: apiKey }, () => {
            statusDiv.textContent = 'API Key saved.';
            setTimeout(() => {
                statusDiv.textContent = '';
            }, 2000);
        });
    });
});