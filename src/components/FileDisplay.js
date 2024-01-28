import React, { useEffect, useState } from 'react';
// import { makeStyles } from '@mui/styles';
import axios from 'axios';
import {
  Paper,
  Typography,
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
} from '@mui/material';
import { Document, Page, pdfjs } from 'react-pdf';
import AWS from 'aws-sdk';
import { saveAs } from 'file-saver';

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
  const renderFileContent = () => {
    s3FilePath = s3FilePath.toString();
    const fileExtension = s3FilePath.split('.').pop();

    if (
      fileExtension === 'jpeg' ||
      fileExtension.toLowerCase() === 'jpg' ||
      fileExtension === 'png'
    ) {
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
          <img src={s3FilePath} alt="File" />;
        </Box>
      );
    } else if (fileExtension === 'pdf') {
      return (
        <div>
          <Document file={s3FilePath}>
            <Page pageNumber={1} />
          </Document>
        </div>
      );
    }
    // return <Typography>Unsupported File Type</Typography>;
    return <Typography>Unsupported File Type</Typography>;
  };
  const handleDownload = async () => {
    try {
      const { url } = await s3FilePath;
      // Fetch the file from the presigned URL
      const response = await fetch(url, { mode: 'cors' });

      if (!response.ok) {
        throw new Error(
          `Failed to fetch file (${response.status}: ${response.statusText})`
        );
      }

      const blob = await response.blob();
      const fileExtension = s3FilePath.split('.').pop().toLowerCase();

      if (fileExtension === 'pdf') {
        saveAs(blob, 'downloaded_file.pdf');
      } else if (['png', 'jpeg', 'jpg'].includes(fileExtension)) {
        // No need to convert to base64, use the blob directly
        saveAs(blob, `downloaded_file.${fileExtension}`);

        if (!response.ok) {
          throw new Error(
            `Failed to fetch file (${response.status}: ${response.statusText})`
          );
        }
      } else {
        // Unsupported file type
        console.error('Unsupported file type:', fileExtension);
      }

      // Use FileSaver.js to save the Blob as a file
    } catch (error) {
      console.error('Error downloading file:', error);
      // Handle error appropriately (e.g., show a message to the user)
    }
    console.log('Download button clicked for:', s3FilePath);
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>File Preview</DialogTitle>
      <DialogContent>
        {renderFileContent()}
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
          <Button variant="contained" onClick={handleDownload}>
            Télécharger le fichier
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default FileDisplay;
