import React, { ChangeEvent, MouseEvent, useState, useContext, FormEvent,useEffect } from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import RefreshIcon from "@mui/icons-material/Refresh";
import { UserContext } from "@utils/UserProvider";
import { IUser } from "@ctypes/user";

interface BasicUserFormProps {
  // Add any props here if needed
}

const BasicUserForm: React.FC<BasicUserFormProps> = () => {
  const { user,setUser } = useContext(UserContext);
  const [userName, setUserName] = useState<string>("");


  // Initialize userName with the user's name from context when the component mounts
  useEffect(() => {
    if (user && user.userName) {
      setUserName(user.userName);
    }
  }, [user]);

  const handleRefreshClick = (event: MouseEvent<HTMLButtonElement> | FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // Prevents the default form submit action
    const newUser: IUser = { userName };
    setUser(newUser);
  };

  const handleUsernameChange = (event: ChangeEvent<HTMLInputElement>) => {
    setUserName(event.target.value);
  };

  return (
    <form onSubmit={handleRefreshClick}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1
        }}
      >
        <TextField
          required
          id="username"
          name="username"
          label="User Name"
          autoComplete="username"
          variant="standard"
          sx={{ flexGrow: 1 }}
          onChange={handleUsernameChange}
          value={userName}
        />
        <Button
          type="submit" // Make the button of type 'submit'
          variant="contained"
          color="primary"
          startIcon={<RefreshIcon />}
        >
          Refresh
        </Button>
      </Box>
    </form>
  );
};

export default BasicUserForm;
