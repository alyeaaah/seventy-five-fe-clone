import { useEffect, useRef, useState } from 'react';

interface VisibilitySensorProps {
  onChange: (isVisible: boolean) => void;
  children?: React.ReactNode | ((args: { isVisible: boolean }) => React.ReactNode);
  active?: boolean;
  partialVisibility?: boolean;
  offset?: { top?: number; left?: number; bottom?: number; right?: number };
  minTopValue?: number;
  intervalCheck?: boolean;
  intervalDelay?: number;
  scrollCheck?: boolean;
  scrollDelay?: number;
  scrollThrottle?: number;
  resizeCheck?: boolean;
  resizeDelay?: number;
  resizeThrottle?: number;
  containment?: any;
  delayedCall?: boolean;
}

const VisibilitySensorWrapper: React.FC<VisibilitySensorProps> = ({
  onChange,
  children,
  active = true,
  partialVisibility = false,
  offset = {},
  minTopValue = 0,
  delayedCall = false,
  ...restProps
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (!active || !elementRef.current) {
      return;
    }

    const element = elementRef.current;

    // Create Intersection Observer
    const observerOptions: IntersectionObserverInit = {
      root: null,
      rootMargin: `${offset.top || 0}px ${offset.right || 0}px ${offset.bottom || 0}px ${offset.left || 0}px`,
      threshold: partialVisibility ? [0, 0.1, 0.5, 1] : [0]
    };

    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
      entries.forEach(entry => {
        const isElementVisible = partialVisibility
          ? entry.intersectionRatio > 0
          : entry.intersectionRatio > 0;

        if (delayedCall) {
          setTimeout(() => {
            setIsVisible(isElementVisible);
            onChange(isElementVisible);
          }, 100);
        } else {
          setIsVisible(isElementVisible);
          onChange(isElementVisible);
        }
      });
    };

    observerRef.current = new IntersectionObserver(handleIntersection, observerOptions);
    observerRef.current.observe(element);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
    };
  }, [active, partialVisibility, offset, delayedCall, onChange]);

  return (
    <div ref={elementRef} {...restProps}>
      {typeof children === 'function' ? children({ isVisible }) : children}
    </div>
  );
};

export default VisibilitySensorWrapper;
