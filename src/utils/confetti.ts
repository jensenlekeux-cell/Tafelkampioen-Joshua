import confetti from 'canvas-confetti';

export function fireCelebrationConfetti() {
  try {
    const count = 200;
    const defaults = {
      origin: { y: 0.7 },
      zIndex: 9999,
    };

    function fire(particleRatio: number, opts: confetti.Options) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
      });
    }

    fire(0.25, {
      spread: 26,
      startVelocity: 55,
      colors: ['#F59E0B', '#10B981', '#6366F1', '#EC4899'],
    });
    fire(0.2, {
      spread: 60,
      colors: ['#FBBF24', '#34D399', '#818CF8'],
    });
    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8,
    });
    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      colors: ['#FCD34D', '#A7F3D0'],
    });
    fire(0.1, {
      spread: 120,
      startVelocity: 45,
    });
  } catch {
    // Graceful fallback if canvas is restricted
  }
}

export function fireDiplomaCelebration() {
  try {
    const end = Date.now() + 2 * 1000;
    const colors = ['#F59E0B', '#FBBF24', '#3B82F6', '#10B981', '#8B5CF6'];

    (function frame() {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors,
        zIndex: 9999,
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors,
        zIndex: 9999,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  } catch {
    // Fallback
  }
}

export function fireStreakBurst() {
  try {
    confetti({
      particleCount: 40,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#F59E0B', '#EF4444', '#F97316'],
      zIndex: 9999,
    });
  } catch {
    // Fallback
  }
}
