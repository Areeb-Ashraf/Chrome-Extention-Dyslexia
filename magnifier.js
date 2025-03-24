// function attachMagnifier() {
//     // If the magnifier overlay already exists, do nothing.
//     if (document.getElementById("magnifierOverlay")) return;
//     const magnifier = document.createElement("div");
//     magnifier.id = "magnifierOverlay";
//     // Style the overlay (you can adjust these values as desired).
//     magnifier.style.position = "fixed";
//     magnifier.style.zIndex = "1000000";
//     magnifier.style.backgroundColor = "white";
//     magnifier.style.border = "1px solid #000";
//     magnifier.style.padding = "5px";
//     magnifier.style.fontSize = "24px";
//     magnifier.style.fontWeight = "bold";
//     magnifier.style.pointerEvents = "none"; // Let mouse events pass through.
//     magnifier.style.display = "none";
//     document.body.appendChild(magnifier);
  
//     // Define the handler to update the magnifier based on the word under the cursor.
//     window._magnifierHandler = function(e) {
//       let range;
//       if (document.caretRangeFromPoint) {
//         range = document.caretRangeFromPoint(e.clientX, e.clientY);
//       } else if (document.caretPositionFromPoint) {
//         const pos = document.caretPositionFromPoint(e.clientX, e.clientY);
//         if (pos) {
//           range = document.createRange();
//           range.setStart(pos.offsetNode, pos.offset);
//           range.setEnd(pos.offsetNode, pos.offset);
//         }
//       }
//       if (range && range.startContainer && range.startContainer.nodeType === Node.TEXT_NODE) {
//         const text = range.startContainer.textContent;
//         const offset = range.startOffset;
//         let start = offset, end = offset;
//         while (start > 0 && !/\s/.test(text[start - 1])) { start--; }
//         while (end < text.length && !/\s/.test(text[end])) { end++; }
//         const word = text.slice(start, end).trim();
//         if (word) {
//           magnifier.textContent = word;
//           // Position the magnifier near the cursor.
//           magnifier.style.left = (e.clientX + 15) + "px";
//           magnifier.style.top = (e.clientY + 15) + "px";
//           magnifier.style.display = "block";
//         } else {
//           magnifier.style.display = "none";
//         }
//       } else {
//         magnifier.style.display = "none";
//       }
//     };
//     document.addEventListener("mousemove", window._magnifierHandler);
//   }
  
//   function detachMagnifier() {
//     if (window._magnifierHandler) {
//       document.removeEventListener("mousemove", window._magnifierHandler);
//       window._magnifierHandler = null;
//     }
//     const magnifier = document.getElementById("magnifierOverlay");
//     if (magnifier) {
//       magnifier.remove();
//     }
//   }
  
//   // This function is called from the popup context.
//   export function initializeMagnifier() {
//     const magnifierToggle = document.getElementById("magnifierToggle");
  
//     // Load stored preference for the magnifier feature.
//     chrome.storage.local.get(["magnifierEnabled"], (result) => {
//       const isEnabled = result.magnifierEnabled || false;
//       magnifierToggle.checked = isEnabled;
//       if (isEnabled) {
//         chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
//           chrome.scripting.executeScript({
//             target: { tabId: tabs[0].id },
//             function: attachMagnifier
//           });
//         });
//       }
//     });
  
//     // Listen for toggle changes.
//     magnifierToggle.addEventListener("change", () => {
//       const isEnabled = magnifierToggle.checked;
//       chrome.storage.local.set({ magnifierEnabled: isEnabled });
//       chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
//         if (isEnabled) {
//           chrome.scripting.executeScript({
//             target: { tabId: tabs[0].id },
//             function: attachMagnifier
//           });
//         } else {
//           chrome.scripting.executeScript({
//             target: { tabId: tabs[0].id },
//             function: detachMagnifier
//           });
//         }
//       });
//     });
//   }
  
//   export { attachMagnifier, detachMagnifier };