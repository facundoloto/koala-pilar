/**
 * @fileoverview Login Modal Component.
 * Implements password visibility toggle, loading spinner state, and clean validation error reporting.
 */

import React, { useState } from 'react';
import { LogIn, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function LoginModal() {
  const { login } = useAuth();
  
  // State variables for form fields and UI behaviors
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  /**
   * Handles user login submission with asynchronous simulated loading feedback.
   * @param {React.FormEvent} e - Form event payload.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    // Simulated network delay for realistic visual feedback
    setTimeout(() => {
      const result = login(email, password);
      if (!result.success) {
        setErrorMessage(result.error || 'Credenciales inválidas');
      }
      setIsLoading(false);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl text-slate-800 dark:text-slate-100">
        
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-sky-500 text-white flex items-center justify-center mx-auto mb-3 shadow-lg">
           <img src={"https://koala.com.ar/assets/Huella-blanca-sin-fdo.webp"} alt="Logo Koala" className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold">Acceso a koala-pilar</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Ingresa tus credenciales para operar en el sistema
          </p>
        </div>

        {/* Error Notification Alert */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-semibold">
            {errorMessage}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold mb-1">Correo Electrónico</label>
            <input
              type="email"
              placeholder="ej: admin@koala.com.ar"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
              disabled={isLoading}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold mb-1">Contraseña</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2.5 pr-10 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
                disabled={isLoading}
                required
              />
              
              {/* Toggle Password Visibility Button */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer focus:outline-none"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button with Dynamic Loader State */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-sky-500 hover:bg-sky-600 disabled:opacity-50 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors shadow-md cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Iniciando Sesión...</span>
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>Ingresar al Sistema</span>
              </>
            )}
          </button>
        </form>

        {/* Demo Accounts Reference */}
        <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-400 text-center space-y-1">
          <p className="font-semibold text-slate-500 dark:text-slate-400">Credenciales Demo:</p>
          <p><span className="font-bold text-sky-500">Admin:</span> admin@koala.com.ar | <span className="font-bold">Clave:</span> admin123</p>
          <p><span className="font-bold text-sky-500">Operador:</span> carlos@koala.com.ar | <span className="font-bold">Clave:</span> 123</p>
        </div>

      </div>
    </div>
  );
}