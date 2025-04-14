export function initializeLineGuide() {
    const button = document.getElementById("lineGuideBtn");
  
    if (!button) {
      console.error("Line Guide button not found");
      return;
    }
  
    // Load stored state
    chrome.storage.local.get(["lineGuideEnabled"], (result) => {
      const isEnabled = !!result.lineGuideEnabled;
      updateButtonUI(isEnabled);
      updateLineGuideState(isEnabled);
    });
  
    // Click to toggle
    button.addEventListener("click", () => {
      chrome.storage.local.get(["lineGuideEnabled"], (result) => {
        const current = !!result.lineGuideEnabled;
        const next = !current;
  
        chrome.storage.local.set({ lineGuideEnabled: next }, () => {
          updateButtonUI(next);
          updateLineGuideState(next);
        });
      });
    });
  
    function updateButtonUI(isEnabled) {
      button.textContent = isEnabled ? "📏 Line Guide On" : "📏 Line Guide Off";
    }
  
    function updateLineGuideState(isEnabled) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (!tabs[0]) return;
  
        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          args: [isEnabled],
          func: (isEnabled) => {
            if (isEnabled) {
              enableLineGuide();
            } else {
              disableLineGuide();
            }
  
            function enableLineGuide() {
              if (document.getElementById("lineGuide")) return;
  
              const guide = document.createElement("div");
              guide.id = "lineGuide";
              guide.style.position = "fixed";
              guide.style.left = "0";
              guide.style.width = "100%";
              guide.style.height = "2px";
              guide.style.backgroundColor = "red";
              guide.style.zIndex = "1000000";
              guide.style.pointerEvents = "none";
              document.body.appendChild(guide);
  
              document.addEventListener("mousemove", moveLineGuide);
            }
  
            function moveLineGuide(e) {
              const guide = document.getElementById("lineGuide");
              if (guide) {
                guide.style.top = `${e.clientY}px`;
              }
            }
  
            function disableLineGuide() {
              const guide = document.getElementById("lineGuide");
              if (guide) guide.remove();
  
              document.removeEventListener("mousemove", moveLineGuide);
            }
          }
        });
      });
    }
  }
  