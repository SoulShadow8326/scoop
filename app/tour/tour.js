(function () {
    function getDriver() {
        return window.driver && window.driver.js ? window.driver.js.driver : null;
    }

    function profile() {
        try {
            return JSON.parse(localStorage.getItem('scoop_profile') || '{}');
        } catch (e) {
            return {};
        }
    }

    function startIntro(force) {
        const driver = getDriver();
        if (!driver) return;
        if (!force && localStorage.getItem('scoop_tour_intro') === 'done') return;

        const p = profile();
        const who = p.name ? p.name.split(' ')[0] : (p.role || 'there');

        const tour = driver({
            showProgress: true,
            popoverClass: 'scoop-tour',
            nextBtnText: 'Next',
            prevBtnText: 'Back',
            doneBtnText: 'Got it',
            steps: [
                { popover: { title: 'Welcome to Scoop, ' + who, description: 'This is your full report workspace. Here is how it works.' } },
                { element: '.app-input-panel', popover: { title: 'Start with a claim', description: 'Paste any rumor or claim moving through your community.', side: 'bottom', align: 'center' } },
                { element: '#analyze-btn', popover: { title: 'Run the full pipeline', description: 'Scoop traces lineage, profiles sources, and weighs the evidence in an adversarial courtroom.', side: 'bottom', align: 'end' } },
                { popover: { title: 'Your report builds below', description: 'You get a calibrated confidence, emotional framing, context integrity, source trust, and recommended actions, never a verdict of truth.' } }
            ],
            onDestroyed: function () {
                localStorage.setItem('scoop_tour_intro', 'done');
            }
        });
        tour.drive();
    }

    function startReport(force) {
        const driver = getDriver();
        if (!driver) return;
        if (!force && localStorage.getItem('scoop_tour_report') === 'done') return;

        const tour = driver({
            showProgress: true,
            smoothScroll: true,
            popoverClass: 'scoop-tour',
            nextBtnText: 'Next',
            prevBtnText: 'Back',
            doneBtnText: 'Done',
            steps: [
                { element: '.answer-card', popover: { title: 'Here is your read', description: 'A plain-language answer with a confidence score and what I would do. This is the short version.', side: 'bottom' } },
                { element: '.details-toggle', popover: { title: 'Want the evidence?', description: 'Open the full breakdown for the source trust passports, emotional framing, and the adversarial courtroom behind the answer.', side: 'top' } }
            ],
            onDestroyed: function () {
                localStorage.setItem('scoop_tour_report', 'done');
            }
        });
        tour.drive();
    }

    window.ScoopTour = { startIntro: startIntro, startReport: startReport };

    document.addEventListener('DOMContentLoaded', function () {
        if (localStorage.getItem('scoop_onboarded') !== 'true') return;
        startIntro(false);
        const tourBtn = document.getElementById('tour-btn');
        if (tourBtn) {
            tourBtn.addEventListener('click', function () {
                const report = document.getElementById('report');
                if (report && report.classList.contains('active')) startReport(true);
                else startIntro(true);
            });
        }
    });
})();
