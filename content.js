/**
 * Elbit Careers Automation Tool
 * Features: Auto-expansion, Experience Filtering, Persistent Click Tracking
 */

(function () {
  // --- 1. Display Information Banner ---
  const showBanner = () => {
    if (document.querySelector(".elbit-extension-banner")) return;
    const banner = document.createElement("div");
    banner.className = "elbit-extension-banner";
    banner.innerHTML = `
      <button class="elbit-banner-close" onclick="this.parentElement.remove()">&times;</button>
      <div>🟢 תוסף אלביט פעיל:</div>
      <div>משרות שלחצת עליהן</div>
      <div>יסומנו בירוק קבוע</div>
    `;
    document.body.appendChild(banner);
  };

  // --- 2. Save Clicked Job ID to Local Storage ---
  const markJobAsClicked = (jid) => {
    if (!jid) return;
    let clickedJobs = JSON.parse(localStorage.getItem('elbit_clicked_jobs') || '[]');
    if (!clickedJobs.includes(jid)) {
      clickedJobs.push(jid);
      localStorage.setItem('elbit_clicked_jobs', JSON.stringify(clickedJobs));
      console.log(`LOG: Job ${jid} marked as visited.`);
    }
  };

  // --- 3. Process, Filter, and Style Job Cards ---
  const processJobs = () => {
    const jobs = document.querySelectorAll(".MuiCard-root");
    const clickedInStorage = JSON.parse(localStorage.getItem('elbit_clicked_jobs') || '[]');
    
    // Regex for high experience and junior terms
    const highExpRegex = /שנתיים|שלוש|ארבע|חמש|שש|שבע|Senior|Lead|Principal|מנוסה/i;
    const juniorTerms = /ג'וניור|Junior|ללא ניסיון|0-1|סטודנט/i;

    jobs.forEach((job) => {
      const text = job.innerText;
      const idMatch = text.match(/(\d{4,6})/);
      const jid = idMatch ? idMatch[1] : null;

      // Check if job was previously clicked/applied
      if (jid && clickedInStorage.includes(jid)) {
        job.classList.add("job-applied");
      }

      // Bind click event to save state (using mousedown for faster capture)
      if (job.dataset.clickBound !== "true") {
        job.addEventListener('mousedown', () => {
          if (jid) markJobAsClicked(jid);
          job.classList.add("job-applied"); // Visual feedback
        });
        job.dataset.clickBound = "true";
      }

      if (job.dataset.processed === "true") return;

      // Experience filtering logic
      let shouldHide = false;
      const isJunior = juniorTerms.test(text);
      if (!isJunior) {
        if (highExpRegex.test(text)) shouldHide = true;
        const numMatch = text.match(/(\d+)\s*(?:\+|שנים|years|שנות)/i);
        if (numMatch && parseInt(numMatch[1], 10) > 1) shouldHide = true;
      }

      if (shouldHide && !isJunior) {
        job.classList.add("job-filtered");
      }

      job.dataset.processed = "true";
    });
  };

  // --- 4. Recursive Auto-Expansion Logic ---
  let isExpanding = false;
  const autoExpand = () => {
    if (isExpanding) return;
    
    // Find the "Load More" button by its Hebrew text
    const loadMoreBtn = Array.from(document.querySelectorAll('button.MuiButton-root'))
      .find(btn => btn.textContent.includes("תוצאות חיפוש נוספות"));

    if (loadMoreBtn) {
      isExpanding = true;
      loadMoreBtn.scrollIntoView({ behavior: "smooth", block: "center" });

      setTimeout(() => {
        // Dispatch multiple click events to bypass React/SPA handlers
        ['mousedown', 'mouseup', 'click'].forEach(t => {
            loadMoreBtn.dispatchEvent(new MouseEvent(t, { 
                bubbles: true, 
                cancelable: true, 
                view: window, 
                buttons: 1 
            }));
        });

        setTimeout(() => { 
          isExpanding = false; 
          autoExpand(); // Recursive call for next batch
        }, 2500);
      }, 1000);
    } else {
      processJobs();
    }
  };

  // Initialize
  showBanner();
  
  // Start initial expansion after page load
  setTimeout(autoExpand, 5000);

  // Monitor DOM changes for navigation or infinite scroll
  const observer = new MutationObserver(() => {
    processJobs();
    if (!isExpanding) autoExpand();
  });

  observer.observe(document.body, { childList: true, subtree: true });
})();