import { Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";
import { findBestGames } from "@api/api";
import React, { Fragment, useEffect, useContext } from "react";
import { GameResult } from "@ctypes/gameresult";
import Title from "@components/Title";
import { styled } from "@mui/material/styles";
import { GameFormatCell, GameResultCell } from "@components/game/GameCell";
import { UserContext } from "@utils/UserProvider";

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

const StyledTableBodyCell = styled(TableCell)(({ theme }) => ({
  padding: theme.spacing(1),
  borderBottom: `1px solid ${theme.palette.divider}`,
  textAlign: "center"
}));

const StyledTableBodyCellNoBorder = styled(TableCell)(({ theme }) => ({
  padding: theme.spacing(1),
  borderBottom: `0px solid ${theme.palette.divider}`,
  textAlign: "center"
}));

const formattedResult = (result: string, endMatchMode: string) => {
  return result + " - " + endMatchMode;
};

const formattedOpponent = (opponentUserName: string, opponentRating?: number) => {
  return opponentUserName + " (" + opponentRating + ")";
};

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
            <Fragment key={game.url}>
              <TableRow hover style={{ cursor: "pointer" }} onClick={() => handleClick(game.url)}>
                <GameFormatCell row={game} style={{ borderBottom: "0px" }} />
                <StyledTableBodyCellNoBorder>
                  {formattedOpponent(game.whiteData.username, game.whiteData.rating)}
                </StyledTableBodyCellNoBorder>
                <GameResultCell row={game} rowSpan={2} />
                <StyledTableBodyCellNoBorder>{`${game.whiteData.precision}`}</StyledTableBodyCellNoBorder>
                <StyledTableBodyCell rowSpan={2}>{game.numberOfMoves}</StyledTableBodyCell>
                <StyledTableBodyCellNoBorder>
                  {game.whiteData.finalClock}
                </StyledTableBodyCellNoBorder>
                <StyledTableBodyCell rowSpan={2} style={{ textAlign: "right" }}>
                  {game.timestamp}
                </StyledTableBodyCell>
              </TableRow>
              <TableRow hover style={{ cursor: "pointer" }} onClick={() => handleClick(game.url)}>
                <StyledTableBodyCell>{`${game.matchTimeInSeconds}`}</StyledTableBodyCell>
                <StyledTableBodyCell>
                  {formattedOpponent(game.blackData.username, game.blackData.rating)}
                </StyledTableBodyCell>
                <StyledTableBodyCell>{`${game.blackData.precision}`}</StyledTableBodyCell>
                <StyledTableBodyCell>{game.blackData.finalClock}</StyledTableBodyCell>
              </TableRow>
            </Fragment>
          ))}
        </StyledTableBody>
      </Table>
    </React.Fragment>
  );
};

export default BestGames;
