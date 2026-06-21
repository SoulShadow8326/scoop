document.addEventListener('DOMContentLoaded', () => {
    const steps = Array.from(document.querySelectorAll('.onb-step'));
    const progressBar = document.getElementById('onb-progress-bar');
    const stepLabel = document.getElementById('onb-step-label');
    const stepName = document.getElementById('onb-step-name');
    const backBtn = document.getElementById('onb-back');
    const skipBtn = document.getElementById('onb-skip');
    const nextBtn = document.getElementById('onb-next');

    const total = steps.length;
    const stepNames = ['Your role', 'Your community', 'Your interests'];
    let current = 0;

    const profile = { role: '', institution: '', community: '', interests: [] };

    function render() {
        steps.forEach((s, i) => { s.hidden = i !== current; });
        const pct = Math.round(((current + 1) / total) * 100);
        progressBar.style.width = pct + '%';
        stepLabel.textContent = 'Step ' + (current + 1) + ' of ' + total;
        stepName.textContent = stepNames[current];
        backBtn.hidden = current === 0;
        nextBtn.textContent = current === total - 1 ? 'Enter Scoop' : 'Continue';
        skipBtn.hidden = current === 0;
        updateNextState();
    }

    function updateNextState() {
        if (current === 0) {
            nextBtn.disabled = !profile.role;
        } else {
            nextBtn.disabled = false;
        }
    }

    const roleOptions = document.getElementById('role-options');
    roleOptions.addEventListener('click', (e) => {
        const btn = e.target.closest('.onb-option');
        if (!btn) return;
        roleOptions.querySelectorAll('.onb-option').forEach(o => o.classList.remove('selected'));
        btn.classList.add('selected');
        profile.role = btn.dataset.value;
        updateNextState();
    });

    const interestChips = document.getElementById('interest-chips');
    interestChips.addEventListener('click', (e) => {
        const chip = e.target.closest('.onb-chip');
        if (!chip) return;
        chip.classList.toggle('selected');
        const val = chip.dataset.value;
        const idx = profile.interests.indexOf(val);
        if (idx === -1) profile.interests.push(val);
        else profile.interests.splice(idx, 1);
    });

    function captureStep() {
        if (current === 1) {
            profile.institution = (document.getElementById('onb-institution').value || '').trim();
            profile.community = (document.getElementById('onb-community').value || '').trim();
        }
    }

    function finish() {
        captureStep();
        try {
            const auth = JSON.parse(localStorage.getItem('scoop_auth') || '{}');
            const merged = Object.assign({}, auth, profile, { onboardedAt: new Date().toISOString() });
            localStorage.setItem('scoop_profile', JSON.stringify(merged));
            localStorage.setItem('scoop_onboarded', 'true');
        } catch (e) {}
        window.location.href = '/app';
    }

    nextBtn.addEventListener('click', () => {
        if (nextBtn.disabled) return;
        captureStep();
        if (current === total - 1) {
            finish();
            return;
        }
        current += 1;
        render();
    });

    backBtn.addEventListener('click', () => {
        if (current === 0) return;
        captureStep();
        current -= 1;
        render();
    });

    skipBtn.addEventListener('click', () => {
        if (current === total - 1) {
            finish();
            return;
        }
        current += 1;
        render();
    });

    render();
});
