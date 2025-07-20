import { useState, useEffect } from 'react';

// Mobile detection utility
export const useMobileDetector = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isSmallMobile, setIsSmallMobile] = useState(false);
  const [isLargeMobile, setIsLargeMobile] = useState(false);
  const [orientation, setOrientation] = useState('portrait');

  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      // Check if it's a mobile device
      const mobile = width <= 768;
      const tablet = width > 768 && width <= 1024;
      const smallMobile = width <= 480;
      const largeMobile = width > 480 && width <= 768;
      
      console.log('MobileDetector - Width:', width, 'Height:', height, 'Mobile:', mobile);
      
      setIsMobile(mobile);
      setIsTablet(tablet);
      setIsSmallMobile(smallMobile);
      setIsLargeMobile(largeMobile);
      
      // Check orientation
      setOrientation(width > height ? 'landscape' : 'portrait');
    };

    // Initial check
    checkDevice();

    // Add event listeners
    window.addEventListener('resize', checkDevice);
    window.addEventListener('orientationchange', checkDevice);

    return () => {
      window.removeEventListener('resize', checkDevice);
      window.removeEventListener('orientationchange', checkDevice);
    };
  }, []);

  return {
    isMobile,
    isTablet,
    isSmallMobile,
    isLargeMobile,
    orientation,
    isLandscape: orientation === 'landscape',
    isPortrait: orientation === 'portrait'
  };
};

// Get mobile-specific class names
export const getMobileClasses = (baseClass, mobileClass) => {
  if (typeof window !== 'undefined') {
    const isMobile = window.innerWidth <= 768;
    return isMobile ? mobileClass : baseClass;
  }
  return baseClass;
};

// Get mobile-specific styles
export const getMobileStyles = (desktopStyles, mobileStyles) => {
  if (typeof window !== 'undefined') {
    const isMobile = window.innerWidth <= 768;
    return isMobile ? { ...desktopStyles, ...mobileStyles } : desktopStyles;
  }
  return desktopStyles;
};

// Mobile-specific dimensions
export const MOBILE_DIMENSIONS = {
  ICON_SIZES: {
    SMALL: 40,
    MEDIUM: 50,
    LARGE: 60
  },
  TEXT_SIZES: {
    SMALL: '0.8rem',
    MEDIUM: '1rem',
    LARGE: '1.2rem'
  },
  PADDING: {
    SMALL: '0.5rem',
    MEDIUM: '1rem',
    LARGE: '1.5rem'
  },
  GAPS: {
    SMALL: '0.3rem',
    MEDIUM: '0.5rem',
    LARGE: '1rem'
  }
};

// Mobile-specific breakpoints
export const BREAKPOINTS = {
  MOBILE: 768,
  TABLET: 1024,
  SMALL_MOBILE: 480,
  LARGE_MOBILE: 768
};

// Check if current device is mobile
export const isMobileDevice = () => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth <= BREAKPOINTS.MOBILE;
};

// Check if current device is tablet
export const isTabletDevice = () => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth > BREAKPOINTS.MOBILE && window.innerWidth <= BREAKPOINTS.TABLET;
};

// Get device type
export const getDeviceType = () => {
  if (typeof window === 'undefined') return 'desktop';
  
  const width = window.innerWidth;
  if (width <= BREAKPOINTS.SMALL_MOBILE) return 'small-mobile';
  if (width <= BREAKPOINTS.MOBILE) return 'mobile';
  if (width <= BREAKPOINTS.TABLET) return 'tablet';
  return 'desktop';
}; 