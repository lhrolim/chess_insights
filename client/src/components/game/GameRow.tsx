import React, { Fragment, useState } from "react";
import { TableCell, TableRow } from "@mui/material";
import { GameResult } from "@ctypes/gameresult";
import { GameFormatCell, GameResultCell } from "@components/game/GameCell";
import { styled } from "@mui/material/styles";

interface GameRowProps {
  game: GameResult;
  handleClick: (url: string) => void;
}

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

const formattedOpponent = (opponentUserName: string, opponentRating?: number) => {
  return opponentUserName + " (" + opponentRating + ")";
};

const GameRow: React.FC<GameRowProps> = ({ game, handleClick }) => {
  const [isHovered, setIsHovered] = useState(false);

  const hoverStyle = isHovered ? { backgroundColor: "rgba(0, 0, 0, 0.04)", cursor: "pointer" } : {};

  return (
    <Fragment key={game.url}>
      <TableRow
        hover
        style={hoverStyle}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => handleClick(game.url)}
      >
        <GameFormatCell row={game} style={{ borderBottom: "0px" }} />
        <StyledTableBodyCellNoBorder>
          {formattedOpponent(game.whiteData.username, game.whiteData.rating)}
        </StyledTableBodyCellNoBorder>
        <GameResultCell row={game} rowSpan={2} />
        <StyledTableBodyCellNoBorder>{`${game.whiteData.precision}`}</StyledTableBodyCellNoBorder>
        <StyledTableBodyCell rowSpan={2}>{game.numberOfMoves}</StyledTableBodyCell>
        <StyledTableBodyCellNoBorder>{game.whiteData.finalClock}</StyledTableBodyCellNoBorder>
        <StyledTableBodyCell rowSpan={2} style={{ textAlign: "right" }}>
          {game.timestamp}
        </StyledTableBodyCell>
      </TableRow>
      <TableRow
        hover
        style={hoverStyle}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => handleClick(game.url)}
      >
        <StyledTableBodyCell>{`${game.matchTimeInSeconds}`}</StyledTableBodyCell>
        <StyledTableBodyCell>
          {formattedOpponent(game.blackData.username, game.blackData.rating)}
        </StyledTableBodyCell>
        <StyledTableBodyCell>{`${game.blackData.precision}`}</StyledTableBodyCell>
        <StyledTableBodyCell>{game.blackData.finalClock}</StyledTableBodyCell>
      </TableRow>
    </Fragment>
  );
};

export default GameRow;
