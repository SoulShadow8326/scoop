document.addEventListener('DOMContentLoaded', () => {
    const claimInput = document.getElementById('claim-input');
    const analyzeBtn = document.getElementById('analyze-btn');
    const messageBox = document.getElementById('preview-message');
    const messageText = document.getElementById('preview-message-text');
    const progressBox = document.getElementById('preview-progress');
    const progressStage = document.getElementById('progress-stage');
    const progressPct = document.getElementById('progress-pct');
    const progressBar = document.getElementById('progress-bar');
    const resultsBox = document.getElementById('preview-results');

    if (!analyzeBtn || !claimInput) return;

    const stages = [
        { pct: 12, label: 'Validating your question' },
        { pct: 38, label: 'Reading emotional framing' },
        { pct: 62, label: 'Checking context integrity' },
        { pct: 84, label: 'Fingerprinting the claim' }
    ];

    let stageTimer = null;

    function startProgress() {
        messageBox.classList.remove('active');
        resultsBox.classList.remove('active');
        progressBox.classList.add('active');

        let index = 0;
        setProgress(stages[0].pct, stages[0].label);

        stageTimer = setInterval(() => {
            index += 1;
            if (index >= stages.length) {
                clearInterval(stageTimer);
                return;
            }
            setProgress(stages[index].pct, stages[index].label);
        }, 900);
    }

    function setProgress(pct, label) {
        progressBar.style.width = pct + '%';
        progressPct.textContent = pct + '%';
        if (label) progressStage.textContent = label;
    }

    function finishProgress(callback) {
        if (stageTimer) clearInterval(stageTimer);
        setProgress(100, 'Report ready');
        setTimeout(() => {
            progressBox.classList.remove('active');
            setProgress(0, stages[0].label);
            callback();
        }, 450);
    }

    function showMessage(text) {
        if (stageTimer) clearInterval(stageTimer);
        progressBox.classList.remove('active');
        resultsBox.classList.remove('active');
        messageText.textContent = text;
        messageBox.classList.add('active');
    }

    async function runAnalysis() {
        const claimText = claimInput.value.trim();
        if (!claimText) {
            showMessage('Please enter a real claim or question we can analyze.');
            return;
        }

        analyzeBtn.disabled = true;
        startProgress();

        try {
            const response = await fetch('/landing/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ claim: claimText })
            });

            if (!response.ok) throw new Error('Request failed');

            const data = await response.json();

            if (!data.valid) {
                showMessage(data.message || 'Please enter a real claim or question we can analyze.');
                return;
            }

            finishProgress(() => renderPreview(data));
        } catch (error) {
            showMessage('Something went wrong while reading that claim. Please try again.');
        } finally {
            analyzeBtn.disabled = false;
        }
    }

    analyzeBtn.addEventListener('click', runAnalysis);
    claimInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') runAnalysis();
    });

    function renderPreview(data) {
        document.getElementById('preview-claim-text').textContent = data.claim || '';

        const manip = data.emotional_manipulation || {};
        setFraming('framing-fear', normalize(manip.fear));
        setFraming('framing-anger', normalize(manip.anger));
        setFraming('framing-outrage', normalize(manip.outrage));

        const integrity = data.context_integrity || {};
        const integrityScore = Math.round(normalizeScore(integrity.integrity_score));
        animateScore('integrity-score-val', 0, integrityScore);
        renderFlags(integrity);

        const dna = data.information_dna || {};
        document.getElementById('dna-canonical').textContent =
            dna.canonical_form || data.claim || 'No canonical form generated.';
        const fp = dna.fingerprint || '';
        document.getElementById('dna-fingerprint').textContent =
            fp ? 'Fingerprint ' + fp : 'No fingerprint generated.';

        resultsBox.classList.add('active');
    }

    function setFraming(id, val) {
        const bar = document.getElementById(id);
        const label = document.getElementById(id + '-val');
        if (bar) {
            requestAnimationFrame(() => { bar.style.width = val + '%'; });
        }
        if (label) label.textContent = val + '%';
    }

    function renderFlags(integrity) {
        const list = document.getElementById('integrity-flags');
        list.innerHTML = '';

        const checks = [
            { keys: ['missing_date', 'is_temporally_misleading'], risk: 'Date missing', clear: 'Date present' },
            { keys: ['missing_source'], risk: 'Source unknown', clear: 'Source identified' },
            { keys: ['selective_quotation', 'is_selectively_edited', 'is_misquoted'], risk: 'Selective quoting', clear: 'Wording consistent' },
            { keys: ['cropped_context', 'is_decontextualized'], risk: 'Cropped context', clear: 'Context preserved' }
        ];

        checks.forEach(check => {
            const flagged = check.keys.some(key => Boolean(integrity[key]));
            const li = document.createElement('li');
            li.className = flagged ? 'flag-risk' : 'flag-clear';
            li.textContent = flagged ? check.risk : check.clear;
            list.appendChild(li);
        });
    }

    function normalize(value) {
        const num = Number(value) || 0;
        const scaled = num <= 1 ? num * 100 : num;
        return Math.max(0, Math.min(100, Math.round(scaled)));
    }

    function normalizeScore(value) {
        const num = Number(value);
        if (Number.isNaN(num)) return 0;
        const scaled = num <= 1 ? num * 100 : num;
        return Math.max(0, Math.min(100, scaled));
    }

    function animateScore(id, start, end) {
        const el = document.getElementById(id);
        if (!el) return;
        if (end <= start) {
            el.textContent = end;
            return;
        }
        let current = start;
        const duration = 900;
        const stepTime = Math.max(12, Math.floor(duration / (end - start)));
        const timer = setInterval(() => {
            current += 1;
            el.textContent = current;
            if (current >= end) {
                el.textContent = end;
                clearInterval(timer);
            }
        }, stepTime);
    }
});
