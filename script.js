// Mobile Menu Toggle
const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
const navMenu = document.querySelector('.nav-menu');

if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        mobileMenuToggle.classList.toggle('active');
    });
}

// Close mobile menu when clicking on a link
const navLinks = document.querySelectorAll('.nav-link');
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        mobileMenuToggle.classList.remove('active');
    });
});

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href !== '#' && href !== '#contact') {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
    });
});

// Navbar scroll effect
let lastScroll = 0;
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll <= 0) {
        navbar.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
    } else {
        navbar.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
    }
    
    lastScroll = currentScroll;
});

// Set active nav link based on current page
const currentPage = window.location.pathname.split('/').pop() || 'index.html';
const navLinksAll = document.querySelectorAll('.nav-link');

navLinksAll.forEach(link => {
    const linkHref = link.getAttribute('href');
    if (linkHref === currentPage || (currentPage === '' && linkHref === 'index.html')) {
        link.classList.add('active');
    } else {
        link.classList.remove('active');
    }
});

// Add animation on scroll (optional enhancement)
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements for animation
document.querySelectorAll('.solution-card, .feature-item, .product-card, .pricing-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});

// Testimonials Carousel
const testimonialCards = document.querySelectorAll('.testimonial-card');
const carouselDots = document.querySelectorAll('.carousel-dot');
const prevBtn = document.querySelector('.prev-btn');
const nextBtn = document.querySelector('.next-btn');
let currentSlide = 0;
let autoPlayInterval;

function showSlide(index) {
    // Remove active class from all cards and dots
    testimonialCards.forEach(card => card.classList.remove('active', 'prev'));
    carouselDots.forEach(dot => dot.classList.remove('active'));
    
    // Add active class to current slide
    testimonialCards[index].classList.add('active');
    carouselDots[index].classList.add('active');
    
    currentSlide = index;
}

function nextSlide() {
    const nextIndex = (currentSlide + 1) % testimonialCards.length;
    showSlide(nextIndex);
}

function prevSlide() {
    const prevIndex = (currentSlide - 1 + testimonialCards.length) % testimonialCards.length;
    showSlide(prevIndex);
}

function startAutoPlay() {
    autoPlayInterval = setInterval(nextSlide, 5000); // Change slide every 5 seconds
}

function stopAutoPlay() {
    if (autoPlayInterval) {
        clearInterval(autoPlayInterval);
    }
}

// Initialize carousel if it exists
if (testimonialCards.length > 0) {
    // Set up event listeners
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            nextSlide();
            stopAutoPlay();
            startAutoPlay(); // Restart autoplay after manual navigation
        });
    }
    
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            prevSlide();
            stopAutoPlay();
            startAutoPlay(); // Restart autoplay after manual navigation
        });
    }
    
    // Dot navigation
    carouselDots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            showSlide(index);
            stopAutoPlay();
            startAutoPlay(); // Restart autoplay after manual navigation
        });
    });
    
    // Start autoplay
    startAutoPlay();
    
    // Pause autoplay on hover
    const carousel = document.querySelector('.testimonials-carousel');
    if (carousel) {
        carousel.addEventListener('mouseenter', stopAutoPlay);
        carousel.addEventListener('mouseleave', startAutoPlay);
    }
}

// Contact Form Handling
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // reCAPTCHA is optional - form can submit without it
        let recaptchaResponse = '';
        
        try {
            if (typeof grecaptcha !== 'undefined' && grecaptcha.getResponse) {
                recaptchaResponse = grecaptcha.getResponse();
            }
        } catch (error) {
            console.warn('reCAPTCHA error (continuing without it):', error);
            // Continue without reCAPTCHA if there's an error
        }
        
        // Get form values
        const name = document.getElementById('name').value;
        const company = document.getElementById('company').value;
        const topic = document.getElementById('topic').value;
        const message = document.getElementById('message').value;
        
        // Get topic label
        const topicSelect = document.getElementById('topic');
        const topicLabel = topicSelect.options[topicSelect.selectedIndex].text;
        
        // Show loading state
        const submitButton = contactForm.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.textContent;
        submitButton.disabled = true;
        submitButton.textContent = 'Sending...';
        
        // Prepare form data for submission
        const formDataToSend = new FormData();
        formDataToSend.append('name', name);
        formDataToSend.append('company', company);
        formDataToSend.append('topic', topicLabel);
        formDataToSend.append('message', message);
        formDataToSend.append('recaptcha', recaptchaResponse);
        
        // Send email using Netlify serverless function
        fetch('/.netlify/functions/send-email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: name,
                company: company,
                topic: topicLabel,
                message: message,
                recaptcha: recaptchaResponse
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Thank you for your message! We\'ll get back to you as soon as possible.');
                contactForm.reset();
                if (typeof grecaptcha !== 'undefined' && grecaptcha.reset) {
                    grecaptcha.reset();
                }
            } else {
                alert('Sorry, there was an error sending your message: ' + (data.error || 'Unknown error') + '. Please try again or contact us directly at sales@thewolfgang.tech');
            }
            submitButton.disabled = false;
            submitButton.textContent = originalButtonText;
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Sorry, there was an error sending your message. Please try again or contact us directly at sales@thewolfgang.tech');
            submitButton.disabled = false;
            submitButton.textContent = originalButtonText;
        });
    });
}

// Set current year in footer
const currentYearElement = document.getElementById('current-year');
if (currentYearElement) {
    currentYearElement.textContent = new Date().getFullYear();
}

// reCAPTCHA load callback
window.onRecaptchaLoad = function() {
    console.log('reCAPTCHA loaded');
    // Verify site key is present
    const recaptchaElement = document.querySelector('.g-recaptcha');
    if (recaptchaElement) {
        const siteKey = recaptchaElement.getAttribute('data-sitekey');
        console.log('Site key:', siteKey);
        if (!siteKey || siteKey === 'YOUR_SITE_KEY') {
            console.error('Invalid or missing site key');
        }
    }
};

// Hide reCAPTCHA on localhost
document.addEventListener('DOMContentLoaded', function() {
    const isLocalhost = window.location.hostname === 'localhost' || 
                        window.location.hostname === '127.0.0.1' ||
                        window.location.hostname === '';
    const recaptchaContainer = document.getElementById('recaptcha-container');
    if (recaptchaContainer && isLocalhost) {
        recaptchaContainer.style.display = 'none';
    }
});

// Prefill contact form based on URL parameters
const urlParams = new URLSearchParams(window.location.search);
const plan = urlParams.get('plan');
if (plan && document.getElementById('topic')) {
    const topicSelect = document.getElementById('topic');
    // Map URL parameter to option value
    const planMap = {
        'pay-per-order': 'pay-per-order',
        'pro-rollout': 'pro-rollout'
    };
    const optionValue = planMap[plan];
    if (optionValue) {
        topicSelect.value = optionValue;
        // Scroll to form after a short delay to ensure page is loaded
        setTimeout(() => {
            const form = document.getElementById('contactForm');
            if (form) {
                form.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, 100);
    }
}

