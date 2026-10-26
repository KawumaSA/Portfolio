document.addEventListener('DOMContentLoaded', function(){
  // Initialize all functionality
  initTheme();
  initNavigation();
  initBackToTop();
  initSmoothScrolling();
  initContactForm();
  initProjectFiltering();
  initSkillsAnimation();
  initLightbox();
  initImageOptimization();
  
  // Set current year
  const yearEl = document.getElementById('year');
  if(yearEl) yearEl.textContent = new Date().getFullYear();
});

// Dark Mode Theme Toggle
function initTheme() {
  const themeToggle = document.querySelector('.theme-toggle');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
  
  // Get saved theme or use system preference
  const savedTheme = localStorage.getItem('theme');
  const systemTheme = prefersDark.matches ? 'dark' : 'light';
  const currentTheme = savedTheme || systemTheme;
  
  // Apply theme
  document.documentElement.setAttribute('data-theme', currentTheme);
  
  // Update toggle button state
  updateThemeToggle(currentTheme);
  
  // Toggle theme on button click
  themeToggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const newTheme = current === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeToggle(newTheme);
  });
  
  // Listen for system theme changes
  prefersDark.addEventListener('change', (e) => {
    if (!localStorage.getItem('theme')) {
      const newTheme = e.matches ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', newTheme);
      updateThemeToggle(newTheme);
    }
  });
  
  function updateThemeToggle(theme) {
    const themeToggle = document.querySelector('.theme-toggle');
    const sun = themeToggle.querySelector('.sun');
    const moon = themeToggle.querySelector('.moon');
    
    if (theme === 'dark') {
      themeToggle.setAttribute('aria-label', 'Switch to light mode');
      sun.style.opacity = '0';
      moon.style.opacity = '1';
    } else {
      themeToggle.setAttribute('aria-label', 'Switch to dark mode');
      sun.style.opacity = '1';
      moon.style.opacity = '0';
    }
  }
}

// Navigation
function initNavigation() {
  const navToggle = document.querySelector('.nav-toggle');
  const navList = document.getElementById('primary-navigation');
  
  if(navToggle && navList){
    navToggle.addEventListener('click', ()=>{
      const expanded = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', String(!expanded));
      navList.classList.toggle('active', !expanded);
    });

    // Close menu when clicking on links
    navList.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navList.classList.remove('active');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });

    // Reset nav on resize
    const resetNavOnResize = ()=>{
      if(window.innerWidth > 800){
        navList.classList.remove('active');
        navToggle.setAttribute('aria-expanded','false');
      }
    };
    window.addEventListener('resize', resetNavOnResize);
  }
}

// Back to Top
function initBackToTop() {
  const backBtn = document.getElementById('back-to-top');
  if(backBtn){
    const checkScroll = ()=>{
      if(window.scrollY > 300){
        backBtn.classList.add('show');
        backBtn.setAttribute('aria-hidden','false');
      }else{
        backBtn.classList.remove('show');
        backBtn.setAttribute('aria-hidden','true');
      }
    };
    
    checkScroll();
    window.addEventListener('scroll', checkScroll, {passive:true});

    backBtn.addEventListener('click', function(){
      window.scrollTo({top:0,behavior:'smooth'});
      this.blur();
    });

    backBtn.addEventListener('keydown', function(e){
      if(e.key === 'Enter' || e.key === ' '){
        e.preventDefault();
        this.click();
      }
    });
  }
}

// Smooth Scrolling
function initSmoothScrolling() {
  document.querySelectorAll('a[href^="#"]').forEach(a=>{
    a.addEventListener('click', function(e){
      const href = this.getAttribute('href');
      if(href.length>1){
        e.preventDefault();
        const target = document.querySelector(href);
        if(target) target.scrollIntoView({behavior:'smooth',block:'start'});
        
        // Close mobile menu after clicking link
        const navList = document.getElementById('primary-navigation');
        const navToggle = document.querySelector('.nav-toggle');
        if(navList && window.innerWidth<=800) { 
          navList.classList.remove('active'); 
          navToggle.setAttribute('aria-expanded','false'); 
        }
      }
    });
  });
}

// Contact Form with Actual Submission (Formspree)
function initContactForm() {
  const form = document.getElementById('contact-form');
  const status = document.getElementById('form-status');
  
  if(!form) return;

  const nameInput = form.querySelector('#name');
  const emailInput = form.querySelector('#email');
  const messageInput = form.querySelector('#message');
  const submitBtn = form.querySelector('button[type="submit"]');

  // Validation functions
  function showFieldError(el, msg){
    let next = el.nextElementSibling;
    if(!next || !next.classList.contains('field-error')){
      next = document.createElement('div');
      next.className = 'field-error';
      el.parentNode.insertBefore(next, el.nextSibling);
    }
    next.textContent = msg;
  }

  function clearFieldError(el){
    let next = el.nextElementSibling;
    if(next && next.classList.contains('field-error')) next.textContent = '';
  }

  function isEmail(v){
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  }

  function validateAll(){
    let ok = true;
    if(!nameInput.value.trim()){ showFieldError(nameInput,'Name is required'); ok=false } else clearFieldError(nameInput);
    if(!emailInput.value.trim()){ showFieldError(emailInput,'Email is required'); ok=false }
    else if(!isEmail(emailInput.value.trim())){ showFieldError(emailInput,'Enter a valid email'); ok=false } else clearFieldError(emailInput);
    if(!messageInput.value.trim()){ showFieldError(messageInput,'Please write a short message'); ok=false } else clearFieldError(messageInput);
    return ok;
  }

  // Live validation
  [nameInput,emailInput,messageInput].forEach(el=>{
    el.addEventListener('input', ()=>{ clearFieldError(el); status.textContent = ''; status.className = 'form-status'; });
  });

  form.addEventListener('submit', async function(e){
    e.preventDefault();
    status.textContent = '';
    status.className = 'form-status';
    
    if(!validateAll()) return;

    const formData = new FormData(form);
    submitBtn.disabled = true;
    status.textContent = 'Sending message...';
    status.className = 'form-status info';

    try {
      const response = await fetch(form.action, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        status.textContent = 'Message sent successfully! I\'ll get back to you soon.';
        status.className = 'form-status success';
        form.reset();
      } else {
        throw new Error('Form submission failed');
      }
    } catch (error) {
      status.textContent = 'Sorry, there was a problem sending your message. Please try again later or contact me directly.';
      status.className = 'form-status error';
      console.error('Form submission error:', error);
    } finally {
      submitBtn.disabled = false;
    }
  });
}

// Project Filtering
function initProjectFiltering() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.projects-grid .card');
  
  filterBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      // Update active button
      filterBtns.forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      
      const filter = this.getAttribute('data-filter');
      
      // Filter projects
      projectCards.forEach(card => {
        if (filter === 'all' || card.getAttribute('data-category').includes(filter)) {
          card.style.display = 'block';
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, 50);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'translateY(20px)';
          setTimeout(() => {
            card.style.display = 'none';
          }, 300);
        }
      });
    });
  });
}

// Skills Progress Animation
function initSkillsAnimation() {
  const skillItems = document.querySelectorAll('.skill-progress');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const percent = entry.target.getAttribute('data-percent');
        entry.target.style.width = percent + '%';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  
  skillItems.forEach(skill => {
    observer.observe(skill);
  });
}

// Unified Lightbox System with Better Zoom
function initLightbox() {
  const lightbox = document.getElementById('lightbox');
  const lbImg = document.getElementById('lightbox-img');
  const lbClose = lightbox.querySelector('.lightbox-close');
  const lbPrev = lightbox.querySelector('.lightbox-prev');
  const lbNext = lightbox.querySelector('.lightbox-next');
  const lbCaption = document.getElementById('lightbox-caption');
  
  let currentGallery = [];
  let currentIndex = 0;
  let lastFocusedEl = null;
  let isZoomed = false;
  let zoomBtn = null;

  // Create zoom button if it doesn't exist
  if (!lightbox.querySelector('.lightbox-zoom')) {
    zoomBtn = document.createElement('button');
    zoomBtn.className = 'lightbox-zoom';
    zoomBtn.innerHTML = '🔍';
    zoomBtn.setAttribute('aria-label', 'Zoom image');
    zoomBtn.setAttribute('title', 'Zoom');
    lightbox.querySelector('.lightbox-controls').appendChild(zoomBtn);
  } else {
    zoomBtn = lightbox.querySelector('.lightbox-zoom');
  }

  // Hero image lightbox
  const heroImg = document.querySelector('.hero-media img');
  if (heroImg) {
    heroImg.style.cursor = 'zoom-in';
    heroImg.addEventListener('click', () => {
      openLightbox([{
        src: heroImg.getAttribute('data-full') || heroImg.src,
        alt: heroImg.alt,
        caption: 'Profile picture'
      }], 0);
    });
  }

  // Project images lightbox
  const projectThumbs = document.querySelectorAll('.project-thumb');
  const projectItems = Array.from(projectThumbs).map((thumb, index) => ({
    src: thumb.getAttribute('data-full') || thumb.src,
    alt: thumb.alt,
    caption: thumb.getAttribute('data-caption') || `Project ${index + 1}`,
    element: thumb
  }));

  projectThumbs.forEach((thumb, index) => {
    thumb.style.cursor = 'zoom-in';
    thumb.addEventListener('click', () => {
      openLightbox(projectItems, index);
    });
    
    // Keyboard support
    thumb.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openLightbox(projectItems, index);
      }
    });
  });

  function openLightbox(items, startIndex) {
    currentGallery = items;
    currentIndex = startIndex;
    lastFocusedEl = document.activeElement;
    
    showCurrentImage();
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    
    // Reset zoom state
    resetZoom();
    
    lbClose.focus();
  }

  function showCurrentImage() {
    const item = currentGallery[currentIndex];
    if (!item) return;
    
    // Show loading state
    lbImg.style.opacity = '0.5';
    
    const onLoad = () => {
      lbImg.style.opacity = '1';
      if (lbCaption) lbCaption.textContent = item.caption;
      
      // Auto-zoom decision based on image size vs viewport
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const imgNaturalWidth = lbImg.naturalWidth;
      const imgNaturalHeight = lbImg.naturalHeight;
      
      // If image is significantly larger than viewport, suggest zoom
      const shouldAutoZoom = imgNaturalWidth > viewportWidth * 1.2 || 
                           imgNaturalHeight > viewportHeight * 1.2;
      
      if (shouldAutoZoom && !isZoomed) {
        toggleZoom();
      }
    };
    
    lbImg.onload = onLoad;
    lbImg.onerror = () => {
      lbImg.style.opacity = '1';
      if (lbCaption) lbCaption.textContent = 'Image failed to load';
    };
    
    lbImg.src = item.src;
    lbImg.alt = item.alt;
  }

  function toggleZoom() {
    isZoomed = !isZoomed;
    
    if (isZoomed) {
      lightbox.classList.add('zoomed');
      zoomBtn.innerHTML = '🔎';
      zoomBtn.setAttribute('aria-label', 'Zoom out');
      zoomBtn.setAttribute('title', 'Zoom out');
      
      // Center the image in viewport
      centerZoomedImage();
    } else {
      lightbox.classList.remove('zoomed');
      zoomBtn.innerHTML = '🔍';
      zoomBtn.setAttribute('aria-label', 'Zoom in');
      zoomBtn.setAttribute('title', 'Zoom in');
    }
  }

  function resetZoom() {
    isZoomed = false;
    lightbox.classList.remove('zoomed');
    if (zoomBtn) {
      zoomBtn.innerHTML = '🔍';
      zoomBtn.setAttribute('aria-label', 'Zoom in');
      zoomBtn.setAttribute('title', 'Zoom in');
    }
  }

  function centerZoomedImage() {
    if (!isZoomed) return;
    
    setTimeout(() => {
      const content = lightbox.querySelector('.lightbox-content');
      if (content.scrollHeight > content.clientHeight) {
        content.scrollTop = (content.scrollHeight - content.clientHeight) / 2;
      }
      if (content.scrollWidth > content.clientWidth) {
        content.scrollLeft = (content.scrollWidth - content.clientWidth) / 2;
      }
    }, 50);
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    resetZoom();
    
    if (lastFocusedEl) {
      lastFocusedEl.focus();
    }
  }

  // Event listeners
  lbClose.addEventListener('click', closeLightbox);
  
  if (zoomBtn) {
    zoomBtn.addEventListener('click', toggleZoom);
  }

  lbPrev.addEventListener('click', () => {
    if (currentGallery.length > 1) {
      currentIndex = (currentIndex - 1 + currentGallery.length) % currentGallery.length;
      resetZoom();
      showCurrentImage();
    }
  });
  
  lbNext.addEventListener('click', () => {
    if (currentGallery.length > 1) {
      currentIndex = (currentIndex + 1) % currentGallery.length;
      resetZoom();
      showCurrentImage();
    }
  });

  // Double-click to toggle zoom
  lbImg.addEventListener('dblclick', (e) => {
    e.preventDefault();
    toggleZoom();
  });

  // Backdrop click
  lightbox.addEventListener('click', (e) => {
    if (e.target.classList.contains('lightbox-backdrop')) {
      closeLightbox();
    }
  });

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('open')) return;
    
    switch(e.key) {
      case 'Escape':
        closeLightbox();
        break;
      case 'ArrowLeft':
        if (currentGallery.length > 1) {
          currentIndex = (currentIndex - 1 + currentGallery.length) % currentGallery.length;
          resetZoom();
          showCurrentImage();
        }
        break;
      case 'ArrowRight':
        if (currentGallery.length > 1) {
          currentIndex = (currentIndex + 1) % currentGallery.length;
          resetZoom();
          showCurrentImage();
        }
        break;
      case 'z':
      case 'Z':
        e.preventDefault();
        toggleZoom();
        break;
      case ' ':
        // Space to toggle zoom only when not in a button
        if (e.target.tagName !== 'BUTTON') {
          e.preventDefault();
          toggleZoom();
        }
        break;
    }
  });

   // Handle window resize for zoomed images
  window.addEventListener('resize', () => {
    if (isZoomed) {
      centerZoomedImage();
    }
  });

  // Touch gestures for mobile zoom
  let initialDistance = null;
  
   lightbox.addEventListener('touchstart', (e) => {
    if (e.touches.length === 2) {
      initialDistance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
    }
  });

  lightbox.addEventListener('touchmove', (e) => {
    if (e.touches.length === 2 && initialDistance !== null) {
      e.preventDefault();
      const currentDistance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );

	  // Zoom in/out based on pinch gesture
      if (currentDistance > initialDistance + 50 && !isZoomed) {
        toggleZoom();
        initialDistance = null;
      } else if (currentDistance < initialDistance - 50 && isZoomed) {
        toggleZoom();
        initialDistance = null;
      }
    }
  });

   lightbox.addEventListener('touchend', () => {
    initialDistance = null;
  });
}

// Image Optimization
function initImageOptimization() {
  // Lazy loading for images
  const images = document.querySelectorAll('img[loading="lazy"]');
  
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.src;
          imageObserver.unobserve(img);
        }
      });
    });

    images.forEach(img => imageObserver.observe(img));
  }

  // Add blur-up effect for hero image
  const heroImg = document.querySelector('.hero-media img');
  if (heroImg) {
    heroImg.addEventListener('load', function() {
      this.style.filter = 'blur(0)';
      this.style.transition = 'filter 0.5s ease-out';
    });
    
    // Initial blur for loading
    heroImg.style.filter = 'blur(10px)';
  }
}

// Intersection Observer for scroll animations
function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.animationPlayState = 'running';
        observer.unobserve(entry.target);
      }
    });
  });

  // Observe elements with animations
  document.querySelectorAll('[style*="animation"]').forEach(el => {
    el.style.animationPlayState = 'paused';
    observer.observe(el);
  });
}

// Initialize scroll animations
initScrollAnimations();