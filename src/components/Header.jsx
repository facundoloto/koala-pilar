/**
 * @fileoverview Main Application Header Component.
 * Includes brand logo with Koala Paw icon, dark mode persistence, and shift selection.
 */

import React, { useState, useEffect } from 'react';
import { Sun, Moon, LogOut, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function Header({ onOpenAdmin }) {
  const { currentUser, isAdmin, activeShift, setActiveShift, logout } = useAuth();

  // Dark Mode persistence state in LocalStorage
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('koala_theme');
    return savedTheme ? savedTheme === 'dark' : true;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('koala_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('koala_theme', 'light');
    }
  }, [isDarkMode]);

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 px-4 py-3 transition-colors">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
        
        {/* Brand & Koala Paw Vector Icon */}
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-sky-500 text-white flex items-center justify-center shadow-md">
      
              <img src={"https://koala.com.ar/assets/Logo_Koala_Blanco_2026.webp"} alt="Logo Koala"/>
            
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-800 dark:text-white leading-none">koala-pilar</h1>
            <span className="text-[10px] text-sky-600 dark:text-sky-300 font-medium">Control Sanitario</span>
          </div>
        </div>

        {/* Navigation & User Controls */}
        <div className="flex items-center gap-2">
          
          {/* Theme Switcher Button */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            title="Cambiar Tema"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-sky-600" />}
          </button>

          {/* Active Shift Selector */}
          <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-lg flex items-center gap-1 border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setActiveShift('AM')}
              className={`px-2 py-0.5 rounded text-xs font-bold transition-all cursor-pointer ${
                activeShift === 'AM' ? 'bg-amber-500 text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              AM
            </button>
            <button
              onClick={() => setActiveShift('PM')}
              className={`px-2 py-0.5 rounded text-xs font-bold transition-all cursor-pointer ${
                activeShift === 'PM' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              PM
            </button>
          </div>

          {/* Session Info & Admin Dashboard Trigger */}
          {currentUser && (
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex flex-col text-right text-xs">
                <span className="font-bold text-slate-800 dark:text-white">{currentUser.fullName}</span>
                <span className="text-[10px] text-sky-600 dark:text-sky-300 capitalize">{currentUser.role}</span>
              </div>

              {isAdmin && (
                <button
                  onClick={onOpenAdmin}
                  className="p-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg transition-colors shadow-sm cursor-pointer"
                  title="Panel Administrador"
                >
                  <Settings className="w-4 h-4" />
                </button>
              )}

              <button
                onClick={logout}
                className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 rounded-lg transition-colors cursor-pointer"
                title="Cerrar Sesión"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>

      </div>
    </header>
  );
}