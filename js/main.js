/**
 * THE SHAPERS ROOM - Main JavaScript
 * Vanilla JS, no dependencies
 */

document.addEventListener('DOMContentLoaded', function () {
    'use strict';

    // Configuration
    const CONFIG = {
        navScrollThreshold: 100,
        navHeightOffset: 80,
        counterDuration: 2000,
        testimonialAutoPlay: 6000,
        parallaxRate: 0.3,
        mobileBreakpoint: 768
    };

    // State
    const state = {
        isMobileMenuOpen: false,
        prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches
    };

    // Listen to reduced motion changes
    window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
        state.prefersReducedMotion = e.matches;
    });

    /**
     * 1. SCROLL ANIMATIONS
     */
    function initScrollAnimations() {
        if (state.prefersReducedMotion) {
            // If reduced motion is preferred, reveal all immediately
            document.querySelectorAll('[data-animate]').forEach(el => el.classList.add('is-visible'));
            return;
        }

        const animateElements = document.querySelectorAll('[data-animate]');
        if (!animateElements.length) return;

        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.15,
            rootMargin: '0px 0px -50px 0px'
        });

        animateElements.forEach(el => observer.observe(el));
    }

    /**
     * 2. NAVIGATION
     */
    function initNavigation() {
        const nav = document.querySelector('.nav');
        if (!nav) return;

        let ticking = false;

        function updateNav() {
            if (window.scrollY > CONFIG.navScrollThreshold) {
                nav.classList.add('nav-scrolled');
            } else {
                nav.classList.remove('nav-scrolled');
            }
            ticking = false;
        }

        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(updateNav);
                ticking = true;
            }
        }, { passive: true });

        // Initial check
        updateNav();
    }

    /**
     * 3. MOBILE NAVIGATION
     */
    function initMobileMenu() {
        const navToggle = document.querySelector('.nav-toggle');
        const navMobile = document.querySelector('.nav-mobile');
        
        if (!navToggle || !navMobile) return;

        // Focus trap elements
        const focusableElements = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
        let firstFocusableElement;
        let lastFocusableElement;

        function updateFocusableElements() {
            const focusableContent = navMobile.querySelectorAll(focusableElements);
            if (focusableContent.length > 0) {
                firstFocusableElement = focusableContent[0];
                lastFocusableElement = focusableContent[focusableContent.length - 1];
            }
        }

        function toggleMenu() {
            state.isMobileMenuOpen = !state.isMobileMenuOpen;
            
            navToggle.classList.toggle('is-active', state.isMobileMenuOpen);
            navMobile.classList.toggle('is-open', state.isMobileMenuOpen);
            document.body.classList.toggle('no-scroll', state.isMobileMenuOpen);
            
            navToggle.setAttribute('aria-expanded', state.isMobileMenuOpen);
            navMobile.setAttribute('aria-hidden', !state.isMobileMenuOpen);

            if (state.isMobileMenuOpen) {
                updateFocusableElements();
                if (firstFocusableElement) firstFocusableElement.focus();
            } else {
                navToggle.focus();
            }
        }

        navToggle.addEventListener('click', toggleMenu);

        // Close when clicking links inside menu
        const navLinks = navMobile.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (state.isMobileMenuOpen) toggleMenu();
            });
        });

        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && state.isMobileMenuOpen) {
                toggleMenu();
            }
        });

        // Focus trap
        navMobile.addEventListener('keydown', (e) => {
            if (!state.isMobileMenuOpen) return;
            
            const isTabPressed = e.key === 'Tab' || e.keyCode === 9;
            if (!isTabPressed) return;

            if (e.shiftKey) { // if shift key pressed for shift + tab combination
                if (document.activeElement === firstFocusableElement) {
                    lastFocusableElement.focus();
                    e.preventDefault();
                }
            } else { // if tab key is pressed
                if (document.activeElement === lastFocusableElement) {
                    firstFocusableElement.focus();
                    e.preventDefault();
                }
            }
        });
    }

    /**
     * 4. SMOOTH SCROLL
     */
    function initSmoothScroll() {
        const anchorLinks = document.querySelectorAll('a[href^="#"]:not([href="#"])');
        
        anchorLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                const targetId = this.getAttribute('href');
                const targetElement = document.querySelector(targetId);
                
                if (targetElement) {
                    e.preventDefault();
                    
                    const elementPosition = targetElement.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - CONFIG.navHeightOffset;
                    
                    window.scrollTo({
                        top: offsetPosition,
                        behavior: state.prefersReducedMotion ? 'auto' : 'smooth'
                    });

                    // Update URL without jump
                    history.pushState(null, null, targetId);
                }
            });
        });
    }

    /**
     * 5. FAQ & OBJECTION ACCORDIONS
     */
    function initAccordions() {
        const accordions = document.querySelectorAll('.accordion-item');
        
        accordions.forEach(accordion => {
            const trigger = accordion.querySelector('.accordion-trigger');
            const content = accordion.querySelector('.accordion-content');
            
            if (!trigger || !content) return;

            // Ensure initial ARIA states
            const isOpen = accordion.classList.contains('is-open');
            trigger.setAttribute('aria-expanded', isOpen);
            content.setAttribute('aria-hidden', !isOpen);
            
            if (isOpen) {
                content.style.maxHeight = content.scrollHeight + 'px';
            } else {
                content.style.maxHeight = '0px';
            }

            function toggleAccordion() {
                const willOpen = !accordion.classList.contains('is-open');
                
                accordion.classList.toggle('is-open');
                trigger.setAttribute('aria-expanded', willOpen);
                content.setAttribute('aria-hidden', !willOpen);
                
                if (willOpen) {
                    content.style.maxHeight = content.scrollHeight + 'px';
                } else {
                    content.style.maxHeight = '0px';
                }
            }

            trigger.addEventListener('click', toggleAccordion);

            // Keyboard accessibility
            trigger.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleAccordion();
                }
            });
        });
        
        // Handle window resize for correct heights
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                const openAccordions = document.querySelectorAll('.accordion-item.is-open .accordion-content');
                openAccordions.forEach(content => {
                    content.style.maxHeight = 'none'; // reset to calculate true height
                    const height = content.scrollHeight;
                    content.style.maxHeight = height + 'px';
                });
            }, 150);
        });
    }

    /**
     * 6. TESTIMONIAL NAVIGATION
     */
    function initTestimonials() {
        const sliders = document.querySelectorAll('.testimonial-slider');
        
        sliders.forEach(slider => {
            const items = slider.querySelectorAll('.testimonial-item');
            const prevBtn = slider.querySelector('.testimonial-prev');
            const nextBtn = slider.querySelector('.testimonial-next');
            const dotsContainer = slider.querySelector('.testimonial-dots');
            
            if (!items.length) return;
            
            let currentIndex = 0;
            let autoPlayInterval;
            
            // Create dots if container exists
            let dots = [];
            if (dotsContainer) {
                items.forEach((_, index) => {
                    const dot = document.createElement('button');
                    dot.classList.add('testimonial-dot');
                    dot.setAttribute('aria-label', `Go to slide ${index + 1}`);
                    if (index === 0) dot.classList.add('is-active');
                    
                    dot.addEventListener('click', () => goToSlide(index));
                    dotsContainer.appendChild(dot);
                    dots.push(dot);
                });
            }

            function goToSlide(index) {
                // Remove active classes
                items[currentIndex]?.classList.remove('is-active');
                if (dots.length) dots[currentIndex]?.classList.remove('is-active');
                
                // Update index
                currentIndex = index;
                if (currentIndex < 0) currentIndex = items.length - 1;
                if (currentIndex >= items.length) currentIndex = 0;
                
                // Add active classes
                items[currentIndex]?.classList.add('is-active');
                if (dots.length) dots[currentIndex]?.classList.add('is-active');
                
                // Announce for screen readers
                slider.setAttribute('aria-live', 'polite');
            }

            function nextSlide() { goToSlide(currentIndex + 1); }
            function prevSlide() { goToSlide(currentIndex - 1); }

            if (nextBtn) nextBtn.addEventListener('click', nextSlide);
            if (prevBtn) prevBtn.addEventListener('click', prevSlide);
            
            // Autoplay
            function startAutoPlay() {
                if (!state.prefersReducedMotion) {
                    autoPlayInterval = setInterval(nextSlide, CONFIG.testimonialAutoPlay);
                }
            }
            
            function stopAutoPlay() {
                clearInterval(autoPlayInterval);
            }
            
            startAutoPlay();
            
            slider.addEventListener('mouseenter', stopAutoPlay);
            slider.addEventListener('mouseleave', startAutoPlay);
            slider.addEventListener('focusin', stopAutoPlay);
            slider.addEventListener('focusout', startAutoPlay);
            
            // Touch Swipe support
            let touchStartX = 0;
            let touchEndX = 0;
            
            slider.addEventListener('touchstart', e => {
                touchStartX = e.changedTouches[0].screenX;
            }, {passive: true});
            
            slider.addEventListener('touchend', e => {
                touchEndX = e.changedTouches[0].screenX;
                if (touchStartX - touchEndX > 50) nextSlide();
                if (touchEndX - touchStartX > 50) prevSlide();
            }, {passive: true});
        });
    }

    /**
     * 7. COUNTER/NUMBER ANIMATION
     */
    function initCounters() {
        const counters = document.querySelectorAll('[data-count-to]');
        if (!counters.length) return;

        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCounter(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        counters.forEach(counter => observer.observe(counter));

        function animateCounter(element) {
            const target = parseInt(element.getAttribute('data-count-to'), 10);
            if (isNaN(target)) return;
            
            if (state.prefersReducedMotion) {
                element.textContent = target;
                return;
            }

            const startTime = performance.now();
            
            function update(currentTime) {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / CONFIG.counterDuration, 1);
                
                // Easing function (easeOutQuart)
                const easeProgress = 1 - Math.pow(1 - progress, 4);
                
                const currentCount = Math.floor(easeProgress * target);
                element.textContent = currentCount;
                
                if (progress < 1) {
                    requestAnimationFrame(update);
                } else {
                    element.textContent = target;
                }
            }
            
            requestAnimationFrame(update);
        }
    }

    /**
     * 8. PARALLAX EFFECT
     */
    function initParallax() {
        if (state.prefersReducedMotion) return;
        
        const parallaxElements = document.querySelectorAll('[data-parallax]');
        if (!parallaxElements.length) return;

        let ticking = false;

        function updateParallax() {
            // Disable on mobile
            if (window.innerWidth < CONFIG.mobileBreakpoint) {
                parallaxElements.forEach(el => el.style.transform = 'none');
                ticking = false;
                return;
            }

            const scrollY = window.scrollY;
            
            parallaxElements.forEach(el => {
                // Only animate if element's parent is roughly in viewport
                const parent = el.parentElement;
                const rect = parent ? parent.getBoundingClientRect() : el.getBoundingClientRect();
                
                if (rect.top <= window.innerHeight && rect.bottom >= 0) {
                    const yOffset = scrollY * CONFIG.parallaxRate;
                    el.style.transform = `translate3d(0, ${yOffset}px, 0)`;
                }
            });
            
            ticking = false;
        }

        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(updateParallax);
                ticking = true;
            }
        }, { passive: true });
        
        window.addEventListener('resize', () => {
            if (!ticking) {
                window.requestAnimationFrame(updateParallax);
                ticking = true;
            }
        }, { passive: true });
        
        updateParallax();
    }

    /**
     * 9. CTA LINK HANDLING
     */
    function initCTAs() {
        const ctaButtons = document.querySelectorAll('[data-action="join"]');
        
        ctaButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                console.log(`CTA Click: ${btn.textContent.trim()}`);
                
                // If it's not a direct link or we want to override behavior
                if (btn.tagName.toLowerCase() !== 'a' || btn.getAttribute('href') === '#') {
                    e.preventDefault();
                    // Scroll to pricing section
                    const pricingSection = document.getElementById('pricing');
                    if (pricingSection) {
                        const offsetPosition = pricingSection.getBoundingClientRect().top + window.pageYOffset - CONFIG.navHeightOffset;
                        window.scrollTo({
                            top: offsetPosition,
                            behavior: state.prefersReducedMotion ? 'auto' : 'smooth'
                        });
                    }
                }
            });
        });
    }

    /**
     * 10. CONTENT LOADING FROM DATA FILE
     */
    function loadContent() {
        const content = window.SHAPERS_CONTENT;
        if (!content) return;
        
        // 1. Load Pricing from data (updates hardcoded HTML)
        if (content.pricing) {
            const priceEl = document.querySelector('.pricing-amount');
            const periodEl = document.querySelector('.pricing-period');
            if (priceEl && content.pricing.amount) {
                priceEl.textContent = `${content.pricing.currency || '₦'}${content.pricing.amount}`;
            }
            if (periodEl && content.pricing.paymentModel) {
                periodEl.textContent = content.pricing.paymentModel;
            }
        }
    }

    /**
     * 11. WELCOME VIDEO SCENE
     */
    function initWelcomeScreen() {
        const welcomeScreen = document.getElementById('welcome-screen');
        const welcomeVideo = document.getElementById('welcome-video');
        const welcomePoster = document.getElementById('welcome-poster');
        const skipBtn = document.getElementById('welcome-skip');

        if (!welcomeScreen) return;

        // Lock body scroll while video plays
        document.body.style.overflow = 'hidden';

        let dismissed = false;

        function dismissWelcome() {
            if (dismissed) return;
            dismissed = true;
            welcomeScreen.classList.add('is-hidden');
            document.body.style.overflow = '';
            if (welcomeVideo) {
                try { welcomeVideo.pause(); } catch(e) {}
            }
            setTimeout(() => {
                welcomeScreen.style.display = 'none';
            }, 800);
        }

        if (skipBtn) {
            skipBtn.addEventListener('click', dismissWelcome);
        }

        // Safety fallback timer: auto dismiss after 6s max so user never gets stuck
        const maxTimer = setTimeout(dismissWelcome, 6000);

        if (welcomeVideo) {
            welcomeVideo.addEventListener('playing', () => {
                if (welcomePoster) {
                    welcomePoster.classList.add('is-hidden');
                }
            });

            welcomeVideo.addEventListener('ended', () => {
                clearTimeout(maxTimer);
                dismissWelcome();
            });

            welcomeVideo.addEventListener('error', () => {
                clearTimeout(maxTimer);
                dismissWelcome();
            });

            welcomeVideo.addEventListener('stalled', () => {
                setTimeout(dismissWelcome, 1500);
            });

            // Attempt video playback explicitly
            const playPromise = welcomeVideo.play();
            if (playPromise !== undefined) {
                playPromise.catch(() => {
                    // Autoplay restricted by browser - show poster then dismiss after 3s
                    setTimeout(dismissWelcome, 3000);
                });
            }
        } else {
            setTimeout(dismissWelcome, 2500);
        }
    }

    // Initialize everything in order
    loadContent(); // Load dynamic content first
    initWelcomeScreen();
    initScrollAnimations();
    initNavigation();
    initMobileMenu();
    initSmoothScroll();
    initAccordions();
    initTestimonials();
    initCounters();
    initParallax();
    initCTAs();

});

