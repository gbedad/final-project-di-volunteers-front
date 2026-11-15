import React, { useEffect, useRef } from 'react';
import { IconButton, InputAdornment, TextField } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';

// The search of the admin lists: same place (first field above the table),
// same look everywhere. "/" puts the cursor in it, Escape clears it.
const SearchField = ({
  value,
  onChange,
  label = 'Rechercher',
  placeholder,
  sx,
}) => {
  const input = useRef(null);
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== '/' || e.ctrlKey || e.metaKey || e.altKey) return;
      const t = e.target;
      if (
        t.isContentEditable ||
        ['INPUT', 'TEXTAREA', 'SELECT'].includes(t.tagName)
      )
        return;
      e.preventDefault();
      input.current?.focus();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  return (
    <TextField
      size="small"
      type="search"
      label={label}
      placeholder={placeholder}
      value={value}
      inputRef={input}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === 'Escape' && value) {
          e.stopPropagation();
          onChange('');
        }
      }}
      sx={{
        width: { xs: '100%', sm: 320 },
        // The browser's own clear button: ours is enough
        '& input::-webkit-search-cancel-button': { display: 'none' },
        ...sx,
      }}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon fontSize="small" />
          </InputAdornment>
        ),
        endAdornment: value ? (
          <InputAdornment position="end">
            <IconButton
              size="small"
              onClick={() => onChange('')}
              aria-label="Effacer">
              <ClearIcon fontSize="small" />
            </IconButton>
          </InputAdornment>
        ) : null,
      }}
    />
  );
};

export default SearchField;
