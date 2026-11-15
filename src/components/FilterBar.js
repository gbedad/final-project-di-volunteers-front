import React from 'react';
import { Box, Button, Collapse, Paper, Stack } from '@mui/material';
import TuneIcon from '@mui/icons-material/Tune';
import SearchField from './SearchField';
import { useSessionState } from '../js/useSessionState';

// The search line of the admin lists, the same on every page, just above
// the table: the search first, then the page's main filters (children),
// "Plus de critères" when the page has more of them (folded below, with
// how many are in use), "Réinitialiser", and on the right what acts on the
// list (export, count)
const FilterBar = ({
  search,
  children,
  criteria,
  criteriaTitle,
  criteriaCount = 0,
  criteriaKey,
  onReset,
  canReset,
  end,
  sx,
}) => {
  const [open, setOpen] = useSessionState(
    criteriaKey || 'filterbar.criteria',
    false
  );
  return (
    <Box sx={{ mb: 1.5, ...sx }}>
      <Stack direction="row" flexWrap="wrap" gap={1.5} alignItems="center">
        <SearchField {...search} />
        {children}
        {criteria && (
          <Button
            variant={open ? 'contained' : 'outlined'}
            disableElevation
            startIcon={<TuneIcon />}
            onClick={() => setOpen(!open)}
            aria-expanded={open}>
            Plus de critères{criteriaCount ? ` (${criteriaCount})` : ''}
          </Button>
        )}
        {onReset && (
          <Button onClick={onReset} disabled={!canReset}>
            Réinitialiser
          </Button>
        )}
        {end && (
          <Stack
            direction="row"
            gap={1}
            alignItems="center"
            flexWrap="wrap"
            sx={{ ml: { sm: 'auto' } }}>
            {end}
          </Stack>
        )}
      </Stack>
      {criteria && (
        <Collapse in={open}>
          <Paper variant="outlined" sx={{ p: 2, mt: 1.5 }}>
            {criteriaTitle && <Box sx={{ mb: 1.5 }}>{criteriaTitle}</Box>}
            {criteria}
          </Paper>
        </Collapse>
      )}
    </Box>
  );
};

export default FilterBar;
