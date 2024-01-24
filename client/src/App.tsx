import React from "react";
import "./App.css";
import config from "./config";
import MuiAppBar, { AppBarProps as MuiAppBarProps } from "@mui/material/AppBar";
import Menu from "@components/menu/Menu";
import { useRoutes, useRedirect } from "@patched/hookrouter";
import MenuIcon from "@mui/icons-material/Menu";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { usePath } from "@patched/hookrouter";

import { useEffect } from "react";

import {
  CssBaseline,
  Box,
  Container,
  ThemeProvider,
  styled,
  Toolbar,
  IconButton,
  Typography,
  Badge,
  TextField,
  Button
} from "@mui/material";
import useThemeState from "@hooks/useThemeState";
import { routes } from "@pages/Routes";
import NotFound from "@components/NotFound";
import { UserProvider } from "@utils/UserProvider";
import RefreshIcon from "@mui/icons-material/Refresh";
import BasicUserForm from "@components/BasicUserForm";

interface AppBarProps extends MuiAppBarProps {
  open?: boolean;
}

const drawerWidth: number = 240;

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: prop => prop !== "open"
})<AppBarProps>(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen
    })
  })
}));

const App: React.FC = () => {
  const { theme, toggleTheme, darkModeEnabled } = useThemeState();
  const [open, setOpen] = React.useState(true);
  const path = usePath();

  useEffect(() => {
    // Check the window width on initial render
    const handleResize = () => {
      if (window.innerWidth < 600) {
        setOpen(false);
      } else {
        setOpen(true);
      }
    };

    // Call the function to set initial state
    handleResize();

    // Optional: Add event listener if you want the drawer to respond to window resizing
    window.addEventListener("resize", handleResize);

    // Clean up event listener
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleDrawer = () => {
    setOpen(!open);
  };

  const baseName = config.client.basename;

  useEffect(() => {
    // Update routeResult based on location
    // setRouteResult(...) based on the new location
  }, [path]); // Dependency on location ensures effect runs on route change

  const routeResult = useRoutes(routes);
  useRedirect("/about/", "/about");

  return (
    <ThemeProvider theme={theme}>
      <UserProvider>
        <Box sx={{ display: "flex" }}>
          <CssBaseline />
          <AppBar position="absolute" open={open}>
            <Toolbar
              sx={{
                pr: "24px" // keep right padding when drawer closed
              }}
            >
              <IconButton
                edge="start"
                color="inherit"
                aria-label="open drawer"
                onClick={toggleDrawer}
                sx={{
                  marginRight: "36px",
                  ...(open && { display: "none" })
                }}
              >
                <MenuIcon />
              </IconButton>
              <Typography component="h1" variant="h6" color="inherit" noWrap sx={{ flexGrow: 1 }}>
                Chess Insights
              </Typography>
              {/* <IconButton color="inherit">
              <Badge badgeContent={4} color="secondary">
                <NotificationsIcon />
              </Badge>
            </IconButton> */}
            </Toolbar>
          </AppBar>
          <Menu open={open} width={drawerWidth} toggleDrawer={toggleDrawer} />
          <Box
            component="main"
            sx={{
              backgroundColor: theme =>
                theme.palette.mode === "light" ? theme.palette.grey[100] : theme.palette.grey[900],
              flexGrow: 1,
              height: "100vh",
              overflow: "auto"
            }}
          >
            <Toolbar />
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
              <BasicUserForm />
              {routeResult || <NotFound />}
            </Container>
          </Box>
        </Box>
      </UserProvider>
    </ThemeProvider>
  );
};

export default App;
