// UserContext.tsx
import React, { createContext, useState, ReactNode,useEffect } from 'react';
import { IUser, IUserContext } from '@ctypes/user';

const defaultUserContext: IUserContext = {
  user: null,
  setUser: () => {}
};

export const UserContext = createContext<IUserContext>(defaultUserContext);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<IUser | null>(null);

   // Load user from localStorage when the component mounts
   useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Update localStorage whenever the user changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};