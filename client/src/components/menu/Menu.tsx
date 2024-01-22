import MuiDrawer from "@mui/material/Drawer";
import { Toolbar, IconButton, List, Divider } from "@mui/material";
import { styled } from "@mui/material/styles";
import React from "react";

import { DrawerProps as MuiDrawerProps } from "@mui/material/Drawer";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import { mainListItems } from "./MenuList";

interface ExtendedDrawerProps extends MuiDrawerProps {
  width?: number;
}

interface MenuProps {
  width?: number;
  open: boolean;
  toggleDrawer: () => void;
}

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: prop => prop !== "open"
})<ExtendedDrawerProps>(({ theme, open, width }) => ({
  "& .MuiDrawer-paper": {
    position: "relative",
    whiteSpace: "nowrap",
    width,
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen
    }),
    boxSizing: "border-box",
    ...(!open && {
      overflowX: "hidden",
      transition: theme.transitions.create("width", {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen
      }),
      width: theme.spacing(7),
      [theme.breakpoints.up("sm")]: {
        width: theme.spacing(9)
      }
    })
  }
}));

const Menu: React.FunctionComponent<MenuProps> = ({ width, open, toggleDrawer }) => {
  return (
    <Drawer variant="permanent" open={open} width={width}>
      <Toolbar
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          px: [1]
        }}
      >
        <IconButton onClick={toggleDrawer}>
          <ChevronLeftIcon />
        </IconButton>
      </Toolbar>
      <Divider />
      <List component="nav">
        {mainListItems}
        <Divider sx={{ my: 1 }} />
        {/* {secondaryListItems} */}
      </List>
    </Drawer>
  );
};

export default Menu;
