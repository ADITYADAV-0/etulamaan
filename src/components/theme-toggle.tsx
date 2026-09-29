"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
export function ThemeToggle() { const [dark, setDark] = useState(false); useEffect(() => { setDark(localStorage.getItem("etulamaan_theme") === "dark"); }, []); const toggle = () => { const next = !dark; setDark(next); localStorage.setItem("etulamaan_theme", next ? "dark" : "light"); document.documentElement.classList.toggle("dark", next); }; return <button className="icon-button" aria-label="Toggle theme" onClick={toggle}>{dark ? <Sun size={16} /> : <Moon size={16} />}</button>; }
