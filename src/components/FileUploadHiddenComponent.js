import React from 'react';
import { Button, Box, Stack, Input, Typography } from '@mui/material';

function PlainButton() {
  return (
    <Stack spacing={3}>
      <Box>
        <Typography sx={{ marginTop: 1, marginLeft: 1 }}>
          Upload Button
        </Typography>
        <label htmlFor="contained-button-file">
          <Input
            accept="image/*"
            id="contained-button-file"
            multiple
            type="file"
          />
          <Button variant="contained" component="span">
            Upload
          </Button>
        </label>
      </Box>
    </Stack>
  );
}

export default PlainButton;
