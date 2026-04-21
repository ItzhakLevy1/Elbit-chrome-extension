/**
 * Extension for Elbit Career Website
 * Logic: Use incremental scrolling to "wake up" the site and click 'Load More'.
 */

(function () {
  // -----------------------------
  // UI Banner
  // -----------------------------
  const showBanner = (text) => {
    let banner = document.querySelector(".elbit-extension-banner");
    if (!banner) {
      banner = document.createElement("div");
      banner.className = "elbit-extension-banner";
      document.body.appendChild(banner);
    }
    banner.textContent = text;
  };

  showBanner("🟢 תוסף אלביט פעיל: טעינה אוטומטית של כל המשרות על ידי הקלקה חוזרת על כפתור 'תוצאות חיפוש נוספות'.");

  // -----------------------------
  // 1. Human-like Incremental Scroll
  // -----------------------------
  const smoothScrollToBottom = (callback) => {
    const scrollStep = 400; // Pixels per jump
    const scrollDelay = 50; // Milliseconds between jumps

    const scrollInterval = setInterval(() => {
      const currentScroll = window.scrollY + window.innerHeight;
      const maxScroll = document.documentElement.scrollHeight;

      // Stop if we are near the bottom or found the button
      const loadMoreBtn = Array.from(document.querySelectorAll('button.MuiButton-root'))
        .find(btn => btn.textContent.includes("תוצאות חיפוש נוספות"));

      if (currentScroll >= maxScroll - 100 || loadMoreBtn) {
        clearInterval(scrollInterval);
        if (callback) callback(loadMoreBtn);
      } else {
        window.scrollBy(0, scrollStep);
      }
    }, scrollDelay);
  };

  // -----------------------------
  // 2. Recursive Expand Logic
  // -----------------------------
  const expandAll = () => {
    smoothScrollToBottom((btn) => {
      if (btn) {
        console.log("LOG: Button found. Triggering click chain.");
        
        // Ensure the button is centered before clicking
        btn.scrollIntoView({ block: "center" });

        // Dispatch comprehensive event chain for Material UI
        const events = ['mouseenter', 'mouseover', 'mousedown', 'mouseup', 'click'];
        events.forEach(type => {
          btn.dispatchEvent(new MouseEvent(type, { 
            bubbles: true, 
            cancelable: true, 
            view: window,
            buttons: 1 
          }));
        });

        // Wait for next batch and repeat
        setTimeout(expandAll, 1500);
      } else {
        const loader = document.querySelector('.MuiCircularProgress-root');
        if (loader) {
          console.log("LOG: Site is loading, retrying in 2s...");
          setTimeout(expandAll, 2000);
        } else {
          console.log("LOG: Finish. No more buttons found.");
          showBanner("✅ All jobs loaded and filtered.");
          processJobs();
        }
      }
    });
  };

  // -----------------------------
  // 3. Filter & Mark Jobs
  // -----------------------------
  const processJobs = () => {
    const jobs = document.querySelectorAll(".MuiCard-root");
    const highExpRegex = /שנתיים|שלוש|ארבע|חמש|שש|שבע|שמונה|תשע|עשר|מנוסה|Senior|Lead|Principal/i;
    const juniorFriendlyRegex = /ג'וניור|Junior|ללא ניסיון|0-1|שנה ניסיון|סטודנט/i;

    jobs.forEach((job) => {
      if (job.dataset.processed === "true") return;

      const text = job.innerText;
      let shouldHide = false;

      const hasDegree = /תואר|degree/i.test(text);
      const isJunior = juniorFriendlyRegex.test(text);

      if (!isJunior) {
        if (highExpRegex.test(text)) shouldHide = true;
        const numMatch = text.match(/(\d+)\s*(?:\+|שנים|years|שנות)/i);
        if (numMatch && parseInt(numMatch[1], 10) > 1) shouldHide = true;
      }

      if (shouldHide || (hasDegree && !isJunior)) {
        job.classList.add("job-filtered");
      }

      const appliedText = ["הגשת מועמדות", "בוצעה", "הוגשה", "כבר הגשת"];
      if (appliedText.some(t => text.includes(t))) {
        job.classList.add("job-applied");
      }

      job.dataset.processed = "true";
    });
  };

  // Start the process when the first button appears after initial loader
  const checkInitialLoad = setInterval(() => {
    const initialBtn = Array.from(document.querySelectorAll('button.MuiButton-root'))
      .find(btn => btn.textContent.includes("תוצאות חיפוש נוספות"));
    
    if (initialBtn) {
      clearInterval(checkInitialLoad);
      console.log("LOG: Initial batch loaded. Starting auto-scroll.");
      expandAll();
    }
  }, 2000);

})();