document.addEventListener('DOMContentLoaded', () => {
    // === 1. Tab Switching ===
    document.querySelectorAll('.tab').forEach(tab => {
      tab.addEventListener('click', () => {
        const tabName = tab.getAttribute('data-tab');
  
        // Hide all sections
        document.querySelectorAll('.section').forEach(section => {
          section.classList.remove('active');
        });
  
        // Show the target section
        const target = document.getElementById(tabName);
        if (target) {
          target.classList.add('active');
        }
  
        // Reset tab styles
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
  
        // 💡 If switching to Reading tab, reset to menu view
        if (tabName === 'reading') {
          document.querySelectorAll('.reading-screen').forEach(screen => {
            screen.classList.add('hidden');
          });
          const menu = document.getElementById('readingMenu');
          if (menu) menu.classList.remove('hidden');
        }
      });
    });
  
    // === 2. Reading Tools Card Switching ===
    document.querySelectorAll('.option-card').forEach(card => {
      card.addEventListener('click', () => {
        const option = card.getAttribute('data-option');
        if (!option) return;
  
        // Hide menu and all other screens
        document.getElementById('readingMenu')?.classList.add('hidden');
        document.querySelectorAll('.reading-screen').forEach(screen => {
          screen.classList.add('hidden');
        });
  
        // Show selected screen
        const screen = document.getElementById(option);
        if (screen) screen.classList.remove('hidden');
      });
    });
  
    // === 3. Back Buttons inside Reading Tools Screens ===
    document.querySelectorAll('.backBtn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.reading-screen').forEach(screen => {
          screen.classList.add('hidden');
        });
        const menu = document.getElementById('readingMenu');
        if (menu) menu.classList.remove('hidden');
      });
    });
  
    // === 4. Speed slider (optional) ===
    const slider = document.getElementById('speedSlider');
    const speedDisplay = document.getElementById('speedValue');
    if (slider && speedDisplay) {
      slider.addEventListener('input', () => {
        speedDisplay.textContent = slider.value + 'x';
      });
    }


    // === 5. Settings Tab Menu Switching ===
document.querySelectorAll('.option-card').forEach(card => {
  card.addEventListener('click', () => {
    const option = card.getAttribute('data-option');
    if (!option) return;

    document.querySelector('.settingMenu')?.classList.add('hidden');
    document.querySelectorAll('.setting-screen').forEach(screen => {
      screen.classList.add('hidden');
    });

    const screen = document.getElementById(option);
    if (screen) screen.classList.remove('hidden');
  });
});

// === Reset Settings Tab View when clicked ===
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    const tabName = tab.getAttribute('data-tab');
    if (tabName === 'settings') {
      // Hide all setting screens
      document.querySelectorAll('.setting-screen').forEach(screen => {
        screen.classList.add('hidden');
      });

      // Show settings menu
      document.querySelector('.settingMenu')?.classList.remove('hidden');
    }
  });
});

  


  });
  