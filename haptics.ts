
/**
 * Haptic Signatures - A sensory language for recovery.
 * These patterns are designed to communicate the emotional and biological state
 * of the journey directly to the Traveller's nervous system.
 */

export const HAPTIC_SIGNATURES = {
  // Calm: A slow, gentle heartbeat pattern. Used for meditation and breathing.
  CALM: [40, 800, 40],
  
  // Urgent: A rapid, high-intensity double-tap. Used for alerts and biological spikes.
  URGENT: [100, 50, 100],
  
  // Landmark: A rising triple-pulse. Used for securing badges and completing goals.
  LANDMARK: [30, 50, 30, 50, 60],
  
  // Sync: A steady, confident long pulse. Used for biometric linking.
  SYNC: [150, 100, 150],
  
  // Interaction: A subtle micro-tap for standard UI feedback.
  TAP: [10]
};

export const triggerHaptic = (signature: keyof typeof HAPTIC_SIGNATURES) => {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    navigator.vibrate(HAPTIC_SIGNATURES[signature]);
  }
};
