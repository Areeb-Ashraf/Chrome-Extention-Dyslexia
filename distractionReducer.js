export function initializeDistractionReducer() {
  const distractionToggle = document.getElementById("distractionReducerToggle");

  // Load stored state
  chrome.storage.local.get(["distractionReducerEnabled"], (result) => {
    const isEnabled = result.distractionReducerEnabled || false;
    distractionToggle.checked = isEnabled;
    if (isEnabled) {
      injectDistractionBar();
    }
  });

  distractionToggle.addEventListener("change", () => {
    const isEnabled = distractionToggle.checked;
    chrome.storage.local.set({ distractionReducerEnabled: isEnabled });
    if (isEnabled) {
      injectDistractionBar();
    } else {
      removeDistractionBar();
    }
  });

  function injectDistractionBar() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        function: () => {
          // If the bar already exists, do nothing.
          if (document.getElementById("distractionBar")) return;

          // Create the bar element.
          const bar = document.createElement("div");
          bar.id = "distractionBar";
          bar.style.position = "absolute";
          bar.style.top = "200px";   // initial vertical position
          bar.style.left = "0";
          bar.style.width = "100%";
          bar.style.height = "50px"; // height of the bar
          bar.style.backgroundColor = "rgba(0,0,0,0)"; // transparent background
          bar.style.cursor = "move";
          bar.style.zIndex = "999998";
          // Change border: remove left/right and use solid lines for top and bottom.
          bar.style.borderTop = "2px solid #000";
          bar.style.borderBottom = "2px solid #000";
          bar.style.borderLeft = "none";
          bar.style.borderRight = "none";
          document.body.appendChild(bar);

          // Make the bar draggable.
          let isDragging = false;
          let offsetY = 0;
          bar.addEventListener("mousedown", (e) => {
            isDragging = true;
            const rect = bar.getBoundingClientRect();
            // Adjust for page scroll
            offsetY = e.pageY - (rect.top + window.scrollY);
            e.preventDefault();
          });
          
          document.addEventListener("mousemove", (e) => {
            if (!isDragging) return;
            // Use pageY for new position
            let newTop = e.pageY - offsetY;
            bar.style.top = newTop + "px";
            updateOverlays();
          });
          
          document.addEventListener("mouseup", () => {
            isDragging = false;
          });
          // When the mouse enters the bar, create overlays.
          bar.addEventListener("mouseenter", createOverlays);
          // When it leaves, remove overlays.
          bar.addEventListener("mouseleave", removeOverlays);
          // Also update overlays when the mouse moves over the bar.
          bar.addEventListener("mousemove", updateOverlays);

          // Create four overlay divs to cover all areas except the bar.
          function createOverlays() {
            removeOverlays(); // clear any existing overlays
            const rect = bar.getBoundingClientRect();
            const vw = window.innerWidth;
            const vh = window.innerHeight;

            // Top overlay: covers from top to bar top.
            const topOverlay = document.createElement("div");
            topOverlay.className = "distractionOverlay";
            topOverlay.style.position = "fixed";
            topOverlay.style.top = "0";
            topOverlay.style.left = "0";
            topOverlay.style.width = "100%";
            topOverlay.style.height = rect.top + "px";
            topOverlay.style.backgroundColor = "rgba(128,128,128,0.5)";
            topOverlay.style.zIndex = "999999";

            // Bottom overlay: covers from bar bottom to bottom of screen.
            const bottomOverlay = document.createElement("div");
            bottomOverlay.className = "distractionOverlay";
            bottomOverlay.style.position = "fixed";
            bottomOverlay.style.top = rect.bottom + "px";
            bottomOverlay.style.left = "0";
            bottomOverlay.style.width = "100%";
            bottomOverlay.style.height = (vh - rect.bottom) + "px";
            bottomOverlay.style.backgroundColor = "rgba(128,128,128,0.5)";
            bottomOverlay.style.zIndex = "999999";

            // Left overlay: covers area left of the bar within its vertical bounds.
            const leftOverlay = document.createElement("div");
            leftOverlay.className = "distractionOverlay";
            leftOverlay.style.position = "fixed";
            leftOverlay.style.top = rect.top + "px";
            leftOverlay.style.left = "0";
            leftOverlay.style.width = rect.left + "px";
            leftOverlay.style.height = rect.height + "px";
            leftOverlay.style.backgroundColor = "rgba(128,128,128,0.5)";
            leftOverlay.style.zIndex = "999999";

            // Right overlay: covers area right of the bar within its vertical bounds.
            const rightOverlay = document.createElement("div");
            rightOverlay.className = "distractionOverlay";
            rightOverlay.style.position = "fixed";
            rightOverlay.style.top = rect.top + "px";
            rightOverlay.style.left = rect.right + "px";
            rightOverlay.style.width = (vw - rect.right) + "px";
            rightOverlay.style.height = rect.height + "px";
            rightOverlay.style.backgroundColor = "rgba(128,128,128,0.5)";
            rightOverlay.style.zIndex = "999999";

            document.body.appendChild(topOverlay);
            document.body.appendChild(bottomOverlay);
            document.body.appendChild(leftOverlay);
            document.body.appendChild(rightOverlay);
          }

          // Update overlays if the bar moves or mouse moves.
          function updateOverlays() {
            removeOverlays();
            createOverlays();
          }

          // Remove any overlay elements.
          function removeOverlays() {
            const overlays = document.querySelectorAll(".distractionOverlay");
            overlays.forEach((el) => el.remove());
          }
        }
      });
    });
  }

  function removeDistractionBar() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        function: () => {
          const bar = document.getElementById("distractionBar");
          if (bar) bar.remove();
          const overlays = document.querySelectorAll(".distractionOverlay");
          overlays.forEach(el => el.remove());
        }
      });
    });
  }
}