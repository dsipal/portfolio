import { useState, useEffect } from "react";

export default function useDark() {
  if (typeof window !== 'undefined') {
    // Perform localStorage action
    const item = localStorage.getItem('key')
  }
  
  const [theme, setTheme] = useState(
    typeof window !== "undefined" ? localStorage.theme : "light"
  );
  const colorTheme = theme === "dark" ? "light" : "dark";
  useEffect(() => {
    
    
    const root = window.document.documentElement;
    root.classList.remove(colorTheme);
    root.classList.add(theme);
    localStorage.setItem("theme", theme);
  }, [theme, colorTheme]);
  return [colorTheme, setTheme];
}