document.addEventListener('DOMContentLoaded', () => {
    const emptyEl = document.getElementById('watch-empty');
    const roomEl = document.getElementById('watch-room');
    const recheckBtn = document.getElementById('watch-recheck');
    const recheckMsg = document.getElementById('watch-recheck-msg');

    const params = new URLSearchParams(window.location.search);
    const claimId = params.get('claim');

    if (!claimId) {
        showEmpty();
        return;
    }

    // We have a claim — hide the empty state immediately to avoid a flash
    // while the timeline loads.
    emptyEl.style.display = 'none';
    loadTimeline();

    function showEmpty() {
        emptyEl.style.display = 'flex';
        roomEl.classList.remove('active');
        roomEl.setAttribute('aria-hidden', 'true');
    }

    function showRoom() {
        emptyEl.style.display = 'none';
        roomEl.classList.add('active');
        roomEl.setAttribute('aria-hidden', 'false');
    }

    async function loadTimeline() {
        try {
            const res = await fetch('/watch/' + encodeURIComponent(claimId) + '/timeline');
            if (!res.ok) throw new Error('not found');
            const data = await res.json();
            render(data);
            showRoom();
        } catch (e) {
            showEmpty();
        }
    }

    recheckBtn.addEventListener('click', async () => {
        recheckBtn.disabled = true;
        recheckBtn.textContent = 'Re-checking…';
        showMsg('Running a fresh pass of the full pipeline. Re-tracing lineage, re-weighing evidence…', false);
        try {
            const res = await fetch('/watch/' + encodeURIComponent(claimId) + '/recheck', { method: 'POST' });
            if (!res.ok) throw new Error('recheck failed');
            const data = await res.json();
            render(data);
            const last = (data.change_cards || [])[0];
            if (last && last.delta) {
                const dir = last.delta > 0 ? 'increased' : 'decreased';
                showMsg('Fresh check complete. Confidence ' + dir + ' to ' + data.current_confidence + '%.', false);
            } else {
                showMsg('Fresh check complete. No meaningful change to trustworthiness this pass.', false);
            }
        } catch (e) {
            showMsg('The fresh check could not complete. Please try again.', true);
        } finally {
            recheckBtn.disabled = false;
            recheckBtn.textContent = 'Run a fresh check now';
        }
    });

    function showMsg(text, isError) {
        recheckMsg.textContent = text;
        recheckMsg.classList.toggle('error', !!isError);
        recheckMsg.classList.add('active');
    }

    function render(data) {
        document.getElementById('watch-claim').textContent = data.claim || 'Watched claim';

        const liveLabel = document.getElementById('watch-live-label');
        const liveDot = document.querySelector('.watch-live-dot');
        liveLabel.textContent = data.watching ? 'Watching' : 'Paused';
        if (liveDot) liveDot.classList.toggle('paused', !data.watching);

        renderStats(data);
        renderChart(data.history || []);
        renderChanges(data.change_cards || []);
        renderTimeline(data.timeline || []);
    }

    function renderStats(data) {
        const current = Math.round(data.current_confidence || 0);
        const prev = data.previous_confidence;

        document.getElementById('stat-current').textContent = current + '%';

        const prevEl = document.getElementById('stat-prev');
        const arrowEl = document.getElementById('stat-arrow');
        const deltaEl = document.getElementById('stat-delta');
        const delta = data.delta || 0;

        if (prev === null || prev === undefined) {
            prevEl.textContent = '';
            arrowEl.textContent = '';
            deltaEl.textContent = 'Baseline reading — run a check to track movement.';
            deltaEl.className = 'watch-stat-delta flat';
        } else {
            prevEl.textContent = Math.round(prev) + '%';
            if (delta > 0) {
                arrowEl.textContent = '↑';
                deltaEl.textContent = '+' + delta + ' points since the last check';
                deltaEl.className = 'watch-stat-delta up';
            } else if (delta < 0) {
                arrowEl.textContent = '↓';
                deltaEl.textContent = delta + ' points since the last check';
                deltaEl.className = 'watch-stat-delta down';
            } else {
                arrowEl.textContent = '→';
                deltaEl.textContent = 'No net change since the last check';
                deltaEl.className = 'watch-stat-delta flat';
            }
        }

        document.getElementById('stat-status').textContent = data.status || '—';
        document.getElementById('stat-band').textContent = confidenceBand(current);

        document.getElementById('stat-count').textContent = data.check_count || 0;

        document.getElementById('stat-updated').textContent =
            data.last_checked_at ? timeAgo(data.last_checked_at) : '—';
        const horizon = document.getElementById('stat-horizon');
        horizon.textContent = data.recheck_horizon_hours
            ? 'Auto-rechecks every ' + data.recheck_horizon_hours + 'h'
            : '';
    }

    function confidenceBand(score) {
        if (score >= 70) return 'High confidence';
        if (score >= 45) return 'Moderate confidence';
        return 'Low confidence';
    }

    function renderChart(history) {
        const box = document.getElementById('watch-chart');
        box.innerHTML = '';

        if (!history.length) {
            box.innerHTML = '<p class="watch-chart-empty">No history yet. The first reading is the baseline — run a fresh check to start the trust line.</p>';
            return;
        }

        const W = 760, H = 210;
        const padL = 38, padR = 26, padT = 22, padB = 34;
        const innerW = W - padL - padR;
        const innerH = H - padT - padB;
        const n = history.length;

        const x = i => n === 1 ? padL + innerW / 2 : padL + (innerW * i) / (n - 1);
        const y = v => padT + innerH * (1 - Math.max(0, Math.min(100, v)) / 100);

        const NS = 'http://www.w3.org/2000/svg';
        const svg = document.createElementNS(NS, 'svg');
        svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
        svg.setAttribute('role', 'img');

        // gridlines + y labels
        [0, 25, 50, 75, 100].forEach(g => {
            const gy = y(g);
            const line = document.createElementNS(NS, 'line');
            line.setAttribute('x1', padL);
            line.setAttribute('x2', W - padR);
            line.setAttribute('y1', gy);
            line.setAttribute('y2', gy);
            line.setAttribute('class', g === 0 ? 'watch-chart-axis' : 'watch-chart-grid');
            svg.appendChild(line);

            const label = document.createElementNS(NS, 'text');
            label.setAttribute('x', padL - 8);
            label.setAttribute('y', gy + 4);
            label.setAttribute('text-anchor', 'end');
            label.setAttribute('class', 'watch-chart-label');
            label.textContent = g;
            svg.appendChild(label);
        });

        const pts = history.map((h, i) => [x(i), y(h.score)]);

        if (n > 1) {
            // area
            const area = document.createElementNS(NS, 'path');
            let d = 'M ' + pts[0][0] + ' ' + (H - padB);
            pts.forEach(p => { d += ' L ' + p[0] + ' ' + p[1]; });
            d += ' L ' + pts[n - 1][0] + ' ' + (H - padB) + ' Z';
            area.setAttribute('d', d);
            area.setAttribute('class', 'watch-chart-area');
            svg.appendChild(area);

            // line
            const line = document.createElementNS(NS, 'path');
            line.setAttribute('d', 'M ' + pts.map(p => p[0] + ' ' + p[1]).join(' L '));
            line.setAttribute('class', 'watch-chart-line');
            svg.appendChild(line);
        }

        // dots + x labels
        history.forEach((h, i) => {
            const last = i === n - 1;
            const dot = document.createElementNS(NS, 'circle');
            dot.setAttribute('cx', pts[i][0]);
            dot.setAttribute('cy', pts[i][1]);
            dot.setAttribute('r', last ? 5 : 4);
            dot.setAttribute('class', 'watch-chart-dot' + (last ? ' watch-chart-dot-last' : ''));
            svg.appendChild(dot);

            const xlabel = document.createElementNS(NS, 'text');
            xlabel.setAttribute('x', pts[i][0]);
            xlabel.setAttribute('y', H - padB + 18);
            xlabel.setAttribute('text-anchor', 'middle');
            xlabel.setAttribute('class', 'watch-chart-label');
            xlabel.textContent = 'v' + h.version;
            svg.appendChild(xlabel);

            if (last || n === 1) {
                const val = document.createElementNS(NS, 'text');
                val.setAttribute('x', pts[i][0]);
                val.setAttribute('y', pts[i][1] - 12);
                val.setAttribute('text-anchor', 'middle');
                val.setAttribute('class', 'watch-chart-value');
                val.textContent = h.score + '%';
                svg.appendChild(val);
            }
        });

        box.appendChild(svg);
    }

    function renderChanges(cards) {
        const box = document.getElementById('watch-changes');
        box.innerHTML = '';

        if (!cards.length) {
            box.innerHTML = '<p class="watch-chart-empty">No changes recorded yet. When a fresh check moves the evidence, the reason it moved shows up here.</p>';
            return;
        }

        cards.forEach(c => {
            const card = document.createElement('div');
            card.className = 'change-card ' + (c.kind || 'neutral');

            const top = document.createElement('div');
            top.className = 'change-card-top';
            const title = document.createElement('span');
            title.className = 'change-card-title';
            title.textContent = c.title || 'Update';
            const move = document.createElement('div');
            move.className = 'change-card-move';
            move.innerHTML =
                '<span class="change-card-from">' + Math.round(c.previous) + '%</span>' +
                '<span class="change-card-to">' + Math.round(c.current) + '%</span>';
            top.appendChild(title);
            top.appendChild(move);
            card.appendChild(top);

            card.appendChild(changeRow('Reason', c.reason));
            card.appendChild(changeRow('Impact', c.impact));

            box.appendChild(card);
        });
    }

    function changeRow(key, val) {
        const row = document.createElement('div');
        row.className = 'change-card-row';
        const k = document.createElement('span');
        k.className = 'change-card-key';
        k.textContent = key;
        const v = document.createElement('span');
        v.className = 'change-card-val';
        v.textContent = val || '—';
        row.appendChild(k);
        row.appendChild(v);
        return row;
    }

    function renderTimeline(events) {
        const list = document.getElementById('watch-timeline');
        list.innerHTML = '';

        if (!events.length) {
            const li = document.createElement('li');
            li.className = 'timeline-item';
            li.innerHTML = '<div class="timeline-detail">No activity recorded yet.</div>';
            list.appendChild(li);
            return;
        }

        events.forEach(ev => {
            const li = document.createElement('li');
            li.className = 'timeline-item ' + (ev.kind || 'neutral');

            const time = document.createElement('div');
            time.className = 'timeline-time';
            time.textContent = formatStamp(ev.at);

            const title = document.createElement('div');
            title.className = 'timeline-title';
            title.textContent = ev.title || '';

            const detail = document.createElement('div');
            detail.className = 'timeline-detail';
            detail.textContent = ev.detail || '';

            li.appendChild(time);
            li.appendChild(title);
            li.appendChild(detail);
            list.appendChild(li);
        });
    }

    // -- date helpers ------------------------------------------------------
    function parseDate(value) {
        if (!value) return null;
        // SQLite stores "YYYY-MM-DD HH:MM:SS" (UTC, no tz marker)
        let s = String(value);
        if (s.indexOf('T') === -1 && s.indexOf(' ') !== -1) {
            s = s.replace(' ', 'T') + 'Z';
        }
        const d = new Date(s);
        return isNaN(d.getTime()) ? null : d;
    }

    function timeAgo(value) {
        const d = parseDate(value);
        if (!d) return '—';
        const secs = Math.max(0, (Date.now() - d.getTime()) / 1000);
        if (secs < 60) return 'just now';
        const mins = Math.floor(secs / 60);
        if (mins < 60) return mins + ' min ago';
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return hrs + 'h ago';
        const days = Math.floor(hrs / 24);
        return days + 'd ago';
    }

    function formatStamp(value) {
        const d = parseDate(value);
        if (!d) return '';
        const time = d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
        return time + ' · ' + timeAgo(value);
    }
});
