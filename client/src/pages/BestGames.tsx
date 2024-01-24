import { Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";
import { findBestGames } from "@api/api";
import React, { useEffect, useContext } from "react";
import { GameResult } from "@ctypes/gameresult";
import Title from "@components/Title";
import { styled } from "@mui/material/styles";
import { UserContext } from "@utils/UserProvider";
import GameRow from "@components/game/GameRow";

const StyledTableHead = styled(TableHead)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main, // Using theme color
  color: theme.palette.primary.contrastText
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  fontSize: theme.typography.pxToRem(16),
  fontWeight: theme.typography.fontWeightBold,
  textAlign: "center",
  padding: theme.spacing(1),
  fontFamily: "Arial, sans-serif",
  borderBottom: `1px solid ${theme.palette.divider}`,
  "&:last-child": {
    textAlign: "right"
  }
}));

const StyledTableBody = styled(TableBody)(({ theme }) => ({
  // Add styles for the table body here
}));

interface IProps {}

const BestGames: React.FC<IProps> = () => {
  const [games, setGames] = React.useState<Array<GameResult>>([]);
  const { user } = useContext(UserContext);

  useEffect(() => {
    const getBestGames = async () => {
      if (!user?.userName) return;
      var games = await findBestGames(user?.userName, 3);
      setGames(games);
    };
    getBestGames();
  }, [user]);

  const handleClick = (url: string) => {
    window.open(url, "_blank");
  };

  return (
    <React.Fragment>
      <Title>Best Reviewed Games</Title>
      <Table size="small">
        <StyledTableHead>
          <TableRow>
            <StyledTableCell></StyledTableCell>
            <StyledTableCell>Players</StyledTableCell>
            <StyledTableCell>Result</StyledTableCell>
            <StyledTableCell>Accuracy</StyledTableCell>
            <StyledTableCell>Moves</StyledTableCell>
            <StyledTableCell>Clock</StyledTableCell>
            <StyledTableCell>Date</StyledTableCell>
          </TableRow>
        </StyledTableHead>
        <StyledTableBody>
          {games.map(game => (
            <GameRow game={game} handleClick={handleClick} />
          ))}
        </StyledTableBody>
      </Table>
    </React.Fragment>
  );
};

export default BestGames;
