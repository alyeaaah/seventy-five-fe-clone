import React, { HTMLAttributes, useEffect, useRef, useState } from "react";

interface FadeAnimationProps extends HTMLAttributes<HTMLDivElement> {
  direction?: "up" | "down";
  children: React.ReactNode;
}

export const FadeAnimation: React.FC<FadeAnimationProps> = ({
  className = "",
  direction = "up",
  children,
  ...props
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      {
        threshold: 0.1,
      }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      if (elementRef.current) {
        observer.unobserve(elementRef.current);
      }
    };
  }, []);

  const directionClass = direction === "up" ? "fade-flex-up" : "fade-flex-down";
  const animationClass = isVisible
    ? `${directionClass}-enter-active`
    : `${directionClass}-enter`;

  return (
    <div
      ref={elementRef}
      className={`fade-animation-container ${animationClass} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

