document.addEventListener('DOMContentLoaded', () => {

    /* ==========================================================================
       Mobile Menu Toggle
       ========================================================================== */
    const menuToggle = document.getElementById('mobile-menu');
    const navLinks = document.querySelector('.nav-links');

    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            menuToggle.classList.toggle('active');
            navLinks.classList.toggle('active');
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

    function initRegistry() {
        if (!window.firebaseDB) {
            setTimeout(initRegistry, 100);
            return;
        }

        const db = window.firebaseDB;
        const registryRef = window.firebaseRef(db, 'registry');

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
            if (item.claimed) return;

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
            registryList.innerHTML = '<p class="registry-loading">All gifts have been claimed! Thank you for your generosity.</p>';
        }

        // Attach click handlers
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

    claimModal.addEventListener('click', (e) => {
        if (e.target === claimModal) {
            claimModal.classList.remove('active');
            currentClaimId = null;
        }
    });

    initRegistry();
});
