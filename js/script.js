document.addEventListener('DOMContentLoaded', () => {

    /* ==========================================================================
       Navigation: Sticky state & Mobile Menu
       ========================================================================== */
    const navbar = document.getElementById('navbar');
    const menuToggle = document.getElementById('mobile-menu');
    const navLinks = document.querySelector('.nav-links');
    const navItems = document.querySelectorAll('.nav-links a');

    // Sticky Navbar on Scroll
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Mobile Menu Toggle
    menuToggle.addEventListener('click', () => {
        menuToggle.classList.toggle('active');
        navLinks.classList.toggle('active');
    });

    // Close mobile menu when a link is clicked
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            if (navLinks.classList.contains('active')) {
                menuToggle.classList.remove('active');
                navLinks.classList.remove('active');
            }
        });
    });

    /* ==========================================================================
       Countdown Timer
       ========================================================================== */
    const weddingDate = new Date(2026, 10, 14, 17, 0, 0).getTime();

    const updateCountdown = () => {
        const now = new Date().getTime();
        const distance = weddingDate - now;

        if (distance < 0) {
            document.querySelector('.countdown-container').innerHTML = '<h2>Happily Married!</h2>';
            return;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        document.getElementById('days').innerText = days.toString().padStart(2, '0');
        document.getElementById('hours').innerText = hours.toString().padStart(2, '0');
        document.getElementById('minutes').innerText = minutes.toString().padStart(2, '0');
        document.getElementById('seconds').innerText = seconds.toString().padStart(2, '0');
    };

    setInterval(updateCountdown, 1000);
    updateCountdown();

    /* ==========================================================================
       Intersection Observer for Fade-In Animations
       ========================================================================== */
    const faders = document.querySelectorAll('.fade-in-section');

    const appearOptions = {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    };

    const appearOnScroll = new IntersectionObserver(function (entries, observer) {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
        });
    }, appearOptions);

    faders.forEach(fader => {
        appearOnScroll.observe(fader);
    });

    /* ==========================================================================
       Story Paragraph Divider
       ========================================================================== */
    const storyRight = document.querySelector('.story-right');
    if (storyRight) {
        const paragraphs = storyRight.querySelectorAll('p');
        if (paragraphs.length >= 2) {
            const divider = document.createElement('div');
            divider.className = 'story-divider';
            paragraphs[0].after(divider);
        }
    }

    /* ==========================================================================
       FAQ Accordion
       ========================================================================== */
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        question.addEventListener('click', () => {
            faqItems.forEach(other => {
                if (other !== item) other.classList.remove('active');
            });
            item.classList.toggle('active');
        });
    });

    /* ==========================================================================
       RSVP Form Handling
       ========================================================================== */
    const rsvpForm = document.getElementById('rsvp-form');
    const formMessage = document.getElementById('form-message');
    const guestsGroup = document.getElementById('guests-group');
    const attendanceSelect = document.getElementById('attendance');

    if (attendanceSelect) {
        attendanceSelect.addEventListener('change', (e) => {
            if (e.target.value === 'Regretfully Decline') {
                guestsGroup.style.display = 'none';
            } else {
                guestsGroup.style.display = 'block';
            }
        });
    }

    if (rsvpForm) {
        rsvpForm.addEventListener("submit", async function (event) {
            event.preventDefault();

            const submitBtn = document.getElementById('submit-btn');
            const btnText = submitBtn.querySelector('.btn-text');

            submitBtn.disabled = true;
            btnText.innerText = "Sending...";

            const data = new FormData(event.target);

            try {
                const response = await fetch(event.target.action, {
                    method: rsvpForm.method,
                    body: data,
                    headers: { 'Accept': 'application/json' }
                });

                if (response.ok) {
                    formMessage.classList.remove('hidden', 'error');
                    formMessage.innerText = "Thank you! Your RSVP has been safely received.";
                    rsvpForm.reset();
                } else {
                    formMessage.classList.remove('hidden');
                    formMessage.classList.add('error');
                    formMessage.innerText = "Oops! There was a problem submitting your form.";
                }
            } catch (error) {
                formMessage.classList.remove('hidden');
                formMessage.classList.add('error');
                formMessage.innerText = "Oops! There was a network error submitting your form.";
            } finally {
                submitBtn.disabled = false;
                btnText.innerText = "Send RSVP";
            }
        });
    }

});
