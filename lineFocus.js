export function initializeLineFocus() {
    const lineFocusToggle = document.getElementById("lineFocusToggle");

    // Load stored preferences
    chrome.storage.local.get(["lineFocusEnabled"], (result) => {
        const isEnabled = result.lineFocusEnabled || false;
        lineFocusToggle.checked = isEnabled;
        updateLineFocusState(isEnabled); // Update state on page load
    });

    // Listen for toggle changes
    lineFocusToggle.addEventListener("change", () => {
        const isEnabled = lineFocusToggle.checked;
        chrome.storage.local.set({ lineFocusEnabled: isEnabled });
        updateLineFocusState(isEnabled); // Update state on toggle change
    });

    function updateLineFocusState(isEnabled) {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.scripting.executeScript({
                target: { tabId: tabs[0].id },
                function: (isEnabled) => {
                    if (isEnabled) {
                        enableLineFocus();
                    } else {
                        disableLineFocus();
                    }

                    function enableLineFocus() {
                        if (window.lineFocusListeners) return; // Prevent duplicate listeners

                        let highlightedElement = null;

                        function handleMouseOver(event) {
                            const target = event.target;

                            if (target.nodeType === Node.TEXT_NODE ||
                                target.tagName === 'P' ||
                                target.tagName === 'LI' ||
                                target.tagName === 'SPAN' ||
                                target.tagName === 'DIV' ||
                                target.tagName === 'H1' ||
                                target.tagName === 'H2' ||
                                target.tagName === 'H3' ||
                                target.tagName === 'H4' ||
                                target.tagName === 'H5' ||
                                target.tagName === 'H6') {

                                if (highlightedElement) {
                                    highlightedElement.style.backgroundColor = '';
                                }

                                const blockElement = target.closest('p, li, div, h1, h2, h3, h4, h5, h6');

                                if (blockElement) {
                                    highlightedElement = blockElement;
                                    highlightedElement.style.backgroundColor = 'rgba(255, 255, 0, 0.3)';
                                }
                            }
                        }

                        function handleMouseOut() {
                            if (highlightedElement) {
                                highlightedElement.style.backgroundColor = '';
                                highlightedElement = null;
                            }
                        }

                        document.addEventListener('mouseover', handleMouseOver);
                        document.addEventListener('mouseout', handleMouseOut);

                        window.lineFocusListeners = {
                            mouseover: handleMouseOver,
                            mouseout: handleMouseOut
                        };
                    }

                    function disableLineFocus() {
                        if (window.lineFocusListeners) {
                            document.removeEventListener('mouseover', window.lineFocusListeners.mouseover);
                            document.removeEventListener('mouseout', window.lineFocusListeners.mouseout);
                            delete window.lineFocusListeners;
                        }
                        const highlightedElements = document.querySelectorAll('[style*="background-color: rgba(255, 255, 0, 0.3)"]');
                        highlightedElements.forEach(element => {
                            element.style.backgroundColor = '';
                        });
                    }
                },
                args: [isEnabled]
            });
        });
    }
}