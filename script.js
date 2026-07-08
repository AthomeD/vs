// ===========================
// Vaastu Shastra — single-page interactions
// Panels (auth / profile / inbox), tab switching,
// mock chat, and form validation. No backend yet —
// each form handler has a TODO for where a real
// fetch() call would go.
// ===========================

function showFeedback(el, message, isError) {
    if (!el) return;
    el.textContent = message;
    el.classList.remove('form-feedback--error', 'form-feedback--success');
    el.classList.add(isError ? 'form-feedback--error' : 'form-feedback--success');
    el.hidden = false;
}

function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

// ===========================
// Panel system (auth / profile / inbox)
// ===========================
const backdrop = document.querySelector('[data-backdrop]');
const panels = {
    auth: document.getElementById('auth-drawer'),
    profile: document.getElementById('profile-panel'),
    inbox: document.getElementById('inbox-drawer'),
};

let activePanel = null;
let lastFocused = null;

function openPanel(name, trigger) {
    const panel = panels[name];
    if (!panel) return;

    if (activePanel && activePanel !== panel) {
        closePanel(activePanel, { skipFocusReturn: true });
    }

    lastFocused = trigger || document.activeElement;
    panel.hidden = false;
    backdrop.hidden = false;
    // Force reflow so the transition runs
    void panel.offsetWidth;
    panel.classList.add('is-open');
    backdrop.classList.add('is-visible');
    document.body.classList.add('no-scroll');
    activePanel = panel;

    const focusTarget = panel.querySelector('input, textarea, button:not(.panel-close)');
    if (focusTarget) focusTarget.focus();
}

function closePanel(panel, options) {
    const target = panel || activePanel;
    if (!target) return;
    target.classList.remove('is-open');
    backdrop.classList.remove('is-visible');
    document.body.classList.remove('no-scroll');

    window.setTimeout(function () {
        target.hidden = true;
        if (!document.querySelector('.panel.is-open')) {
            backdrop.hidden = true;
        }
    }, 380);

    if (activePanel === target) activePanel = null;
    if (!(options && options.skipFocusReturn) && lastFocused) {
        lastFocused.focus();
    }
}

document.querySelectorAll('[data-open]').forEach(function (trigger) {
    trigger.addEventListener('click', function () {
        const name = trigger.getAttribute('data-open');
        openPanel(name, trigger);

        if (name === 'auth') {
            const tab = trigger.getAttribute('data-tab') || 'login';
            setAuthTab(tab);
        }
        if (name === 'inbox') {
            const consultant = trigger.getAttribute('data-consultant');
            document.getElementById('chat-consultant-name').textContent = consultant || 'a consultant';
        }
    });
});

document.querySelectorAll('[data-close]').forEach(function (btn) {
    btn.addEventListener('click', function () { closePanel(); });
});

backdrop.addEventListener('click', function () { closePanel(); });

document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && activePanel) closePanel();
});

// ===========================
// Auth drawer tab switching
// ===========================
function setAuthTab(tab) {
    document.querySelectorAll('.auth-tab').forEach(function (btn) {
        const isActive = btn.getAttribute('data-tab-btn') === tab;
        btn.classList.toggle('active', isActive);
        btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });
    document.querySelectorAll('.auth-pane').forEach(function (pane) {
        pane.hidden = pane.getAttribute('data-tab-pane') !== tab;
    });
}

document.querySelectorAll('[data-tab-btn]').forEach(function (el) {
    el.addEventListener('click', function (event) {
        event.preventDefault();
        setAuthTab(el.getAttribute('data-tab-btn'));
    });
});

// ===========================
// Login
// ===========================
const loginForm = document.getElementById('login-form');
if (loginForm) {
    const feedback = document.getElementById('login-feedback');
    loginForm.addEventListener('submit', function (event) {
        event.preventDefault();
        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;

        if (!isValidEmail(email)) {
            showFeedback(feedback, 'Enter a valid email address.', true);
            return;
        }
        if (password.length < 6) {
            showFeedback(feedback, 'Password must be at least 6 characters.', true);
            return;
        }

        // TODO: replace with a real request, e.g.
        // fetch('/api/login', { method: 'POST', body: JSON.stringify({ email, password }) })
        showFeedback(feedback, `Welcome back — logged in as ${email}.`, false);
        loginForm.reset();
    });
}

// ===========================
// Sign up
// ===========================
const signupForm = document.getElementById('signup-form');
if (signupForm) {
    const feedback = document.getElementById('signup-feedback');
    signupForm.addEventListener('submit', function (event) {
        event.preventDefault();
        const name = document.getElementById('signup-name').value.trim();
        const email = document.getElementById('signup-email').value.trim();
        const password = document.getElementById('signup-password').value;
        const confirm = document.getElementById('signup-confirm').value;
        const terms = document.getElementById('signup-terms').checked;

        if (!name) {
            showFeedback(feedback, 'Enter your full name.', true);
            return;
        }
        if (!isValidEmail(email)) {
            showFeedback(feedback, 'Enter a valid email address.', true);
            return;
        }
        if (password.length < 6) {
            showFeedback(feedback, 'Password must be at least 6 characters.', true);
            return;
        }
        if (password !== confirm) {
            showFeedback(feedback, 'Passwords do not match.', true);
            return;
        }
        if (!terms) {
            showFeedback(feedback, 'Please agree to the Terms and Privacy Policy.', true);
            return;
        }

        // TODO: replace with a real request, e.g.
        // fetch('/api/signup', { method: 'POST', body: JSON.stringify({ name, email, password }) })
        showFeedback(feedback, `Account created for ${name}. You're logged in.`, false);
        signupForm.reset();
    });
}

// ===========================
// Profile
// ===========================
const profileSaveBtn = document.getElementById('profile-save');
if (profileSaveBtn) {
    const feedback = document.getElementById('profile-feedback');
    profileSaveBtn.addEventListener('click', function () {
        const name = document.getElementById('profile-name').value.trim();
        const email = document.getElementById('profile-email').value.trim();

        if (!name) {
            showFeedback(feedback, 'Name cannot be empty.', true);
            return;
        }
        if (!isValidEmail(email)) {
            showFeedback(feedback, 'Enter a valid email address.', true);
            return;
        }

        // TODO: replace with a real request, e.g.
        // fetch('/api/profile', { method: 'PUT', body: JSON.stringify({ name, email }) })
        showFeedback(feedback, 'Profile updated.', false);
    });
}

// ===========================
// Contact
// ===========================
const contactForm = document.getElementById('contact-form');
if (contactForm) {
    const feedback = document.getElementById('contact-feedback');
    contactForm.addEventListener('submit', function (event) {
        event.preventDefault();
        const name = document.getElementById('contact-name').value.trim();
        const email = document.getElementById('contact-email').value.trim();
        const message = document.getElementById('contact-message').value.trim();

        if (!name || !message) {
            showFeedback(feedback, 'Fill in your name and message.', true);
            return;
        }
        if (!isValidEmail(email)) {
            showFeedback(feedback, 'Enter a valid email address.', true);
            return;
        }

        // TODO: replace with a real request, e.g.
        // fetch('/api/contact', { method: 'POST', body: JSON.stringify({ name, email, message }) })
        showFeedback(feedback, `Thanks, ${name} — your message is on its way.`, false);
        contactForm.reset();
    });
}

// ===========================
// Inbox / mock chat
// ===========================
const chatForm = document.getElementById('chat-form');
const chatThread = document.getElementById('chat-thread');
if (chatForm && chatThread) {
    chatForm.addEventListener('submit', function (event) {
        event.preventDefault();
        const input = document.getElementById('chat-input');
        const text = input.value.trim();
        if (!text) return;

        const mine = document.createElement('div');
        mine.className = 'chat-bubble chat-bubble--me';
        mine.textContent = text;
        chatThread.appendChild(mine);
        input.value = '';
        chatThread.scrollTop = chatThread.scrollHeight;

        // TODO: replace this mock reply with a real message stream, e.g.
        // fetch('/api/messages', { method: 'POST', body: JSON.stringify({ text }) })
        window.setTimeout(function () {
            const reply = document.createElement('div');
            reply.className = 'chat-bubble chat-bubble--them';
            const name = document.getElementById('chat-consultant-name').textContent;
            reply.textContent = `${name} will reply shortly. Thanks for reaching out!`;
            chatThread.appendChild(reply);
            chatThread.scrollTop = chatThread.scrollHeight;
        }, 700);
    });
}