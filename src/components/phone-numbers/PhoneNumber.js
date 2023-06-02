import { forwardRef } from 'react';
import TextField from '@mui/material/TextField';

const phoneInput = (props, ref) => {
  return (
    <TextField
      {...props}
      //   InputProps={{
      //     className: classes.input,
      //   }}
      inputRef={ref}
      fullWidth
      size="normal"
      label="Phone Number"
      variant="outlined"
      name="phone"
    />
  );
};
export default forwardRef(phoneInput);
