import React, { useEffect, useRef } from 'react';
import { Box, Button, Stack, Typography } from '@mui/material';

// Signature drawn with a finger or the mouse
const SignaturePad = ({ onChange }) => {
  const canvas = useRef(null);
  const drawing = useRef(false);
  const empty = useRef(true);

  useEffect(() => {
    const c = canvas.current;
    const ratio = window.devicePixelRatio || 1;
    c.width = c.offsetWidth * ratio;
    c.height = c.offsetHeight * ratio;
    const ctx = c.getContext('2d');
    ctx.scale(ratio, ratio);
    ctx.lineWidth = 2.2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#1a2a6c';
  }, []);

  const point = (e) => {
    const r = canvas.current.getBoundingClientRect();
    return [e.clientX - r.left, e.clientY - r.top];
  };
  const start = (e) => {
    e.preventDefault();
    canvas.current.setPointerCapture(e.pointerId);
    drawing.current = true;
    const ctx = canvas.current.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(...point(e));
  };
  const move = (e) => {
    if (!drawing.current) return;
    const ctx = canvas.current.getContext('2d');
    ctx.lineTo(...point(e));
    ctx.stroke();
    empty.current = false;
  };
  const end = () => {
    if (!drawing.current) return;
    drawing.current = false;
    onChange(empty.current ? null : canvas.current.toDataURL('image/png'));
  };
  const clear = () => {
    const c = canvas.current;
    c.getContext('2d').clearRect(0, 0, c.width, c.height);
    empty.current = true;
    onChange(null);
  };

  return (
    <Box>
      <Box
        component="canvas"
        ref={canvas}
        onPointerDown={start}
        onPointerMove={move}
        onPointerUp={end}
        onPointerLeave={end}
        sx={{
          width: '100%',
          height: 160,
          border: '1px dashed',
          borderColor: 'grey.500',
          borderRadius: 1,
          bgcolor: '#fff',
          touchAction: 'none',
          cursor: 'crosshair',
          display: 'block',
        }}
      />
      <Stack direction="row" justifyContent="space-between" sx={{ mt: 0.5 }}>
        <Typography variant="caption" color="text.secondary">
          Signez avec le doigt ou la souris
        </Typography>
        <Button size="small" onClick={clear}>
          Effacer
        </Button>
      </Stack>
    </Box>
  );
};

export default SignaturePad;
