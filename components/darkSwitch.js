import * as React from 'react';
import { DarkModeSwitch } from "react-toggle-dark-mode";
import useDark from "../lib/useDark";

export default function Switcher() {
  var dark;
  var initColor;
  if (typeof window !== 'undefined') {
    if (localStorage.getItem('theme') === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)){
      dark = true
    } else {
      dark = false
    }
  }
  
  const [colorTheme, setTheme] = useDark();
  const [isDarkMode, setDarkMode] = React.useState(dark);
  const toggleDarkMode = (checked) => {
    setTheme(colorTheme);
    setDarkMode(checked);
  };
  return (
      <DarkModeSwitch
        style={{ }}
        checked={isDarkMode}
        onChange={toggleDarkMode}
        size={25}
      />
  );
}
