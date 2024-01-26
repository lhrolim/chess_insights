import { Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";
import { findBestGames } from "@api/api";
import React, { useEffect, useContext } from "react";
import { GameResult, SortCriteria } from "@ctypes/gameresult";
import Title from "@components/Title";
import { styled } from "@mui/material/styles";
import { UserContext } from "@utils/UserProvider";
import GameRow from "@components/game/GameRow";
import FilterComponent from "@components/game/FilterComponent";

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
  const [filterValues, setFilterValues] = React.useState({
    minMoves: 10,
    months: 2,
    precision: '70',
    sortCriteria: { sortColumn: SortCriteria.PRECISION, desc: true }
  });

  const getBestGames = async () => {
    if (!user?.userName) return;
    var games = await findBestGames({
      user: user?.userName,
      months: filterValues.months,
      minAccuracy: parseInt(filterValues.precision),
      minMoves: filterValues.minMoves,
      maxGames: 30,
      sortDTO: {
        criteria: filterValues.sortCriteria.sortColumn,
        desc: filterValues.sortCriteria.desc
      }
    });
    setGames(games);
  };

  const handleFilterChange = async (field: string, newValue: number) => {
    setFilterValues(prevValues => ({
      ...prevValues,
      [field]: newValue
    }));
  };

  const handleSortChanges = async (field: string, order: "asc" | "desc") => {
    setFilterValues(prevValues => ({
      ...prevValues,
      
    }));
    await getBestGames();
  };

  useEffect(() => {
    getBestGames();
  }, [user, filterValues]);

  const handleClick = (url: string) => {
    window.open(url, "_blank");
  };

  return (
    <React.Fragment>
      <Title>Best Reviewed Games</Title>
      <FilterComponent
        {...filterValues}
        onSortChange={handleSortChanges}
        onFilterChange={handleFilterChange}
      />
      <Table size="small">
        <StyledTableHead>
          <TableRow>
            <StyledTableCell colSpan={2}></StyledTableCell>
            <StyledTableCell>Opponent</StyledTableCell>
            <StyledTableCell>My Precision</StyledTableCell>
            <StyledTableCell className="hide-on-mobile">Moves</StyledTableCell>
            <StyledTableCell className="hide-on-mobile">Clock</StyledTableCell>
            <StyledTableCell className="hide-on-mobile">Date</StyledTableCell>
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
