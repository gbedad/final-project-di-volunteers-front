import { useLayoutEffect, useRef, useState } from 'react';

// Height that makes an element (a grid) reach the bottom of the window
export const useFillHeight = (min = 400, bottomGap = 24) => {
  const ref = useRef(null);
  const [height, setHeight] = useState(600);
  useLayoutEffect(() => {
    const update = () => {
      if (!ref.current) return;
      const top = ref.current.getBoundingClientRect().top + window.scrollY;
      setHeight(Math.max(min, window.innerHeight - top - bottomGap));
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  });
  return [ref, height];
};
