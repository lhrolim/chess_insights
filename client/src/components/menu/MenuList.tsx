import * as React from "react";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import DashboardIcon from "@mui/icons-material/Dashboard";
import GamesIcon from "@mui/icons-material/Games";
import { SvgIconComponent } from "@mui/icons-material";
import { navigate } from "@patched/hookrouter";

interface CustomListItemProps {
  Icon: SvgIconComponent;
  title: string;
  route: string;
}

const goTo = (location: string) => (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
  event.preventDefault();
  navigate(location);
};


const CustomListItem: React.FC<CustomListItemProps> = ({ Icon, title, route }) => (
  <ListItemButton onClick={goTo(route)}>
    <ListItemIcon>
      <Icon />
    </ListItemIcon>
    <ListItemText primary={title} />
  </ListItemButton>
);
export const mainListItems = (
  <React.Fragment>
    <CustomListItem Icon={DashboardIcon} title="Dashboard" route="/" />
    <CustomListItem Icon={GamesIcon} title="Best Games" route="/best" />
  </React.Fragment>
);
