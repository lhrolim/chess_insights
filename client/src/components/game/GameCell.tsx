import { styled } from "@mui/material/styles";
import { TableCell } from "@mui/material";
import { GameFormat, GameResult, MatchResult } from "@ctypes/gameresult";

type GameResultRowProps = {
  row: GameResult;
  rowSpan?: number;
};

const StyledTableBodyCell = styled(TableCell)(({ theme }) => ({
  padding: theme.spacing(1),
  borderBottom: `1px solid ${theme.palette.divider}`,
  textAlign: "center",
  className: "icon-font-chess",
  "&:last-child": {
    textAlign: "right"
  }
}));

export const GameFormatCell: React.FC<GameResultRowProps> = ({ row, rowSpan }) => {
  const gameFormatIcon = (format: GameFormat): string => {
    let baseString = "icon-font-chess ";
    switch (format) {
      case GameFormat.Bullet:
        baseString += "chess-classical";
        break;
      case GameFormat.Blitz:
        baseString += "blitz";
        break;
      case GameFormat.Rapid:
        baseString += "rapid";
        break;
    }
    return baseString;
  };

  return <StyledTableBodyCell className={gameFormatIcon(row.format)} rowSpan={rowSpan} />;
};

export const GameResultCell: React.FC<GameResultRowProps> = ({ row, rowSpan }) => {
  const gameResultClass = (result: MatchResult): string => {
    return result === MatchResult.Won
      ? "icon-font-chess square-plus"
      : "icon-font-chess square-minus";
  };

  return (
    <StyledTableBodyCell
      className={gameResultClass(row.result)}
      rowSpan={rowSpan}
    ></StyledTableBodyCell>
  );
};
