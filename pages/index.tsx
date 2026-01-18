import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    // Load the Vite app dynamically
    const script = document.createElement('script');
    script.type = 'module';
    script.src = '/assets/index-CDIgYamD.js';
    document.body.appendChild(script);

    // Load the CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/assets/index-Dgihpmma.css';
    document.head.appendChild(link);

    return () => {
      // Cleanup if needed
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
      if (document.head.contains(link)) {
        document.head.removeChild(link);
      }
    };
  }, []);

  return (
    <div>
      <div id="root"></div>
      <div>Loading application...</div>
    </div>
  );
}
