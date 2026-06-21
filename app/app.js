document.addEventListener('DOMContentLoaded', () => {
    const claimInput = document.getElementById('claim-input');
    const analyzeBtn = document.getElementById('analyze-btn');
    const messageBox = document.getElementById('app-message');
    const messageText = document.getElementById('app-message-text');
    const progressBox = document.getElementById('app-progress');
    const progressStage = document.getElementById('progress-stage');
    const progressPct = document.getElementById('progress-pct');
    const progressBar = document.getElementById('progress-bar');
    const progressDots = document.getElementById('progress-dots');
    const report = document.getElementById('report');
    const detailsToggle = document.getElementById('details-toggle');
    const detailsBody = document.getElementById('details-body');

    if (!analyzeBtn || !claimInput) return;

    greetUser();

    if (detailsToggle && detailsBody) {
        detailsToggle.addEventListener('click', () => {
            const open = detailsBody.classList.toggle('open');
            detailsToggle.classList.toggle('open', open);
            const label = detailsToggle.querySelector('.details-toggle-text');
            if (label) label.textContent = open ? 'Hide the full breakdown' : 'Show the full breakdown';
        });
    }

    function collapseDetails() {
        if (!detailsToggle || !detailsBody) return;
        detailsBody.classList.remove('open');
        detailsToggle.classList.remove('open');
        const label = detailsToggle.querySelector('.details-toggle-text');
        if (label) label.textContent = 'Show the full breakdown';
    }

    function greetUser() {
        const eyebrow = document.getElementById('app-eyebrow');
        if (!eyebrow) return;
        let profile = {};
        try {
            profile = JSON.parse(localStorage.getItem('scoop_profile') || '{}');
        } catch (e) {
            return;
        }
        const parts = [];
        if (profile.role) parts.push(profile.role);
        if (profile.institution) parts.push(profile.institution);
        else if (profile.community) parts.push(profile.community);
        if (parts.length) eyebrow.textContent = parts.join(' · ');
    }

    const stages = [
        { pct: 8, label: 'Classifying the claim' },
        { pct: 18, label: 'Fingerprinting information DNA' },
        { pct: 32, label: 'Retrieving evidence' },
        { pct: 46, label: 'Profiling source trust' },
        { pct: 58, label: 'Mapping citation lineage' },
        { pct: 68, label: 'Reading emotional framing' },
        { pct: 78, label: 'Checking context integrity' },
        { pct: 88, label: 'Running courtroom reasoning' },
        { pct: 94, label: 'Calibrating confidence' }
    ];

    let stageTimer = null;
    let creepTimer = null;
    let lastUpdate = 0;
    let currentPct = 0;

    function stopProgressTimers() {
        if (stageTimer) { clearInterval(stageTimer); stageTimer = null; }
        if (creepTimer) { clearInterval(creepTimer); creepTimer = null; }
    }

    function startProgress() {
        stopProgressTimers();
        messageBox.classList.remove('active');
        report.classList.remove('active');
        progressBox.classList.add('active');

        let index = 0;
        setProgress(stages[0].pct, stages[0].label);

        stageTimer = setInterval(() => {
            index += 1;
            if (index >= stages.length) {
                clearInterval(stageTimer);
                stageTimer = null;
                return;
            }
            setProgress(stages[index].pct, stages[index].label);
        }, 1900);

        creepTimer = setInterval(() => {
            if (Date.now() - lastUpdate < 9000) return;
            if (currentPct >= 99) {
                progressStage.textContent = 'Crunching Last minute';
                return;
            }
            setProgress(currentPct + 1);
            if (currentPct >= 99) {
                progressStage.textContent = 'Crunching Last minute';
            }
        }, 1000);
    }

    function setProgress(pct, label) {
        currentPct = pct;
        lastUpdate = Date.now();
        progressBar.style.width = pct + '%';
        progressPct.textContent = pct + '%';
        if (label) progressStage.textContent = label;
        if (progressDots) {
            progressDots.classList.toggle('active', pct >= 90 && pct < 100);
        }
    }

    function finishProgress(callback) {
        stopProgressTimers();
        setProgress(100, 'Report ready');
        setTimeout(() => {
            progressBox.classList.remove('active');
            setProgress(0, stages[0].label);
            callback();
        }, 500);
    }

    function showMessage(text) {
        stopProgressTimers();
        progressBox.classList.remove('active');
        report.classList.remove('active');
        messageText.textContent = text;
        messageBox.classList.add('active');
    }

    async function runAnalysis() {
        const claimText = claimInput.value.trim();
        if (claimText.length < 8) {
            showMessage('Please enter a specific, checkable claim we can analyze.');
            return;
        }

        analyzeBtn.disabled = true;
        startProgress();

        try {
            const response = await fetch('/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ claim: claimText })
            });

            if (!response.ok) throw new Error('Request failed');

            const data = await response.json();
            finishProgress(() => renderReport(data, claimText));
        } catch (error) {
            showMessage('Something went wrong while running the full analysis. Please try again.');
        } finally {
            analyzeBtn.disabled = false;
        }
    }

    analyzeBtn.addEventListener('click', runAnalysis);
    claimInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') runAnalysis();
    });

    function renderReport(data, claimText) {
        renderAnswer(data, claimText);
        collapseDetails();
        renderConfidence(data);
        renderManipulation(data);
        renderIntegrity(data);
        renderDNA(data);
        renderSources(data);
        renderCitation(data);
        renderCourtroom(data);
        renderRecommendations(data);
        report.classList.add('active');
        report.scrollIntoView({ behavior: 'smooth', block: 'start' });
        if (window.ScoopTour) {
            setTimeout(() => window.ScoopTour.startReport(false), 800);
        }
    }

    function renderAnswer(data, claimText) {
        const confidence = data.confidence || {};
        const score = Math.round(normalizeScore(confidence.score));
        animateScore('answer-conf', 0, score);

        const band = document.getElementById('answer-band');
        band.classList.remove('band-low', 'band-moderate', 'band-high');
        if (score < 45) {
            band.textContent = 'low confidence';
            band.classList.add('band-low');
        } else if (score < 70) {
            band.textContent = 'moderate confidence';
            band.classList.add('band-moderate');
        } else {
            band.textContent = 'high confidence';
            band.classList.add('band-high');
        }

        document.getElementById('answer-claim').textContent = claimText;

        const judge = (data.reasoning || {}).judge || {};
        const em = data.emotional_manipulation || {};
        const ci = data.context_integrity || {};
        const manipRisk = Math.round(normalize(em.manipulation_risk));
        const integrity = Math.round(normalizeScore(ci.integrity_score));

        const body = document.getElementById('answer-body');
        body.innerHTML = '';
        let opener;
        if (score >= 70) {
            opener = "Going on what I can find, this holds up. I'm fairly confident, around " + score + "%.";
        } else if (score >= 45) {
            opener = "I'd treat this as a maybe. My confidence sits around " + score + "%, so it's plausible but not settled.";
        } else {
            opener = "I wouldn't run with this yet. My confidence is only around " + score + "%, so the evidence is thin.";
        }
        addAnswerLine(body, opener, false);
        if (judge.ruling) addAnswerLine(body, judge.ruling, true);

        const flags = document.getElementById('answer-flags');
        flags.innerHTML = '';
        if (manipRisk >= 50) addAnswerChip(flags, 'Emotionally charged wording', true);
        if (integrity > 0 && integrity < 60) addAnswerChip(flags, 'Looks like missing context', true);
        if (!flags.children.length) addAnswerChip(flags, 'No major red flags', false);

        const action = document.getElementById('answer-action');
        action.innerHTML = '';
        const act = judge.recommended_action || (data.recommendations || [])[0] ||
            'Wait for an official source before you act on this.';
        const label = document.createElement('span');
        label.className = 'answer-action-label';
        label.textContent = "What I'd do";
        const text = document.createElement('span');
        text.className = 'answer-action-text';
        text.textContent = typeof act === 'string' ? act : (act.text || act.action || '');
        action.appendChild(label);
        action.appendChild(text);
    }

    function addAnswerLine(container, text, muted) {
        const p = document.createElement('p');
        p.className = muted ? 'answer-line answer-line-muted' : 'answer-line';
        p.textContent = text;
        container.appendChild(p);
    }

    function addAnswerChip(container, text, warn) {
        const chip = document.createElement('span');
        chip.className = warn ? 'chip warn' : 'chip';
        chip.textContent = text;
        container.appendChild(chip);
    }

    function renderConfidence(data) {
        const c = (data.confidence || {}).components || {};
        setBar('conf-authority', c.authority);
        setBar('conf-freshness', c.freshness);
        setBar('conf-independence', c.independence);
        setBar('conf-agreement', c.evidence_agreement);
        setBar('conf-trust', c.historical_trust);
        setBar('conf-integrity', c.context_integrity);
        setBar('conf-manipinv', c.manipulation_inverse);
        setBar('conf-strength', c.evidence_strength);
    }

    function renderManipulation(data) {
        const em = data.emotional_manipulation || {};
        setBar('manip-fear', normalize(em.fear));
        setBar('manip-anger', normalize(em.anger));
        setBar('manip-outrage', normalize(em.outrage));
        document.getElementById('manip-risk').textContent = Math.round(normalize(em.manipulation_risk));

        const techBox = document.getElementById('manip-techniques');
        techBox.innerHTML = '';
        const techniques = (em.techniques_detected || []).filter(t => t && t !== 'none_detected');
        if (!techniques.length) {
            const chip = document.createElement('span');
            chip.className = 'chip';
            chip.textContent = 'No manipulation techniques detected';
            techBox.appendChild(chip);
        } else {
            techniques.forEach(t => {
                const chip = document.createElement('span');
                chip.className = 'chip warn';
                chip.textContent = humanize(t);
                techBox.appendChild(chip);
            });
        }
    }

    function renderIntegrity(data) {
        const ci = data.context_integrity || {};
        animateScore('integ-score', 0, Math.round(normalizeScore(ci.integrity_score)));

        const list = document.getElementById('integ-flags');
        list.innerHTML = '';
        const checks = [
            { keys: ['is_temporally_misleading', 'missing_date'], risk: 'Temporally misleading', clear: 'Timing preserved' },
            { keys: ['is_decontextualized', 'cropped_context', 'missing_source'], risk: 'Decontextualized', clear: 'Context preserved' },
            { keys: ['is_misquoted'], risk: 'Misquoted', clear: 'Wording consistent' },
            { keys: ['is_selectively_edited', 'selective_quotation'], risk: 'Selectively edited', clear: 'No selective editing' }
        ];
        checks.forEach(check => {
            const flagged = check.keys.some(key => Boolean(ci[key]));
            const li = document.createElement('li');
            li.className = flagged ? 'flag-risk' : 'flag-clear';
            li.textContent = flagged ? check.risk : check.clear;
            list.appendChild(li);
        });

        document.getElementById('integ-details').textContent = ci.details || '';
    }

    function renderDNA(data) {
        const dna = data.information_dna || {};
        document.getElementById('dna-canonical').textContent =
            dna.canonical_form || 'No canonical form generated.';
        const fp = dna.fingerprint || '';
        document.getElementById('dna-fingerprint').textContent =
            fp ? fp : 'No fingerprint generated.';

        const features = document.getElementById('dna-features');
        features.innerHTML = '';
        const list = dna.semantic_features || [];
        if (!list.length) {
            features.innerHTML = '<span class="empty-state">No semantic features extracted.</span>';
            return;
        }
        list.forEach(f => {
            const chip = document.createElement('span');
            chip.className = 'chip';
            chip.textContent = f;
            features.appendChild(chip);
        });
    }

    function renderSources(data) {
        const es = data.evidence_strength || {};
        document.getElementById('src-strength-score').textContent =
            Math.round(normalizeScore(es.score));
        const count = es.weighted_sources || 0;
        document.getElementById('src-strength-count').textContent =
            count === 1 ? 'from 1 source' : 'from ' + count + ' sources';

        const grid = document.getElementById('src-cards');
        grid.innerHTML = '';
        const passports = (data.trust_passport || {}).sources || [];
        if (!passports.length) {
            grid.innerHTML = '<p class="empty-state">No external sources were retrieved for this claim. Confidence rests on the claim text and its framing alone.</p>';
            return;
        }

        const dims = [
            ['authority_score', 'Authority'],
            ['primary_source_usage', 'Primary sourcing'],
            ['evidence_density', 'Evidence density'],
            ['retraction_history', 'Retraction record'],
            ['emotional_language_tendency', 'Neutral tone'],
            ['transparency_score', 'Transparency']
        ];

        passports.forEach(p => {
            const card = document.createElement('div');
            card.className = 'passport';

            const head = document.createElement('div');
            head.className = 'passport-head';
            const url = document.createElement('span');
            url.className = 'passport-url';
            url.textContent = shortHost(p.url) || 'Unattributed source';
            const trend = document.createElement('span');
            const trendVal = (p.reliability_trend || 'stable');
            trend.className = 'passport-trend trend-' + trendVal;
            trend.textContent = humanize(trendVal);
            head.appendChild(url);
            head.appendChild(trend);
            card.appendChild(head);

            const dimsBox = document.createElement('div');
            dimsBox.className = 'passport-dims';
            dims.forEach(([key, label]) => {
                const val = normalize(p[key]);
                const row = document.createElement('div');
                row.innerHTML =
                    '<div class="passport-dim-head"><span class="passport-dim-label">' + label +
                    '</span><span class="passport-dim-value">' + val + '</span></div>' +
                    '<div class="passport-dim-track"><div class="passport-dim-fill" style="width:' + val + '%"></div></div>';
                dimsBox.appendChild(row);
            });
            card.appendChild(dimsBox);
            grid.appendChild(card);
        });
    }

    function renderCitation(data) {
        const cg = data.citation_graph || {};
        const body = document.getElementById('cite-body');
        body.innerHTML = '';

        const nodes = cg.nodes || [];
        const hasLineage = cg.origin_candidate || (cg.independent_sources || []).length ||
            (cg.copied_sources || []).length || (cg.amplified_sources || []).length;

        if (!nodes.length && !hasLineage) {
            body.innerHTML = '<p class="empty-state">No corroboration network could be mapped. The claim was not traced to multiple independent sources, so consensus cannot be inferred from spread.</p>';
            return;
        }

        if (hasLineage) {
            const lineage = document.createElement('div');
            lineage.className = 'citation-lineage';
            addLineageRow(lineage, 'Likely origin', cg.origin_candidate ? [cg.origin_candidate] : []);
            addLineageRow(lineage, 'Independent', cg.independent_sources || []);
            addLineageRow(lineage, 'Amplified', cg.amplified_sources || []);
            addLineageRow(lineage, 'Copied', cg.copied_sources || []);
            body.appendChild(lineage);

            const verified = Boolean(cg.independently_verified);
            const verify = document.createElement('div');
            verify.className = 'citation-verify ' + (verified ? 'verified' : 'unverified');
            verify.innerHTML = '<span class="citation-verify-dot"></span>' +
                (verified
                    ? 'Independently verified by at least two unrelated sources.'
                    : 'Not independently verified. Evidence traces to a single origin or echo chamber.');
            body.appendChild(verify);
        }
    }

    function renderCourtroom(data) {
        const r = data.reasoning || {};
        const pros = r.prosecutor || {};
        const def = r.defense || {};
        const cross = r.cross_examination || {};
        const judge = r.judge || {};

        fillList('court-prosecution', [].concat(
            pros.charges || [], pros.key_evidence_against || [], pros.weaknesses_in_claim || []
        ), 'No prosecution case was recorded.');
        fillList('court-defense', [].concat(
            def.defense_arguments || [], def.key_evidence_for || [], def.mitigating_factors || []
        ), 'No defense case was recorded.');
        fillList('court-cross', [].concat(
            cross.weaknesses_prosecution || [], cross.weaknesses_defense || [],
            cross.unresolved_questions || [], cross.credibility_issues || []
        ), 'No cross-examination was recorded.');

        document.getElementById('judge-ruling').textContent =
            judge.ruling || 'No ruling was issued.';
        document.getElementById('judge-assessment').textContent =
            judge.confidence_assessment || '';
        fillList('judge-factors', judge.key_factors || [], 'None recorded.');
        fillList('judge-dissent', judge.dissenting_considerations || [], 'None recorded.');
        document.getElementById('judge-action').textContent = judge.recommended_action || '';
    }

    function renderRecommendations(data) {
        const recs = data.recommendations || [];
        const list = document.getElementById('rec-list');
        list.innerHTML = '';
        if (!recs.length) {
            list.innerHTML = '<li>Wait for an official source before acting on this claim.</li>';
            return;
        }
        recs.forEach(rec => {
            const li = document.createElement('li');
            li.textContent = typeof rec === 'string' ? rec : (rec.text || rec.action || '');
            list.appendChild(li);
        });
    }

    function addLineageRow(container, label, values) {
        if (!values.length) return;
        const row = document.createElement('div');
        row.className = 'citation-lineage-row';
        const labelEl = document.createElement('span');
        labelEl.className = 'citation-lineage-label';
        labelEl.textContent = label;
        const valueEl = document.createElement('span');
        valueEl.className = 'citation-lineage-value';
        values.forEach(v => {
            const chip = document.createElement('span');
            chip.className = 'chip';
            chip.textContent = shortHost(v) || v;
            valueEl.appendChild(chip);
        });
        row.appendChild(labelEl);
        row.appendChild(valueEl);
        container.appendChild(row);
    }

    function fillList(id, items, emptyText) {
        const list = document.getElementById(id);
        list.innerHTML = '';
        const clean = items.filter(Boolean);
        if (!clean.length) {
            const li = document.createElement('li');
            li.textContent = emptyText;
            list.appendChild(li);
            return;
        }
        clean.forEach(item => {
            const li = document.createElement('li');
            li.textContent = typeof item === 'string' ? item : JSON.stringify(item);
            list.appendChild(li);
        });
    }

    function setBar(id, value) {
        const fill = document.getElementById(id);
        const label = document.getElementById(id + '-val');
        const val = Math.round(normalize(value));
        if (label) label.textContent = val;
        if (fill) requestAnimationFrame(() => { fill.style.width = val + '%'; });
    }

    function humanize(value) {
        return String(value).replace(/_/g, ' ').replace(/\b\w/g, ch => ch.toUpperCase());
    }

    function shortHost(url) {
        if (!url) return '';
        try {
            const u = new URL(url.includes('://') ? url : 'https://' + url);
            return u.hostname.replace(/^www\./, '');
        } catch (e) {
            return url;
        }
    }

    function normalize(value) {
        const num = Number(value) || 0;
        const scaled = num <= 1 && num > 0 ? num * 100 : num;
        return Math.max(0, Math.min(100, Math.round(scaled)));
    }

    function normalizeScore(value) {
        const num = Number(value);
        if (Number.isNaN(num)) return 0;
        const scaled = num <= 1 && num > 0 ? num * 100 : num;
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
        const duration = 1000;
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
