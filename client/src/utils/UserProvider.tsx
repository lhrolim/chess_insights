// UserContext.tsx
import React, { createContext, useState, ReactNode } from 'react';
import { IUser, IUserContext } from '@ctypes/user';

const defaultUserContext: IUserContext = {
  user: null,
  setUser: () => {}
};

export const UserContext = createContext<IUserContext>(defaultUserContext);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<IUser | null>(null);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};