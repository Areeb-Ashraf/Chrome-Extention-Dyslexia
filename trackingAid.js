export function initializeTrackingAid() {
  const trackingAidToggle = document.getElementById("trackingAidToggle");
  const trackingAidColorInput = document.getElementById("trackingAidColor");

  // Load stored preferences for tracking aid enabled state and color.
  chrome.storage.local.get(["trackingAidEnabled", "trackingAidColor"], (result) => {
    const isEnabled = result.trackingAidEnabled || false;
    // Default color: a semi-transparent blue (you can adjust as desired)
    const color = result.trackingAidColor || "#0096ff";
    trackingAidToggle.checked = isEnabled;
    trackingAidColorInput.value = color;

    if (isEnabled) {
      injectTrackingAid(color);
    }
  });

  // Listen for toggle changes.
  trackingAidToggle.addEventListener("change", () => {
    const isEnabled = trackingAidToggle.checked;
    chrome.storage.local.set({ trackingAidEnabled: isEnabled });
    if (isEnabled) {
      const color = trackingAidColorInput.value;
      injectTrackingAid(color);
    } else {
      removeTrackingAid();
    }
  });

  // Listen for color changes.
  trackingAidColorInput.addEventListener("change", () => {
    const color = trackingAidColorInput.value;
    chrome.storage.local.set({ trackingAidColor: color });
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        function: (color) => {
          const box = document.getElementById("trackingAid");
          if (box) {
            box.style.backgroundColor = color;
            box.style.border = "1px solid #000";
          }
        },
        args: [color]
      });
    });
  });

  // Function to inject the tracking aid element (a draggable vertical rectangle) into the active tab.
  function injectTrackingAid(color) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        function: (color) => {
          if (document.getElementById("trackingAid")) return;
          const box = document.createElement("div");
          box.id = "trackingAid";
          // Set dimensions for a vertical rectangle (10px by 30px).
          const boxWidth = 8;
          const boxHeight = 30;
          box.style.position = "absolute";
          // Center the box based on new dimensions.
          box.style.top = ((window.innerHeight - boxHeight) / 2) + "px";
          box.style.left = ((window.innerWidth - boxWidth) / 2) + "px";
          box.style.width = boxWidth + "px";
          box.style.height = boxHeight + "px";
          box.style.backgroundColor = color;
          box.style.border = "1px solid #000";
          box.style.cursor = "move";
          box.style.zIndex = "999999";
          document.body.appendChild(box);

          let isDragging = false;
          let offsetX = 0;
          let offsetY = 0;

          box.addEventListener("mousedown", (e) => {
            isDragging = true;
            const rect = box.getBoundingClientRect();
            // Use e.pageX and e.pageY minus the element’s page offset (client rect + scroll)
            offsetX = e.pageX - (rect.left + window.scrollX);
            offsetY = e.pageY - (rect.top + window.scrollY);
            document.body.style.cursor = "none";
            e.preventDefault();
          });
          
          document.addEventListener("mousemove", function moveHandler(e) {
            if (!isDragging) return;
            // Use e.pageX and e.pageY to set new position
            const newLeft = e.pageX - offsetX;
            const newTop = e.pageY - offsetY;
            box.style.left = newLeft + "px";
            box.style.top = newTop + "px";
          });
          
          document.addEventListener("mouseup", () => {
            if (isDragging) {
              isDragging = false;
              document.body.style.cursor = "";
            }
          });
        },
        args: [color]
      });
    });
  }

  // Function to remove the tracking aid element from the active tab.
  function removeTrackingAid() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        function: () => {
          const box = document.getElementById("trackingAid");
          if (box) box.remove();
        }
      });
    });
  }
}