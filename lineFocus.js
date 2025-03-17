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

                        // Add the small yellow cursor indicator.
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
                        // Remove the cursor indicator.
                        removeCursorIndicator();
                    }

                    // Add a small yellow indicator that follows the mouse.
                    function addCursorIndicator() {
                        if (document.getElementById("lineFocusIndicator")) return;
                        const indicator = document.createElement("div");
                        indicator.id = "lineFocusIndicator";
                        indicator.style.position = "fixed";
                        indicator.style.width = "10px";
                        indicator.style.height = "10px";
                        indicator.style.borderRadius = "50%";
                        indicator.style.backgroundColor = "yellow";
                        indicator.style.border = "1px solid black";  // Added small black border
                        indicator.style.pointerEvents = "none";
                        indicator.style.zIndex = "1000000";
                        document.body.appendChild(indicator);
                        document.addEventListener("mousemove", updateIndicator);
                    }

                    function updateIndicator(e) {
                        const indicator = document.getElementById("lineFocusIndicator");
                        if (indicator) {
                            // Slight offset so it doesn't obscure the cursor.
                            indicator.style.left = (e.clientX + 10) + "px";
                            indicator.style.top = (e.clientY + -10) + "px";
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