export function initializeTrackingAid() {
    const trackingAidToggle = document.getElementById("trackingAidToggle");
  
    // Load stored preference for tracking aid
    chrome.storage.local.get(["trackingAidEnabled"], (result) => {
      const isEnabled = result.trackingAidEnabled || false;
      trackingAidToggle.checked = isEnabled;
      if (isEnabled) {
        injectTrackingAid();
      }
    });
  
    // Listen for toggle changes
    trackingAidToggle.addEventListener("change", () => {
      const isEnabled = trackingAidToggle.checked;
      chrome.storage.local.set({ trackingAidEnabled: isEnabled });
      if (isEnabled) {
        injectTrackingAid();
      } else {
        removeTrackingAid();
      }
    });
  
    // Inject the tracking aid element (a movable box) into the active tab
    function injectTrackingAid() {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          function: () => {
            if (document.getElementById("trackingAid")) return;
            const box = document.createElement("div");
            box.id = "trackingAid";
            // Styling for the box
            box.style.position = "absolute";
            box.style.top = "100px";  // initial vertical position
            box.style.left = "100px"; // initial horizontal position
            box.style.width = "25px";
            box.style.height = "25px";
            box.style.backgroundColor = "rgba(0, 150, 255, 0.7)"; // semi-transparent blue
            box.style.border = "2px solid #0096ff";
            box.style.cursor = "move";
            box.style.zIndex = "999999";
            document.body.appendChild(box);
  
            let isDragging = false;
            let offsetX = 0;
            let offsetY = 0;
  
            box.addEventListener("mousedown", (e) => {
              isDragging = true;
              offsetX = e.clientX - box.getBoundingClientRect().left;
              offsetY = e.clientY - box.getBoundingClientRect().top;
              e.preventDefault();
            });
  
            document.addEventListener("mousemove", (e) => {
              if (!isDragging) return;
              const newLeft = e.clientX - offsetX;
              const newTop = e.clientY - offsetY;
              box.style.left = newLeft + "px";
              box.style.top = newTop + "px";
            });
  
            document.addEventListener("mouseup", () => {
              isDragging = false;
            });
          }
        });
      });
    }
  
    // Remove the tracking aid element from the active tab
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