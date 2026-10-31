"use client";
import { useState, useEffect } from "react";

export default function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(null);

  useEffect(() => {
    fetch('/api/content')
      .then(res => res.json())
      .then(data => {
        if (data?.theme) setTheme(data.theme);
      })
      .catch(console.error);
  }, []);

  const cssVars = theme ? {
    '--color-primary': theme.primaryColor || '#06b6d4',
    '--color-secondary': theme.secondaryColor || '#d946ef',
    '--color-accent': theme.accentColor || '#eab308',
    '--color-bg': theme.bgColor || '#0f172a',
    '--color-header-bg': theme.headerBg || '#0f172a80',
    '--color-text': theme.textColor || '#f8fafc',
  } : {};

  return (
    <div style={cssVars} className="contents">
      {children}
    </div>
  );
}
