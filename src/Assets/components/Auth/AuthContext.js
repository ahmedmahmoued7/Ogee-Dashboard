import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("userToken"));
  const [userPhone, setUserPhone] = useState(localStorage.getItem("userPhone"));

  const login = (newToken, newUserPhone) => {
    localStorage.setItem("userToken", newToken);
    localStorage.setItem("userPhone", newUserPhone);
    setToken(newToken);
    setUserPhone(newUserPhone);
  };

  const logout = () => {
    localStorage.removeItem("userToken");
    localStorage.removeItem("userPhone");
    setToken(null);
    setUserPhone(null);
  };

  useEffect(() => {
    const token = localStorage.getItem("userToken");
    if (token) {
      setToken(token);
    }
  }, []);

  return <AuthContext.Provider value={{ token, userPhone, login, logout }}>{children}</AuthContext.Provider>;
};
