(function () {
    function animateLogo() {
        if (typeof anime === 'undefined') return;

        const svg = document.getElementById('logo-svg');
        if (!svg) return;

        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (reduceMotion) return;

        const utils = anime.utils;
        const createTimeline = anime.createTimeline;

        utils.set('#logo-s', { opacity: 0, translateX: -150, scale: 0.9 });
        utils.set('#logo-p', { opacity: 0, translateX: 150, scale: 0.9 });
        utils.set(['#logo-o1', '#logo-o2'], { opacity: 0, translateY: -320, scale: 0.72 });
        utils.set('#logo-c', { opacity: 0 });
        utils.set('#c-reveal-rect', { width: 352 });

        const tl = createTimeline({
            defaults: { ease: 'outExpo' }
        });

        tl
            .add('#logo-s', {
                opacity: [0, 1],
                translateX: [-150, 0],
                scale: [0.9, 1],
                duration: 720
            }, 0)
            .add('#logo-c', {
                opacity: [0, 1],
                duration: 320
            }, 220)
            .add('#c-reveal-rect', {
                width: [352, 950],
                duration: 880,
                ease: 'inOutQuart'
            }, 400)
            .add('#logo-o1', {
                opacity: [0, 1],
                translateY: [-320, 0],
                scale: [0.72, 1],
                duration: 1150,
                ease: 'outBounce'
            }, 540)
            .add('#logo-o2', {
                opacity: [0, 1],
                translateY: [-320, 0],
                scale: [0.72, 1],
                duration: 1150,
                ease: 'outBounce'
            }, 690)
            .add('#logo-p', {
                opacity: [0, 1],
                translateX: [150, 0],
                scale: [0.9, 1],
                duration: 720
            }, 860);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', animateLogo);
    } else {
        animateLogo();
    }
})();
