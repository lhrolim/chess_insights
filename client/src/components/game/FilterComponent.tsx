import React, { useState, useEffect } from "react";
import {
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField
} from "@mui/material";

type FilterComponentProps = {
  minMoves: number;
  months: number;
  precision: string;
  onSortChange: (field: string, order: "asc" | "desc") => void;
  onFilterChange: (filterName: string, newValue: number) => void;
};

const FilterComponent: React.FC<FilterComponentProps> = ({
  minMoves,
  months,
  precision,
  onSortChange,
  onFilterChange
}) => {
  const handleSortChange = (event: SelectChangeEvent) => {
    const value = event.target.value as string;
    const [field, order] = value.split(":");
    onSortChange(field, order as "asc" | "desc");
  };

  const handlePrecisionChange = (event: SelectChangeEvent) => {
    const value = event.target.value as string;
    onFilterChange("precision", Number(value));
  };

  const handleFilterValueChange =
    (filterName: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
      onFilterChange(filterName, Number(event.target.value));
    };

  return (
    <Grid container spacing={2}>
      {" "}
      {/* Adjust spacing as needed */}
      <Grid item xs={6} sm={3}>
        {" "}
        {/* Adjust grid sizing for responsiveness */}
        <TextField
          fullWidth
          label="Min Moves"
          type="number"
          value={minMoves}
          onChange={handleFilterValueChange("minMoves")}
        />
      </Grid>
      <Grid item xs={6} sm={3}>
        {" "}
        {/* Adjust grid sizing for responsiveness */}
        <TextField
          fullWidth
          label="Months"
          type="number"
          value={months}
          onChange={handleFilterValueChange("months")}
        />
      </Grid>
      <Grid item xs={6} sm={3}>
        {" "}
        {/* Adjust grid sizing for responsiveness */}
        <FormControl fullWidth>
          <InputLabel>Precision</InputLabel>
          <Select value={precision} onChange={handlePrecisionChange}>
            <MenuItem value="50">50+</MenuItem>
            <MenuItem value="60">60+</MenuItem>
            <MenuItem value="70">70+</MenuItem>
            <MenuItem value="80">80+</MenuItem>
            <MenuItem value="90">90+</MenuItem>
            <MenuItem value="95">95+</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={6} sm={3}>
        {" "}
        {/* Adjust grid sizing for responsiveness */}
        <FormControl fullWidth>
          <InputLabel>Sort By</InputLabel>
          <Select value="" onChange={handleSortChange}>
            <MenuItem value="minmoves:asc">Min Moves (Ascending)</MenuItem>
            <MenuItem value="minmoves:desc">Min Moves (Descending)</MenuItem>
            <MenuItem value="months:asc">Months (Ascending)</MenuItem>
            <MenuItem value="months:desc">Months (Descending)</MenuItem>
            <MenuItem value="precision:asc">Precision (Ascending)</MenuItem>
            <MenuItem value="precision:desc">Precision (Descending)</MenuItem>
          </Select>
        </FormControl>
      </Grid>
    </Grid>
  );
};

export default FilterComponent;
