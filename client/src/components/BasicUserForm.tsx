import React, { ChangeEvent, MouseEvent, useState, useContext } from "react";
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
  const [userName, setUserName] = useState<string>("");
  const { setUser } = useContext(UserContext);

  const handleRefreshClick = (event: MouseEvent<HTMLButtonElement>) => {
    const newUser: IUser = { userName };
    setUser(newUser);
  };

  const handleUsernameChange = (event: ChangeEvent<HTMLInputElement>) => {
    setUserName(event.target.value);
  };

  return (
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
      />
      <Button
        variant="contained"
        color="primary"
        startIcon={<RefreshIcon />}
        onClick={handleRefreshClick}
      ></Button>
    </Box>
  );
};

export default BasicUserForm;
