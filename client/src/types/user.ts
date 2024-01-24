export interface IUser {
    userName: string;
    // add other user-related properties here
  }
  
  export interface IUserContext {
    user: IUser | null;
    setUser: React.Dispatch<React.SetStateAction<IUser | null>>;
  }
  