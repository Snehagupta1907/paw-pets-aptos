// Mobile touch handler utilities
export const preventZoom = (event) => {
  if (event.touches.length > 1) {
    event.preventDefault();
  }
};

export const preventScroll = (event) => {
  event.preventDefault();
};

export const handleTouchStart = (event) => {
  // Prevent zoom on double tap
  if (event.touches.length > 1) {
    event.preventDefault();
  }
};

export const handleTouchMove = (event) => {
  // Prevent scroll on certain elements
  if (event.target.closest('.no-scroll')) {
    event.preventDefault();
  }
};

export const handleTouchEnd = (event) => {
  // Handle touch end events
};

// Add mobile touch event listeners
export const addMobileTouchListeners = () => {
  if (typeof window !== 'undefined') {
    // Prevent zoom on double tap
    document.addEventListener('touchstart', handleTouchStart, { passive: false });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });
  }
};

// Remove mobile touch event listeners
export const removeMobileTouchListeners = () => {
  if (typeof window !== 'undefined') {
    document.removeEventListener('touchstart', handleTouchStart);
    document.removeEventListener('touchmove', handleTouchMove);
    document.removeEventListener('touchend', handleTouchEnd);
  }
};

// Check if device supports touch
export const isTouchDevice = () => {
  if (typeof window === 'undefined') return false;
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
};

// Get touch coordinates
export const getTouchCoordinates = (event) => {
  if (event.touches && event.touches.length > 0) {
    return {
      x: event.touches[0].clientX,
      y: event.touches[0].clientY
    };
  }
  return null;
};

// Mobile gesture detection
export const detectSwipe = (element, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown) => {
  let startX, startY, endX, endY;
  const minSwipeDistance = 50;

  const handleTouchStart = (e) => {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
  };

  const handleTouchEnd = (e) => {
    endX = e.changedTouches[0].clientX;
    endY = e.changedTouches[0].clientY;
    
    const deltaX = startX - endX;
    const deltaY = startY - endY;
    
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // Horizontal swipe
      if (Math.abs(deltaX) > minSwipeDistance) {
        if (deltaX > 0 && onSwipeLeft) onSwipeLeft();
        else if (deltaX < 0 && onSwipeRight) onSwipeRight();
      }
    } else {
      // Vertical swipe
      if (Math.abs(deltaY) > minSwipeDistance) {
        if (deltaY > 0 && onSwipeUp) onSwipeUp();
        else if (deltaY < 0 && onSwipeDown) onSwipeDown();
      }
    }
  };

  element.addEventListener('touchstart', handleTouchStart, { passive: true });
  element.addEventListener('touchend', handleTouchEnd, { passive: true });

  return () => {
    element.removeEventListener('touchstart', handleTouchStart);
    element.removeEventListener('touchend', handleTouchEnd);
  };
};

// Mobile keyboard handling
export const handleMobileKeyboard = () => {
  if (typeof window !== 'undefined') {
    // Prevent zoom on input focus
    const inputs = document.querySelectorAll('input, textarea');
    inputs.forEach(input => {
      input.addEventListener('focus', () => {
        // Add class to prevent zoom
        document.body.classList.add('input-focused');
      });
      
      input.addEventListener('blur', () => {
        // Remove class when input loses focus
        document.body.classList.remove('input-focused');
      });
    });
  }
};

// Mobile orientation handling
export const handleOrientationChange = (callback) => {
  if (typeof window !== 'undefined') {
    const handleOrientation = () => {
      const orientation = window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
      callback(orientation);
    };

    window.addEventListener('orientationchange', handleOrientation);
    window.addEventListener('resize', handleOrientation);

    return () => {
      window.removeEventListener('orientationchange', handleOrientation);
      window.removeEventListener('resize', handleOrientation);
    };
  }
  return () => {};
}; 