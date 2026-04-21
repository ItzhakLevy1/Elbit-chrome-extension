/**
 * Elbit Careers Automation Tool - V4
 * Features: Auto-expansion, Experience Filtering, Persistent Data-Attribute Badges
 */

(function () {
  // --- 1. Display Information Banner ---
  const showBanner = () => {
    if (document.querySelector(".elbit-extension-banner")) return;
    const banner = document.createElement("div");
    banner.className = "elbit-extension-banner";
    banner.innerHTML = `
      <button class="elbit-banner-close" style="color:white; border:none; background:none; cursor:pointer;" onclick="this.parentElement.remove()">&times;</button>
      <div>🟢 תוסף אלביט פעיל:</div>
      <br>
      <div>טעינה אוטומטית של</div>
      <div>כל המשרות על ידי</div>
      <div>הקלקה חוזרת על כפתור</div>
      <div>'תוצאות חיפוש נוספות'</div>
      <br>
      <hr>
      <br>
      <div>משרות שביקרתי בהן</div>
      <div>יסומנו עם תאריך לחיצה</div>
    `;
    document.body.appendChild(banner);
  };

  // --- 2. Helper to apply applied status ---
  const markAsApplied = (element, date) => {
    element.classList.add("job-applied-v4");
    element.setAttribute('data-applied-info', `הוגשה מועמדות בתאריך\n${date}`);
  };

  // --- 3. Persistent Storage Management ---
  const saveToStorage = (jid) => {
    if (!jid) return;
    let data = JSON.parse(localStorage.getItem('elbit_clicked_v4') || '{}');
    if (!data[jid]) {
      const now = new Date();
      const dateStr = `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`;
      data[jid] = dateStr;
      localStorage.setItem('elbit_clicked_v4', JSON.stringify(data));
    }
  };

  // --- 4. Main Processing Logic ---
  const processJobs = () => {
    const jobs = document.querySelectorAll(".MuiCard-root");
    const storedData = JSON.parse(localStorage.getItem('elbit_clicked_v4') || '{}');
    
    const highExpRegex = /שנתיים|שלוש|ארבע|חמש|שש|שבע|Senior|Lead|Principal|מנוסה/i;
    const juniorTerms = /ג'וניור|Junior|ללא ניסיון|0-1|סטודנט/i;

    jobs.forEach((job) => {
      const text = job.innerText;
      const idMatch = text.match(/(\d{4,6})/);
      const jid = idMatch ? idMatch[1] : null;

      // Restore state from storage
      if (jid && storedData[jid]) {
        markAsApplied(job, storedData[jid]);
      }

      // Bind click event
      if (job.dataset.clickBound !== "true") {
        job.addEventListener('mousedown', () => {
          if (jid) {
            saveToStorage(jid);
            const now = new Date();
            const dateStr = `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`;
            markAsApplied(job, dateStr);
          }
        });
        job.dataset.clickBound = "true";
      }

      if (job.dataset.processed === "true") return;

      // Experience filtering
      let shouldHide = false;
      const isJunior = juniorTerms.test(text);
      if (!isJunior) {
        if (highExpRegex.test(text)) shouldHide = true;
        const numMatch = text.match(/(\d+)\s*(?:\+|שנים|years|שנות)/i);
        if (numMatch && parseInt(numMatch[1], 10) > 1) shouldHide = true;
      }

      if (shouldHide && !isJunior) job.classList.add("job-filtered");
      job.dataset.processed = "true";
    });
  };

  // --- 5. Auto-Expansion (Load More) ---
  let isExpanding = false;
  const autoExpand = () => {
    if (isExpanding) return;
    const loadMoreBtn = Array.from(document.querySelectorAll('button.MuiButton-root'))
      .find(btn => btn.textContent.includes("תוצאות חיפוש נוספות"));

    if (loadMoreBtn) {
      isExpanding = true;
      loadMoreBtn.scrollIntoView({ behavior: "smooth", block: "center" });
      setTimeout(() => {
        ['mousedown', 'mouseup', 'click'].forEach(t => {
            loadMoreBtn.dispatchEvent(new MouseEvent(t, { bubbles: true, cancelable: true, view: window, buttons: 1 }));
        });
        setTimeout(() => { isExpanding = false; autoExpand(); }, 2500);
      }, 1000);
    } else {
      processJobs();
    }
  };

  // Initialize
  showBanner();
  setTimeout(autoExpand, 5000);

  const observer = new MutationObserver(() => {
    processJobs();
    if (!isExpanding) autoExpand();
  });

  observer.observe(document.body, { childList: true, subtree: true });
})();