/**
 * ============================================================================
 * MANJUNATHAN S - PERSONAL DEVELOPER PORTFOLIO
 * Vanilla JavaScript (No Frameworks, No External Libraries)
 * Clean, Modular, Performant & Accessible
 * ============================================================================
 */

function initPortfolio() {
  'use strict';

  // --------------------------------------------------------------------------
  // 1. DYNAMIC YEAR
  // --------------------------------------------------------------------------
  try {
    const yearElement = document.getElementById('current-year');
    if (yearElement) {
      yearElement.textContent = new Date().getFullYear();
    }
  } catch (err) {
    console.error('Error in initYear:', err);
  }

  // --------------------------------------------------------------------------
  // 2. TOAST NOTIFICATION SYSTEM
  // --------------------------------------------------------------------------
  const toastContainer = document.getElementById('toast-container');

  function showToast(message, type = 'success', duration = 3500) {
    if (!toastContainer) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.setAttribute('role', 'status');

    const iconSvg = type === 'success'
      ? `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>`
      : `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`;

    toast.innerHTML = `
      ${iconSvg}
      <span class="toast-message">${escapeHtml(message)}</span>
    `;

    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('fade-out');
      setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 300);
    }, duration);
  }

  function escapeHtml(str) {
    return str.replace(/[&<>'"]/g, tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag));
  }

  // --------------------------------------------------------------------------
  // 3. BACK TO TOP & SCROLL PROGRESS INITIALIZATION
  // (Declared early so handleScroll can safely access them without TDZ issues)
  // --------------------------------------------------------------------------
  const backToTopBtn = document.getElementById('back-to-top');
  const progressCircle = document.getElementById('scroll-progress-circle');
  const circumference = 2 * Math.PI * 20; // r=20 => ~125.66

  if (progressCircle) {
    progressCircle.style.strokeDasharray = `${circumference} ${circumference}`;
    progressCircle.style.strokeDashoffset = `${circumference}`;
  }

  function updateScrollProgress(scrollY) {
    if (!backToTopBtn || !progressCircle) return;

    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = docHeight > 0 ? scrollY / docHeight : 0;
    const offset = circumference - (scrollPercent * circumference);

    progressCircle.style.strokeDashoffset = offset;

    if (scrollY > 350) {
      backToTopBtn.classList.add('visible');
    } else {
      backToTopBtn.classList.remove('visible');
    }
  }

  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  // --------------------------------------------------------------------------
  // 4. HEADER SCROLL & ACTIVE LINK HIGHLIGHTING
  // --------------------------------------------------------------------------
  try {
    const header = document.getElementById('header');
    const navLinks = document.querySelectorAll('.desktop-nav .nav-link');
    const sections = document.querySelectorAll('section[id]');

    function handleScroll() {
      const scrollY = window.pageYOffset || document.documentElement.scrollTop;

      // Sticky Header Glass styling
      if (header) {
        if (scrollY > 50) {
          header.classList.add('scrolled');
        } else {
          header.classList.remove('scrolled');
        }
      }

      // Scroll Progress for Back to Top Ring
      updateScrollProgress(scrollY);

      // Active Section Detection
      let currentSectionId = '';
      const scrollMiddle = scrollY + (window.innerHeight / 3);

      sections.forEach(section => {
        const top = section.offsetTop;
        const height = section.offsetHeight;
        if (scrollMiddle >= top && scrollMiddle < top + height) {
          currentSectionId = section.getAttribute('id');
        }
      });

      navLinks.forEach(link => {
        link.classList.remove('active');
        const href = link.getAttribute('href');
        if (href && href.substring(1) === currentSectionId) {
          link.classList.add('active');
        }
      });
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
  } catch (err) {
    console.error('Error in handleScroll:', err);
  }

  // --------------------------------------------------------------------------
  // 5. SMOOTH NAVIGATION LINK SCROLLING WITH OFFSET
  // --------------------------------------------------------------------------
  try {
    const internalLinks = document.querySelectorAll('a[href^="#"]');
    internalLinks.forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        const targetId = this.getAttribute('href');
        if (targetId === '#' || targetId === '') return;
        const targetEl = document.querySelector(targetId);
        if (targetEl) {
          e.preventDefault();
          const headerHeight = 72;
          const targetPosition = targetEl.getBoundingClientRect().top + window.pageYOffset - headerHeight;
          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
        }
      });
    });
  } catch (err) {
    console.error('Error in smooth navigation:', err);
  }

  // --------------------------------------------------------------------------
  // 6. SCROLL REVEAL ANIMATIONS (FAIL-SAFE INTERSECTION OBSERVER)
  // --------------------------------------------------------------------------
  try {
    const revealElements = document.querySelectorAll('.reveal-fade');
    const windowHeight = window.innerHeight;

    // Elements already in view or in hero section are immediately revealed
    revealElements.forEach(el => {
      const rect = el.getBoundingClientRect();
      const isHero = el.closest('#hero') !== null;
      if (isHero || rect.top < windowHeight * 1.05) {
        el.classList.add('revealed');
      } else {
        // Only elements deeper down the page start primed for smooth entrance
        el.classList.add('anim-ready');
      }
    });

    if ('IntersectionObserver' in window) {
      const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
          }
        });
      }, {
        root: null,
        rootMargin: '0px 0px -30px 0px',
        threshold: 0.05
      });

      revealElements.forEach(el => {
        if (el.classList.contains('anim-ready') && !el.classList.contains('revealed')) {
          revealObserver.observe(el);
        }
      });
    } else {
      // Fallback for browsers without IntersectionObserver: reveal all
      revealElements.forEach(el => el.classList.add('revealed'));
    }

  } catch (err) {
    console.error('Error in initScrollReveal:', err);
    // Unconditionally make all elements visible if observer fails
    document.querySelectorAll('.reveal-fade').forEach(el => {
      el.classList.remove('anim-ready');
      el.classList.add('revealed');
    });
  }

  // --------------------------------------------------------------------------
  // 7. TYPING EFFECT (HERO SECTION)
  // --------------------------------------------------------------------------
  try {
    const typedTextEl = document.getElementById('typed-text');
    const roles = [
      'Java Full-Stack Developer',
      'Spring Boot & Microservices Specialist',
      'React.js Developer',
      'Problem Solver (200+ LeetCode Solved)',
      'SIH 2025 CropCare AI Innovator'
    ];

    if (typedTextEl) {
      let roleIndex = 0;
      let charIndex = 0;
      let isDeleting = false;
      let typingSpeed = 90;

      function typeEffect() {
        const currentRole = roles[roleIndex];

        if (isDeleting) {
          charIndex--;
          typingSpeed = 40;
        } else {
          charIndex++;
          typingSpeed = 90;
        }

        typedTextEl.textContent = currentRole.substring(0, charIndex);

        if (!isDeleting && charIndex === currentRole.length) {
          typingSpeed = 2000;
          isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
          isDeleting = false;
          roleIndex = (roleIndex + 1) % roles.length;
          typingSpeed = 400;
        }

        setTimeout(typeEffect, typingSpeed);
      }

      setTimeout(typeEffect, 400);
    }
  } catch (err) {
    console.error('Error in typeEffect:', err);
  }

  // --------------------------------------------------------------------------
  // 8. MOBILE MENU TOGGLE
  // --------------------------------------------------------------------------
  try {
    const menuToggle = document.getElementById('menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

    function openMobileMenu() {
      if (!menuToggle || !mobileMenu) return;
      menuToggle.classList.add('active');
      menuToggle.setAttribute('aria-expanded', 'true');
      mobileMenu.classList.add('open');
      mobileMenu.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }

    function closeMobileMenu() {
      if (!menuToggle || !mobileMenu) return;
      menuToggle.classList.remove('active');
      menuToggle.setAttribute('aria-expanded', 'false');
      mobileMenu.classList.remove('open');
      mobileMenu.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }

    if (menuToggle && mobileMenu) {
      menuToggle.addEventListener('click', () => {
        const isOpen = mobileMenu.classList.contains('open');
        if (isOpen) {
          closeMobileMenu();
        } else {
          openMobileMenu();
        }
      });

      mobileNavLinks.forEach(link => {
        link.addEventListener('click', () => {
          closeMobileMenu();
        });
      });

      document.addEventListener('keydown', (e) => {
        if (e && e.key === 'Escape' && mobileMenu.classList.contains('open')) {
          closeMobileMenu();
        }
      });
    }
  } catch (err) {
    console.error('Error in mobileMenu:', err);
  }

  // --------------------------------------------------------------------------
  // 9. SKILLS CATEGORY FILTERING
  // --------------------------------------------------------------------------
  try {
    const filterBtns = document.querySelectorAll('.skills-filter-tabs .filter-btn');
    const skillCards = document.querySelectorAll('.skills-cards-grid .skill-category-card');

    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => {
          b.classList.remove('active');
          b.setAttribute('aria-selected', 'false');
        });

        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');

        const filterValue = btn.getAttribute('data-filter');

        skillCards.forEach(card => {
          const category = card.getAttribute('data-category');
          if (filterValue === 'all' || category === filterValue) {
            card.style.display = 'block';
            setTimeout(() => {
              card.style.opacity = '1';
              card.style.transform = 'translateY(0)';
            }, 20);
          } else {
            card.style.opacity = '0';
            card.style.transform = 'translateY(10px)';
            setTimeout(() => {
              card.style.display = 'none';
            }, 200);
          }
        });
      });
    });
  } catch (err) {
    console.error('Error in skillsFilter:', err);
  }

  // --------------------------------------------------------------------------
  // 10. CROPCARE AI VISUAL TOGGLE (UI VS ARCHITECTURE)
  // --------------------------------------------------------------------------
  try {
    const displayImg = document.getElementById('cropcare-display-img');
    const viewDashboardBtn = document.getElementById('view-dashboard-btn');
    const viewArchBtn = document.getElementById('view-arch-btn');

    function switchCropCareVisual(btn, targetSrc) {
      if (!displayImg || !btn) return;
      if (viewDashboardBtn) viewDashboardBtn.classList.remove('active');
      if (viewArchBtn) viewArchBtn.classList.remove('active');

      btn.classList.add('active');

      displayImg.style.opacity = '0';
      setTimeout(() => {
        displayImg.src = targetSrc;
        displayImg.style.opacity = '1';
      }, 200);
    }

    if (viewDashboardBtn) {
      viewDashboardBtn.addEventListener('click', () => {
        switchCropCareVisual(viewDashboardBtn, 'assets/images/cropcare-preview.svg');
      });
    }

    if (viewArchBtn) {
      viewArchBtn.addEventListener('click', () => {
        switchCropCareVisual(viewArchBtn, 'assets/images/cropcare-arch.svg');
      });
    }
  } catch (err) {
    console.error('Error in visualToggle:', err);
  }

  // --------------------------------------------------------------------------
  // 11. CROPCARE AI ARCHITECTURE MODAL
  // --------------------------------------------------------------------------
  try {
    const cropcareModal = document.getElementById('cropcare-modal');
    const openModalBtn = document.getElementById('open-cropcare-modal-btn');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const closeModalBottomBtn = document.getElementById('close-modal-bottom-btn');
    const modalTabBtns = document.querySelectorAll('.modal-tab-btn');
    const modalTabPanes = document.querySelectorAll('.modal-tab-pane');

    function openModal() {
      if (!cropcareModal) return;
      cropcareModal.classList.add('open');
      cropcareModal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }

    function closeModal() {
      if (!cropcareModal) return;
      cropcareModal.classList.remove('open');
      cropcareModal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }

    if (openModalBtn) openModalBtn.addEventListener('click', openModal);
    if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
    if (closeModalBottomBtn) closeModalBottomBtn.addEventListener('click', closeModal);

    if (cropcareModal) {
      cropcareModal.addEventListener('click', (e) => {
        if (e.target === cropcareModal) {
          closeModal();
        }
      });

      document.addEventListener('keydown', (e) => {
        if (e && e.key === 'Escape' && cropcareModal.classList.contains('open')) {
          closeModal();
        }
      });
    }

    // Modal Tab Switching
    modalTabBtns.forEach(tabBtn => {
      tabBtn.addEventListener('click', () => {
        modalTabBtns.forEach(b => b.classList.remove('active'));
        modalTabPanes.forEach(p => p.classList.remove('active'));

        tabBtn.classList.add('active');
        const targetPaneId = tabBtn.getAttribute('data-tab');
        const targetPane = document.getElementById(targetPaneId);
        if (targetPane) {
          targetPane.classList.add('active');
        }
      });
    });
  } catch (err) {
    console.error('Error in cropcareModal:', err);
  }

  // --------------------------------------------------------------------------
  // 12. COPY TO CLIPBOARD BUTTONS (EMAIL & PHONE)
  // --------------------------------------------------------------------------
  try {
    const copyButtons = document.querySelectorAll('.copy-btn');

    function fallbackCopyText(text) {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.top = '-9999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        showToast(`Copied "${text}" to clipboard!`, 'success');
      } catch (err) {
        showToast(`Contact: ${text}`, 'error');
      }
      document.body.removeChild(textArea);
    }

    copyButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const textToCopy = btn.getAttribute('data-copy');
        if (!textToCopy) return;

        if (navigator.clipboard && window.isSecureContext) {
          navigator.clipboard.writeText(textToCopy).then(() => {
            showToast(`Copied "${textToCopy}" to clipboard!`, 'success');
          }).catch(() => {
            fallbackCopyText(textToCopy);
          });
        } else {
          fallbackCopyText(textToCopy);
        }
      });
    });
  } catch (err) {
    console.error('Error in copyButtons:', err);
  }

  // --------------------------------------------------------------------------
  // 13. HONEST FRONTEND-ONLY CONTACT FORM
  // --------------------------------------------------------------------------
  try {
    const contactForm = document.getElementById('contact-form');
    const nameInput = document.getElementById('contact-name');
    const emailInput = document.getElementById('contact-email');
    const subjectInput = document.getElementById('contact-subject');
    const messageInput = document.getElementById('contact-message');

    const nameError = document.getElementById('name-error');
    const emailError = document.getElementById('email-error');
    const messageError = document.getElementById('message-error');

    function validateEmail(email) {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return re.test(String(email).toLowerCase());
    }

    if (contactForm) {
      contactForm.addEventListener('submit', (e) => {
        e.preventDefault();

        let isValid = true;

        if (!nameInput.value.trim()) {
          nameError.classList.add('visible');
          isValid = false;
        } else {
          nameError.classList.remove('visible');
        }

        if (!emailInput.value.trim() || !validateEmail(emailInput.value.trim())) {
          emailError.classList.add('visible');
          isValid = false;
        } else {
          emailError.classList.remove('visible');
        }

        if (!messageInput.value.trim()) {
          messageError.classList.add('visible');
          isValid = false;
        } else {
          messageError.classList.remove('visible');
        }

        if (!isValid) return;

        const senderName = nameInput.value.trim();
        const senderEmail = emailInput.value.trim();
        const customSubject = subjectInput.value.trim() || `Inquiry from ${senderName} (Portfolio)`;
        const senderMessage = messageInput.value.trim();

        const mailtoBody = `Name: ${senderName}\nEmail: ${senderEmail}\n\nMessage:\n${senderMessage}`;
        const mailtoLink = `mailto:manjunathan005@gmail.com?subject=${encodeURIComponent(customSubject)}&body=${encodeURIComponent(mailtoBody)}`;

        showToast('Opening default email app to compose message to manjunathan005@gmail.com...', 'success', 5000);

        window.location.href = mailtoLink;

        setTimeout(() => {
          contactForm.reset();
        }, 1000);
      });
    }
  } catch (err) {
    console.error('Error in contactForm:', err);
  }

  // --------------------------------------------------------------------------
  // 14. RESUME DOWNLOAD TRACKING
  // --------------------------------------------------------------------------
  try {
    const resumeDownloadBtns = [
      document.getElementById('header-resume-btn'),
      document.getElementById('hero-resume-download')
    ];

    resumeDownloadBtns.forEach(btn => {
      if (btn) {
        btn.addEventListener('click', () => {
          showToast('Downloading Manjunathan_S_Resume.pdf...', 'success', 3000);
        });
      }
    });
  } catch (err) {
    console.error('Error in resumeDownloadBtns:', err);
  }

  // --------------------------------------------------------------------------
  // 15. INTERACTIVE PARTICLES CANVAS (HERO BACKGROUND)
  // --------------------------------------------------------------------------
  try {
    const canvas = document.getElementById('hero-particles');
    if (canvas && typeof canvas.getContext === 'function') {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      let width = (canvas.width = window.innerWidth);
      let height = (canvas.height = window.innerHeight);

      let particles = [];
      const particleCount = Math.min(Math.floor(width / 24), 50);

      class Particle {
        constructor() {
          this.reset();
        }

        reset() {
          this.x = Math.random() * width;
          this.y = Math.random() * height;
          this.size = Math.random() * 2 + 1;
          this.vx = (Math.random() - 0.5) * 0.5;
          this.vy = (Math.random() - 0.5) * 0.5;
          this.alpha = Math.random() * 0.4 + 0.2;
          this.color = Math.random() > 0.5 ? '#00f2fe' : '#10b981';
        }

        update() {
          this.x += this.vx;
          this.y += this.vy;

          if (this.x < 0 || this.x > width) this.vx *= -1;
          if (this.y < 0 || this.y > height) this.vy *= -1;
        }

        draw() {
          ctx.save();
          ctx.globalAlpha = this.alpha;
          ctx.fillStyle = this.color;
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }

      function initParticles() {
        particles = [];
        for (let i = 0; i < particleCount; i++) {
          particles.push(new Particle());
        }
      }

      function connectParticles() {
        const maxDistance = 110;
        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < maxDistance) {
              const alpha = (1 - dist / maxDistance) * 0.12;
              ctx.save();
              ctx.strokeStyle = '#38bdf8';
              ctx.globalAlpha = alpha;
              ctx.lineWidth = 0.8;
              ctx.beginPath();
              ctx.moveTo(particles[i].x, particles[i].y);
              ctx.lineTo(particles[j].x, particles[j].y);
              ctx.stroke();
              ctx.restore();
            }
          }
        }
      }

      let animationFrameId;
      function animate() {
        ctx.clearRect(0, 0, width, height);
        particles.forEach(p => {
          p.update();
          p.draw();
        });
        connectParticles();
        animationFrameId = requestAnimationFrame(animate);
      }

      initParticles();
      animate();

      window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
        initParticles();
      }, { passive: true });
    }
  } catch (err) {
    console.error('Error in canvasParticles:', err);
  }

}

// Safely execute whether DOM is still loading or already loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPortfolio);
} else {
  initPortfolio();
}
