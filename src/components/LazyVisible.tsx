import React, { useEffect, useRef, useState } from 'react';

interface LazyVisibleProps {
  rootMargin?: string;
  threshold?: number | number[];
  className?: string;
  children: React.ReactNode;
}

const LazyVisible: React.FC<LazyVisibleProps> = ({
  rootMargin = '200px 0px',
  threshold = 0,
  className = '',
  children,
}) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!ref.current || isVisible) return;
    const target = ref.current;
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setIsVisible(true);
            obs.disconnect();
            break;
          }
        }
      },
      { root: null, rootMargin, threshold }
    );
    obs.observe(target);
    return () => obs.disconnect();
  }, [rootMargin, threshold, isVisible]);

  return <div ref={ref} className={className}>{isVisible ? children : null}</div>;
};

export default LazyVisible;


