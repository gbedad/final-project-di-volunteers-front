import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import {
  Box,
  Button,
  Chip,
  Menu,
  MenuItem,
  Stack,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

import SaveStatus from './application/SaveStatus';

const BASE_URL = process.env.REACT_APP_BASE_URL;

const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString('fr-FR') : null;

// Academic years the volunteer belonged to. Filled in automatically at
// validation and every 1 September for active volunteers; the admin can
// add or remove a year by hand (saved immediately).
const CohortTransferList = ({ userId }) => {
  const [data, setData] = useState(null);
  const [saveState, setSaveState] = useState('idle');
  const [anchor, setAnchor] = useState(null);

  const load = useCallback(async () => {
    try {
      const { data } = await axios.get(
        `${BASE_URL}/admin/users/${userId}/cohorts`
      );
      setData(data);
    } catch (err) {
      console.error(err);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) load();
  }, [userId, load]);

  const save = async (years) => {
    setSaveState('saving');
    try {
      const { data: saved } = await axios.put(
        `${BASE_URL}/admin/users/${userId}/cohorts`,
        { years }
      );
      setData((prev) => ({ ...prev, years: saved.years }));
      setSaveState('saved');
    } catch (err) {
      console.error(err);
      setSaveState('error');
    }
  };

  if (!data) return null;

  const latest = data.years[data.years.length - 1];
  const addable = data.available.filter((y) => !data.years.includes(y));

  return (
    <Box sx={{ width: '100%' }}>
      {data.years.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          Aucune cohorte. Elle est ajoutée automatiquement quand le bénévole est
          validé.
        </Typography>
      ) : (
        <Stack direction="row" flexWrap="wrap" gap={1}>
          {data.years.map((year) => (
            <Chip
              key={year}
              label={year}
              color={year === latest ? 'primary' : 'default'}
              variant={year === latest ? 'filled' : 'outlined'}
              onDelete={() => save(data.years.filter((y) => y !== year))}
            />
          ))}
        </Stack>
      )}

      {data.validated_at && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Validé le {formatDate(data.validated_at)}
        </Typography>
      )}

      <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 1 }}>
        <Button
          size="small"
          startIcon={<AddIcon />}
          disabled={addable.length === 0}
          onClick={(e) => setAnchor(e.currentTarget)}>
          Ajouter une année
        </Button>
        <SaveStatus state={saveState} />
      </Stack>
      <Menu anchorEl={anchor} open={!!anchor} onClose={() => setAnchor(null)}>
        {addable.map((year) => (
          <MenuItem
            key={year}
            onClick={() => {
              setAnchor(null);
              save([...data.years, year]);
            }}>
            {year}
            {year === data.current ? ' (année en cours)' : ''}
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
};

export default CohortTransferList;
