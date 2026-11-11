import React, { useEffect, useState } from 'react';
import { Alert, Button, IconButton, Stack } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddToHomeScreenIcon from '@mui/icons-material/AddToHomeScreen';

const DISMISSED = 'install-app-dismissed';
const standalone = () =>
  window.matchMedia?.('(display-mode: standalone)').matches ||
  window.navigator.standalone === true;
const isIos = () =>
  /iphone|ipad|ipod/i.test(window.navigator.userAgent) ||
  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
const dismissed = () => {
  try {
    return localStorage.getItem(DISMISSED) === '1';
  } catch {
    return false;
  }
};

// Tutors' page: install MyCogniverse on the phone's home screen (once
// installed, or once closed, the card is not shown again)
const InstallApp = () => {
  const [prompt, setPrompt] = useState(() => window.__installPrompt || null);
  const [hidden, setHidden] = useState(() => standalone() || dismissed());
  useEffect(() => {
    const ready = () => setPrompt(window.__installPrompt || null);
    const installed = () => setHidden(true);
    window.addEventListener('install-available', ready);
    window.addEventListener('appinstalled', installed);
    return () => {
      window.removeEventListener('install-available', ready);
      window.removeEventListener('appinstalled', installed);
    };
  }, []);
  const close = () => {
    try {
      localStorage.setItem(DISMISSED, '1');
    } catch {}
    setHidden(true);
  };
  const install = async () => {
    prompt.prompt();
    const { outcome } = await prompt.userChoice.catch(() => ({}));
    window.__installPrompt = null;
    setPrompt(null);
    if (outcome === 'accepted') setHidden(true);
  };
  // Nothing to offer: already installed, closed, or a browser without
  // install (computers, other browsers)
  if (hidden || (!prompt && !isIos())) return null;
  return (
    <Alert
      severity="info"
      icon={<AddToHomeScreenIcon />}
      action={
        <IconButton size="small" aria-label="Fermer" onClick={close}>
          <CloseIcon fontSize="small" />
        </IconButton>
      }>
      {prompt ? (
        <Stack spacing={1} alignItems="flex-start">
          <span>
            Installez MyCogniverse sur votre téléphone : une icône sur l'écran
            d'accueil pour émarger en un geste.
          </span>
          <Button size="small" variant="contained" onClick={install}>
            Installer l'application
          </Button>
        </Stack>
      ) : (
        <span>
          Pour avoir MyCogniverse sur l'écran d'accueil : touchez le bouton
          Partager de Safari, puis « Sur l'écran d'accueil ».
        </span>
      )}
    </Alert>
  );
};

export default InstallApp;
