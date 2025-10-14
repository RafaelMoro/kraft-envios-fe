"use client"
import { useEffect, useState } from "react";
import { Button, ThemeMode } from "flowbite-react"
import clsx from "clsx"

import { NightIcon } from "../icons/NightIcon"
import { saveThemeApi } from "@/shared/utils/global.utils";
import { getThemePreference } from "@/shared/lib/preferences.lib";

interface ToggleDarkModeProps {
  cssClass?: string;
}

export const ToggleDarkMode = ({ cssClass }: ToggleDarkModeProps) => {
  const [mode, setMode] = useState<ThemeMode | null>(null);

  const toggleDarkMode = async () => {
    const htmlElement = document.documentElement;

    if (mode === 'light') {
      htmlElement.setAttribute("data-theme", "dark");
      await saveThemeApi('dark')
      setMode('dark')
      return
    }

    htmlElement.setAttribute("data-theme", "light");
    await saveThemeApi('light')
    setMode('light')
  }

  useEffect(() => {
    getThemePreference().then((theme) => setMode(theme as ThemeMode))
  }, [])

  return (
    <Button className={clsx(cssClass)} data-testid="toggle-theme-mode-button" onClick={toggleDarkMode} color="light" outline>
      <NightIcon />
    </Button>
  )
}