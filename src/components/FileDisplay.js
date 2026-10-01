import React, { useEffect, useState } from 'react';
// import { makeStyles } from '@mui/styles';

import {
  Typography,
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  CircularProgress,
} from '@mui/material';
import { Document, Page, pdfjs } from 'react-pdf';
// import AWS from 'aws-sdk';
import { saveAs } from 'file-saver';
import { getFileUrl, fileNameOf } from '../js/fileUrl';

// Provide the path to the PDF.js worker file
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

// const useStyles = makeStyles((theme) => ({
//   root: {
//     display: 'flex',
//     alignItems: 'center',
//     justifyContent: 'center',
//     height: '100%',
//     width: '100%',
//     border: `1px solid ${theme.palette.divider}`,
//     borderRadius: theme.shape.borderRadius,
//     backgroundColor: theme.palette.background.default,
//   },
//   pdfContainer: {
//     width: '100%',
//     height: '100%',
//   },
//   icon: {
//     fontSize: '80px',
//     color: theme.palette.text.secondary,
//   },
// }));

const FileDisplay = ({ s3FilePath, open, handleClose }) => {
  const [url, setUrl] = useState(null);
  const [error, setError] = useState(false);
  const path = s3FilePath ? s3FilePath.toString() : '';
  const fileExtension = path.split('.').pop().toLowerCase();

  useEffect(() => {
    if (!open || !path) return;
    setUrl(null);
    setError(false);
    getFileUrl(path)
      .then(setUrl)
      .catch(() => setError(true));
  }, [open, path]);

  const renderFileContent = () => {
    if (error) {
      return <Typography>Impossible d'ouvrir ce fichier.</Typography>;
    }
    if (!url) {
      return <CircularProgress />;
    }
    if (['jpeg', 'jpg', 'png'].includes(fileExtension)) {
      return (
        <Box
          component="div"
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            width: '100%',
            border: `1px solid `,
          }}>
          <img src={url} alt="File" style={{ maxWidth: '100%' }} />
        </Box>
      );
    } else if (fileExtension === 'pdf') {
      return (
        <div>
          <Document file={url}>
            <Page pageNumber={1} />
          </Document>
        </div>
      );
    }
    return <Typography>Unsupported File Type</Typography>;
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(url, { mode: 'cors' });
      if (!response.ok) {
        throw new Error(
          `Failed to fetch file (${response.status}: ${response.statusText})`
        );
      }
      saveAs(await response.blob(), fileNameOf(path));
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>{fileNameOf(path)}</DialogTitle>
      <DialogContent>
        {renderFileContent()}
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
          <Button variant="contained" onClick={handleDownload} disabled={!url}>
            Télécharger le fichier
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default FileDisplay;
