import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { DarkModeSwitch } from "react-toggle-dark-mode"

export default function Switcher() {
  const { theme, setTheme } = useTheme()
  const [ mounted, setMounted ] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  if (!mounted) return <></>
  return (
    <DarkModeSwitch
      style={{}}
      className="mt-1"
      checked={(theme === "dark" ? true : false)}
      onChange={() => {
        setTheme(theme === "dark" ? "light" : "dark");
      }}
      size={20}
    />
  );
}
