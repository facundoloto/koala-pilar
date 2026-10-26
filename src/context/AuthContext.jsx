/**
 * @fileoverview Authentication & Access Control Context Provider.
 * Validates user credentials (Email + Password) and manages user session & RBAC roles.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const DEFAULT_ADMIN_USER = {
  id: 'admin-seed-01',
  fullName: 'Admin Koala',
  email: 'admin@koala.com.ar',
  password: 'admin123', // Contraseña por defecto
  role: 'admin',
  defaultShift: 'AM'
};

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = localStorage.getItem('koala_current_user');
    return savedUser ? JSON.parse(savedUser) : DEFAULT_ADMIN_USER;
  });

  const [userDirectory, setUserDirectory] = useState(() => {
    const savedDirectory = localStorage.getItem('koala_user_directory');
    return savedDirectory ? JSON.parse(savedDirectory) : [
      DEFAULT_ADMIN_USER,
      { id: 'op-01', fullName: 'Carlos Gómez', email: 'carlos@koala.com.ar', password: '123', role: 'operator', defaultShift: 'AM' },
      { id: 'op-02', fullName: 'María Rodríguez', email: 'maria@koala.com.ar', password: '123', role: 'operator', defaultShift: 'PM' }
    ];
  });

  const [activeShift, setActiveShift] = useState('AM');

  useEffect(() => {
    localStorage.setItem('koala_current_user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('koala_user_directory', JSON.stringify(userDirectory));
  }, [userDirectory]);

  /**
   * Autentica la sesión validando Email y Contraseña.
   * @param {string} email
   * @param {string} password
   */
  const login = (email, password) => {
    const matchedUser = userDirectory.find(
      (user) => user.email.toLowerCase() === email.toLowerCase()
    );

    if (!matchedUser) {
      return { success: false, error: 'El usuario no existe en el sistema.' };
    }

    // Validación de contraseña (en producción esto lo valida Firebase Auth)
    if (matchedUser.password && matchedUser.password !== password) {
      return { success: false, error: 'Contraseña incorrecta.' };
    }

    setCurrentUser(matchedUser);
    if (matchedUser.defaultShift) setActiveShift(matchedUser.defaultShift);
    return { success: true };
  };

  const logout = () => setCurrentUser(null);

  const registerUserByAdmin = (newUserPayload) => {
    if (currentUser?.role !== 'admin') {
      throw new Error('Solo los Administradores pueden registrar personal.');
    }

    const newUser = {
      id: `user-${Date.now()}`,
      ...newUserPayload,
      role: newUserPayload.role || 'operator',
      password: newUserPayload.password || '123456' // Contraseña inicial por defecto
    };

    setUserDirectory((prev) => [...prev, newUser]);
    return newUser;
  };

  const revokeUserByAdmin = (userId) => {
    if (currentUser?.role !== 'admin') return;
    setUserDirectory((prev) => prev.filter((user) => user.id !== userId));
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      isAdmin: currentUser?.role === 'admin',
      activeShift,
      setActiveShift,
      login,
      logout,
      userDirectory,
      registerUserByAdmin,
      revokeUserByAdmin
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return context;
};