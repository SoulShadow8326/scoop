document.addEventListener('DOMContentLoaded', () => {
    const claimInput = document.getElementById('claim-input');
    const analyzeBtn = document.getElementById('analyze-btn');
    const resultsSection = document.getElementById('results-section');
    const loader = document.getElementById('analysis-loader');

    if (!analyzeBtn || !claimInput) return;

    analyzeBtn.addEventListener('click', async () => {
        const claimText = claimInput.value.trim();
        if (!claimText) return;

        analyzeBtn.disabled = true;
        loader.classList.add('active');
        if (resultsSection) resultsSection.classList.remove('active');

        try {
            const response = await fetch('/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ claim: claimText })
            });

            if (!response.ok) {
                throw new Error('Analysis failed');
            }

            const data = await response.json();
            renderResults(data);
        } catch (error) {
            alert('An error occurred during evidence analysis.');
        } finally {
            analyzeBtn.disabled = false;
            loader.classList.remove('active');
        }
    });

    function renderResults(data) {
        if (!resultsSection) return;
        resultsSection.classList.add('active');
        resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

        animateScore('confidence-score-val', 0, Math.round(data.confidence?.score || 0));
        animateScore('integrity-score-val', 0, Math.round(data.context_integrity?.integrity_score || 0));

        const manipulationData = data.emotional_manipulation || {};
        updateBar('bar-fear', Math.round(manipulationData.fear || 0));
        updateBar('bar-anger', Math.round(manipulationData.anger || 0));
        updateBar('bar-outrage', Math.round(manipulationData.outrage || 0));

        const passportList = document.getElementById('passport-sources-list');
        if (passportList) {
            passportList.innerHTML = '';
            const sources = data.trust_passport?.sources || [];
            if (sources.length === 0) {
                passportList.innerHTML = '<div class="passport-empty">No source passports identified.</div>';
            } else {
                sources.forEach(src => {
                    const item = document.createElement('div');
                    item.className = 'passport-item';
                    item.innerHTML = `
                        <div class="passport-header">
                            <span class="passport-source-name">${src.domain || 'Unknown Publisher'}</span>
                            <span class="passport-badge">${src.reliability_label || 'Unverified'}</span>
                        </div>
                        <div class="passport-metrics">
                            <div class="passport-metric">
                                <span class="metric-lbl">Authority</span>
                                <span class="metric-val">${Math.round((src.authority_score || 0) * 100)}%</span>
                            </div>
                            <div class="passport-metric">
                                <span class="metric-lbl">Transparency</span>
                                <span class="metric-val">${Math.round((src.transparency_score || 0) * 100)}%</span>
                            </div>
                        </div>
                    `;
                    passportList.appendChild(item);
                });
            }
        }

        const judgeRuling = document.getElementById('judge-ruling-text');
        if (judgeRuling) {
            judgeRuling.textContent = data.reasoning?.judge?.ruling || 'No courtroom ruling available.';
        }

        const prosecutorCase = document.getElementById('prosecutor-case-text');
        if (prosecutorCase) {
            prosecutorCase.textContent = data.reasoning?.prosecutor?.argument || 'No prosecutor case built.';
        }

        const defenseCase = document.getElementById('defense-case-text');
        if (defenseCase) {
            defenseCase.textContent = data.reasoning?.defense?.argument || 'No defense case built.';
        }
    }

    function animateScore(id, start, end) {
        const el = document.getElementById(id);
        if (!el) return;
        let current = start;
        const duration = 1000;
        const stepTime = Math.abs(Math.floor(duration / (end - start + 1)));
        const timer = setInterval(() => {
            current += 1;
            el.textContent = current;
            if (current >= end) {
                el.textContent = end;
                clearInterval(timer);
            }
        }, stepTime || 15);
    }

    function updateBar(id, val) {
        const el = document.getElementById(id);
        const text = document.getElementById(id + '-val');
        if (el) el.style.width = val + '%';
        if (text) text.textContent = val + '%';
    }
});
