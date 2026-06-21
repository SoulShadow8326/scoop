document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('auth-form');
    const nameField = document.getElementById('name-field');
    const nameInput = document.getElementById('auth-name');
    const emailInput = document.getElementById('auth-email');
    const passwordInput = document.getElementById('auth-password');
    const submitBtn = document.getElementById('auth-submit');
    const googleBtn = document.getElementById('auth-google');

    const eyebrow = document.getElementById('auth-eyebrow');
    const title = document.getElementById('auth-title');
    const sub = document.getElementById('auth-sub');
    const switchText = document.getElementById('auth-switch-text');
    const switchBtn = document.getElementById('auth-switch-btn');

    let mode = 'signin';

    function applyMode() {
        if (mode === 'signin') {
            eyebrow.textContent = 'Welcome back';
            title.textContent = 'Sign in to Scoop';
            sub.textContent = 'Understand a claim before you believe it.';
            submitBtn.textContent = 'Sign in';
            switchText.textContent = 'New to Scoop?';
            switchBtn.textContent = 'Create an account';
            nameField.hidden = true;
            passwordInput.setAttribute('autocomplete', 'current-password');
        } else {
            eyebrow.textContent = 'Get started';
            title.textContent = 'Create your account';
            sub.textContent = 'Set up Scoop for your community in under a minute.';
            submitBtn.textContent = 'Create account';
            switchText.textContent = 'Already have an account?';
            switchBtn.textContent = 'Sign in';
            nameField.hidden = false;
            passwordInput.setAttribute('autocomplete', 'new-password');
        }
    }

    switchBtn.addEventListener('click', () => {
        mode = mode === 'signin' ? 'signup' : 'signin';
        applyMode();
    });

    function proceed() {
        const profile = {
            name: (nameInput.value || '').trim(),
            email: (emailInput.value || '').trim(),
            signedInAt: new Date().toISOString()
        };
        try {
            localStorage.setItem('scoop_auth', JSON.stringify(profile));
        } catch (e) {}
        window.location.href = '/onboarding';
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!emailInput.value.trim() || !passwordInput.value.trim()) {
            (emailInput.value.trim() ? passwordInput : emailInput).focus();
            return;
        }
        proceed();
    });

    googleBtn.addEventListener('click', proceed);

    applyMode();
});
