import * as React from 'react';
import { useState } from "react";
import { DarkModeSwitch } from "react-toggle-dark-mode";
import useDark from "../lib/useDark";

export default function Switcher() {
  const [colorTheme, setTheme] = useDark();
  const [isDarkMode, setDarkMode] = React.useState(true);
  const toggleDarkMode = (checked) => {
    setTheme(colorTheme);
    setDarkMode(checked);
  };
  return (
      <DarkModeSwitch
        style={{ marginBottom: "2rem" }}
        checked={isDarkMode}
        onChange={toggleDarkMode}
        size={30}
      />
  );
}