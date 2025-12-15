// src/components/animations/FadeAnimation.tsx
import { CSSTransition } from 'react-transition-group';
import { ReactNode, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

type FadeAnimationProps = {
  children: ReactNode;
  className?: string;
  timeout?: number;
  direction?: "up" | "down";
};

export const FadeAnimation = ({
  children,
  className = '',
  timeout = 500,
  direction = "down",
  ...props
}: FadeAnimationProps) => {

  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(true); // Trigger animation on mount
    return () => setShow(false);
  }, []);

  const location = useLocation();
  return(
  <CSSTransition
    {...props}
    key={location.key}
    in={show} // Always true for route changes
    timeout={timeout}
    classNames={direction === "up" ? "fade-flex-up" : "fade-flex-down"} // Using modified class names
    unmountOnExit
  >
    <div className={`fade-animation-container ${className}`}>
      {children}
    </div>
  </CSSTransition>
)};