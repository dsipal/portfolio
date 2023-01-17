import { useState, useEffect } from "react";

export default function useDark() {
  const [theme, setTheme] = useState(
    typeof window !== "undefined" ? localStorage.getItem("theme") || "dark" : "dark"
  );
  const colorTheme = theme === "dark" ? "light" : "dark";
  useEffect(() => {
    if (typeof window !== 'undefined') {
    const root = window.document.documentElement;
    root.classList.remove(colorTheme);
    root.classList.add(theme);
    localStorage.setItem("theme", theme);
    //setDarkMode(theme === 'dark');
    }
  }, [theme, colorTheme]);

  return [colorTheme, setTheme];
}
