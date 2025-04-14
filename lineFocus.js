export function initializeLineFocus() {
    const lineFocusToggle = document.getElementById("lineFocusToggle");

    if (!lineFocusToggle) {
        console.error("Line Focus button not found");
        return;
    }

    // Load stored preferences
    chrome.storage.local.get(["lineFocusEnabled"], (result) => {
        const isEnabled = result.lineFocusEnabled || false;
        updateButtonState(isEnabled);
        updateLineFocusState(isEnabled);
    });

    // Listen for button click instead of toggle change
    lineFocusToggle.addEventListener("click", () => {
        chrome.storage.local.get(["lineFocusEnabled"], (result) => {
            const currentState = result.lineFocusEnabled || false;
            const newState = !currentState;

            chrome.storage.local.set({ lineFocusEnabled: newState }, () => {
                updateButtonState(newState);
                updateLineFocusState(newState);
            });
        });
    });

    function updateButtonState(isEnabled) {
        lineFocusToggle.textContent = isEnabled ? "👁️ Line Focus On" : "👁️ Line Focus Off";
        lineFocusToggle.classList.toggle("active", isEnabled); // Optional for visual style
    }

    function updateLineFocusState(isEnabled) {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (!tabs[0]) return;

            chrome.scripting.executeScript({
                target: { tabId: tabs[0].id },
                function: (isEnabled) => {
                    if (isEnabled) {
                        enableLineFocus();
                    } else {
                        disableLineFocus();
                    }

                    function enableLineFocus() {
                        if (window.lineFocusListeners) return;

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

                        addCursorIndicator();
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

                        removeCursorIndicator();
                    }

                    function addCursorIndicator() {
                        if (document.getElementById("lineFocusIndicator")) return;
                        const indicator = document.createElement("div");
                        indicator.id = "lineFocusIndicator";
                        indicator.style.position = "fixed";
                        indicator.style.width = "10px";
                        indicator.style.height = "10px";
                        indicator.style.borderRadius = "50%";
                        indicator.style.backgroundColor = "yellow";
                        indicator.style.border = "1px solid black";
                        indicator.style.pointerEvents = "none";
                        indicator.style.zIndex = "1000000";
                        document.body.appendChild(indicator);
                        document.addEventListener("mousemove", updateIndicator);
                    }

                    function updateIndicator(e) {
                        const indicator = document.getElementById("lineFocusIndicator");
                        if (indicator) {
                            indicator.style.left = (e.clientX + 10) + "px";
                            indicator.style.top = (e.clientY - 10) + "px";
                        }
                    }

                    function removeCursorIndicator() {
                        const indicator = document.getElementById("lineFocusIndicator");
                        if (indicator) {
                            indicator.remove();
                        }
                        document.removeEventListener("mousemove", updateIndicator);
                    }
                },
                args: [isEnabled]
            });
        });
    }
}
