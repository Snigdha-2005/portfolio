// ==========================================================================
// SNIGDHA DAS PORTFOLIO - CORE JAVASCRIPT
// Features: Robust Theme Switcher, Mobile Nav, Scroll Spy, Filtering,
//           Copy-to-Clipboard Fallback, Form Validation, Back to Top
// ==========================================================================

document.addEventListener("DOMContentLoaded", () => {
  // 1. Current Year in Footer
  const yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  // 2. Theme Switcher (Dark / Light with System Preference & Meta Theme Color)
  const themeToggle = document.getElementById("theme-toggle");
  const sunIcon = document.getElementById("theme-icon-sun");
  const moonIcon = document.getElementById("theme-icon-moon");
  const metaThemeColor = document.getElementById("meta-theme-color");
  const htmlEl = document.documentElement;

  // Determine initial theme: saved theme > system preference > default dark
  const userSavedTheme = localStorage.getItem("portfolio-theme");
  const systemPrefersLight = window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches;
  const initialTheme = userSavedTheme ? userSavedTheme : (systemPrefersLight ? "light" : "dark");
  
  applyTheme(initialTheme, false);

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const currentTheme = htmlEl.getAttribute("data-theme") || "dark";
      const newTheme = currentTheme === "dark" ? "light" : "dark";
      applyTheme(newTheme, true);
    });
  }

  function applyTheme(theme, notify = false) {
    htmlEl.setAttribute("data-theme", theme);
    localStorage.setItem("portfolio-theme", theme);

    if (theme === "light") {
      if (sunIcon) sunIcon.style.display = "block";
      if (moonIcon) moonIcon.style.display = "none";
      if (metaThemeColor) metaThemeColor.setAttribute("content", "#f8fafc");
      if (themeToggle) themeToggle.setAttribute("aria-label", "Switch to dark mode");
      if (notify) showToast("Switched to Light Mode");
    } else {
      if (sunIcon) sunIcon.style.display = "none";
      if (moonIcon) moonIcon.style.display = "block";
      if (metaThemeColor) metaThemeColor.setAttribute("content", "#0a0e17");
      if (themeToggle) themeToggle.setAttribute("aria-label", "Switch to light mode");
      if (notify) showToast("Switched to Dark Mode");
    }
  }

  // 3. Mobile Navigation Drawer
  const mobileToggle = document.getElementById("mobile-toggle");
  const navLinksContainer = document.getElementById("nav-links");
  const navLinks = document.querySelectorAll(".nav-links a");

  if (mobileToggle && navLinksContainer) {
    mobileToggle.addEventListener("click", (e) => {
      e.stopPropagation();
      const isOpen = navLinksContainer.classList.toggle("open");
      mobileToggle.classList.toggle("active", isOpen);
      mobileToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    // Close when clicking any nav link
    navLinks.forEach(link => {
      link.addEventListener("click", () => {
        closeMobileNav();
      });
    });

    // Close when clicking outside
    document.addEventListener("click", (e) => {
      if (!navLinksContainer.contains(e.target) && !mobileToggle.contains(e.target)) {
        closeMobileNav();
      }
    });

    // Close when pressing Escape key
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        closeMobileNav();
      }
    });
  }

  function closeMobileNav() {
    if (navLinksContainer && navLinksContainer.classList.contains("open")) {
      navLinksContainer.classList.remove("open");
      if (mobileToggle) {
        mobileToggle.classList.remove("active");
        mobileToggle.setAttribute("aria-expanded", "false");
      }
    }
  }

  // 4. Scroll Spy & Navbar Background Scroll Transition
  const sections = document.querySelectorAll("main section[id]");
  const navbar = document.getElementById("navbar");
  const backToTopBtn = document.getElementById("back-to-top");

  // Track scroll position for navbar style & back-to-top button
  window.addEventListener("scroll", () => {
    const scrollPos = window.scrollY || window.pageYOffset;

    // Navbar appearance
    if (navbar) {
      if (scrollPos > 40) {
        navbar.classList.add("scrolled");
      } else {
        navbar.classList.remove("scrolled");
      }
    }

    // Back to top button
    if (backToTopBtn) {
      if (scrollPos > 350) {
        backToTopBtn.classList.add("show");
      } else {
        backToTopBtn.classList.remove("show");
      }
    }

    // Bottom of page check: highlight contact if at bottom
    if ((window.innerHeight + window.scrollY) >= (document.body.offsetHeight - 60)) {
      highlightNavLink("contact");
    }
  }, { passive: true });

  if (backToTopBtn) {
    backToTopBtn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  // IntersectionObserver for section highlighting
  if ("IntersectionObserver" in window) {
    const observerOptions = {
      root: null,
      rootMargin: "-25% 0px -65% 0px",
      threshold: 0
    };

    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const sectionId = entry.target.getAttribute("id");
          highlightNavLink(sectionId);
        }
      });
    }, observerOptions);

    sections.forEach(sec => sectionObserver.observe(sec));
  }

  function highlightNavLink(targetId) {
    navLinks.forEach(link => {
      const href = link.getAttribute("href");
      if (href === `#${targetId}`) {
        link.classList.add("active");
      } else if (href && href.startsWith("#")) {
        link.classList.remove("active");
      }
    });
  }

  // 5. Interactive Project Filtering
  const filterBtns = document.querySelectorAll(".filter-btn");
  const projectCards = document.querySelectorAll(".project-card");

  filterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      filterBtns.forEach(b => {
        b.classList.remove("active");
        b.setAttribute("aria-selected", "false");
      });
      btn.classList.add("active");
      btn.setAttribute("aria-selected", "true");

      const filter = btn.getAttribute("data-filter");

      projectCards.forEach(card => {
        const category = card.getAttribute("data-category");
        if (filter === "all" || category === filter) {
          card.style.display = "flex";
          card.style.opacity = "0";
          setTimeout(() => {
            card.style.transition = "opacity 0.25s ease";
            card.style.opacity = "1";
          }, 30);
        } else {
          card.style.display = "none";
        }
      });
    });
  });

  // 6. Toast Notification System
  const toast = document.getElementById("toast");
  const toastMessage = document.getElementById("toast-message");
  let toastTimer = null;

  function showToast(message) {
    if (!toast || !toastMessage) return;
    toastMessage.textContent = message;
    toast.classList.add("show");

    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove("show");
    }, 3200);
  }

  // 7. Copy Email Button with Fallback
  const copyEmailBtn = document.getElementById("copy-email-btn");
  if (copyEmailBtn) {
    copyEmailBtn.addEventListener("click", () => {
      const email = "dsnigdha703@gmail.com";

      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(email)
          .then(() => handleCopySuccess())
          .catch(() => fallbackCopy(email));
      } else {
        fallbackCopy(email);
      }
    });
  }

  function fallbackCopy(text) {
    try {
      const tempTextArea = document.createElement("textarea");
      tempTextArea.value = text;
      tempTextArea.style.position = "fixed";
      tempTextArea.style.left = "-9999px";
      tempTextArea.style.top = "-9999px";
      document.body.appendChild(tempTextArea);
      tempTextArea.focus();
      tempTextArea.select();
      const successful = document.execCommand("copy");
      document.body.removeChild(tempTextArea);
      if (successful) {
        handleCopySuccess();
      } else {
        showToast("Email: dsnigdha703@gmail.com");
      }
    } catch (err) {
      showToast("Email: dsnigdha703@gmail.com");
    }
  }

  function handleCopySuccess() {
    showToast("Email copied to clipboard!");
    if (copyEmailBtn) {
      const originalText = copyEmailBtn.querySelector("span");
      if (originalText) {
        originalText.textContent = "Copied!";
        setTimeout(() => {
          originalText.textContent = "Copy";
        }, 2000);
      }
    }
  }

  // 8. Contact Form Validation and Handling
  const contactForm = document.getElementById("contact-form");
  if (contactForm) {
    const inputs = contactForm.querySelectorAll("input, textarea");

    // Remove error class on user input
    inputs.forEach(input => {
      input.addEventListener("input", () => {
        input.classList.remove("error");
      });
    });

    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();

      let hasError = false;
      inputs.forEach(input => {
        if (!input.value.trim() && input.hasAttribute("required")) {
          input.classList.add("error");
          hasError = true;
        } else {
          input.classList.remove("error");
        }
      });

      if (hasError) {
        showToast("Please fill in all required fields.");
        return;
      }

      const nameInput = document.getElementById("contact-name");
      const senderName = nameInput ? nameInput.value.trim() : "Friend";

      showToast(`Thank you, ${senderName}! Your message was recorded.`);
      contactForm.reset();
    });
  }
});