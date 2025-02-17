export function initializeFontSwitcher() {
    const fontSwitcherButton = document.getElementById("toggleFont");

    fontSwitcherButton.addEventListener("click", () => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.scripting.insertCSS({
                target: { tabId: tabs[0].id },
                css: `
                    * {
                        font-family: 'OpenDyslexic', sans-serif !important;
                    }
                `
            });
        });
    });
}