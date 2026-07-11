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
    // Set wedding date here (Year, Month (0-indexed so 14=November), Day, Hour, Min)
    const weddingDate = new Date(2026, 10, 14, 15, 0, 0).getTime();

    const updateCountdown = () => {
        const now = new Date().getTime();
        const distance = weddingDate - now;

        if (distance < 0) {
            // Wedding has passed naturally
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

    // Update countdown every second
    setInterval(updateCountdown, 1000);
    updateCountdown(); // Initial call


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
            if (!entry.isIntersecting) {
                return;
            } else {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target); // Stop observing once visible
            }
        });
    }, appearOptions);

    faders.forEach(fader => {
        appearOnScroll.observe(fader);
    });

    /* ==========================================================================
       RSVP Form Handling (Formspree fallback/UI logic)
       ========================================================================== */
    const rsvpForm = document.getElementById('rsvp-form');
    const formMessage = document.getElementById('form-message');
    const guestsGroup = document.getElementById('guests-group');
    const attendanceSelect = document.getElementById('attendance');

    // Show/hide guests based on attendance
    attendanceSelect.addEventListener('change', (e) => {
        if (e.target.value === 'Regretfully Decline') {
            guestsGroup.style.display = 'none';
        } else {
            guestsGroup.style.display = 'block';
        }
    });

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
                    headers: {
                        'Accept': 'application/json'
                    }
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

    /* ==========================================================================
       Gift Registry (Firebase)
       ========================================================================== */
    const registryList = document.getElementById('registry-list');
    const claimModal = document.getElementById('claim-modal');
    const claimConfirm = document.getElementById('claim-confirm');
    const claimCancel = document.getElementById('claim-cancel');
    const claimModalText = document.getElementById('claim-modal-text');
    let currentClaimId = null;

    // Wait for Firebase to initialize
    function initRegistry() {
        if (!window.firebaseDB) {
            setTimeout(initRegistry, 100);
            return;
        }

        const db = window.firebaseDB;
        const registryRef = window.firebaseRef(db, 'registry');

        // Listen for real-time updates
        window.firebaseOnValue(registryRef, (snapshot) => {
            const items = snapshot.val();
            renderRegistry(items);
        });
    }

    function renderRegistry(items) {
        if (!items) {
            registryList.innerHTML = '<p class="registry-loading">No items available yet.</p>';
            return;
        }

        registryList.innerHTML = '';
        let hasAvailable = false;

        Object.keys(items).forEach(key => {
            const item = items[key];
            if (item.claimed) return; // Don't show claimed items

            hasAvailable = true;
            const card = document.createElement('div');
            card.className = 'registry-item';
            card.innerHTML = `
                <h4>${item.name}</h4>
                <p>${item.description || ''}</p>
                <button class="claim-btn" data-id="${key}" data-name="${item.name}">I'll get this</button>
            `;
            registryList.appendChild(card);
        });

        if (!hasAvailable) {
            registryList.innerHTML = '<p class="registry-loading">All gifts have been claimed! Consider contributing to our honeymoon fund below.</p>';
        }

        // Attach click handlers to claim buttons
        document.querySelectorAll('.claim-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                currentClaimId = e.target.dataset.id;
                claimModalText.textContent = `Are you sure you want to claim "${e.target.dataset.name}"?`;
                claimModal.classList.add('active');
            });
        });
    }

    // Modal handlers
    claimCancel.addEventListener('click', () => {
        claimModal.classList.remove('active');
        currentClaimId = null;
    });

    claimConfirm.addEventListener('click', () => {
        if (!currentClaimId || !window.firebaseDB) return;

        const db = window.firebaseDB;
        const itemRef = window.firebaseRef(db, `registry/${currentClaimId}`);
        window.firebaseUpdate(itemRef, { claimed: true });

        claimModal.classList.remove('active');
        currentClaimId = null;
    });

    // Close modal on backdrop click
    claimModal.addEventListener('click', (e) => {
        if (e.target === claimModal) {
            claimModal.classList.remove('active');
            currentClaimId = null;
        }
    });

    initRegistry();

});
