import { Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";
import { findBestGames } from "@api/api";
import React, { useEffect } from "react";
import { GameResult } from "@ctypes/gameresult";
import Title from "@components/Title";
import { styled } from "@mui/material/styles";

const StyledTableHead = styled(TableHead)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main, // Using theme color
  color: theme.palette.primary.contrastText
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  fontSize: theme.typography.pxToRem(16),
  fontWeight: theme.typography.fontWeightBold,
  // textAlign: "center",
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
  // textAlign: "center",
  "&:last-child": {
    textAlign: "right"
  }
}));

export default function BestGames() {

  const formattedResult = (result: string, endMatchMode: string) => {
    return result + " - " + endMatchMode;
  };

  const [games, setGames] = React.useState<Array<GameResult>>([]);

  useEffect(() => {
    const getBestGames = async () => {
      var games = await findBestGames("lhrolim", 3);
      setGames(games);
    };
    getBestGames();
  }, []);

  const handleClick = (url: string) => {
    window.open(url, '_blank');
  };

  return (
    <React.Fragment>
      <Title>Best games</Title>
      <Table size="small">
        <StyledTableHead>
          <TableRow>
            <StyledTableCell>Date</StyledTableCell>
            <StyledTableCell>Opponent</StyledTableCell>
            <StyledTableCell>Time Control</StyledTableCell>
            <StyledTableCell>Ratings</StyledTableCell>
            <StyledTableCell>Result</StyledTableCell>
            <StyledTableCell>Moves</StyledTableCell>
            <StyledTableCell align="right">Accuracy</StyledTableCell>
          </TableRow>
        </StyledTableHead>
        <StyledTableBody>
          {games.map(row => (
            <TableRow
              key={row.url}
              hover
              style={{ cursor: "pointer" }}
              onClick={() => handleClick(row.url)}
            >
              <StyledTableBodyCell>{row.timestamp}</StyledTableBodyCell>
              <StyledTableBodyCell>{row.opponentUserName}</StyledTableBodyCell>
              <StyledTableBodyCell>{row.format}</StyledTableBodyCell>
              <StyledTableBodyCell>{row.myRating}</StyledTableBodyCell>
              <StyledTableBodyCell>
                {formattedResult(row.result, row.endMatchMode)}
              </StyledTableBodyCell>
              <StyledTableBodyCell>{row.numberOfMoves}</StyledTableBodyCell>
              <StyledTableBodyCell align="right">{`${row.myPrecision}`}</StyledTableBodyCell>
            </TableRow>
          ))}
        </StyledTableBody>
      </Table>
    </React.Fragment>
  );
}
