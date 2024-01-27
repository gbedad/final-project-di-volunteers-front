import React, { useEffect, useState } from 'react';
// import { makeStyles } from '@mui/styles';
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
    // You should implement your download logic here
    // This is just a placeholder
    try {
      // Fetch the file content from S3
      const response = await fetch(s3FilePath, { mode: 'cors' });

      if (!response.ok) {
        throw new Error(
          `Failed to fetch file (${response.status}: ${response.statusText})`
        );
      }

      // Convert the response to a Blob
      const blob = await response.blob();
      console.log(blob);

      // Use FileSaver.js to save the Blob as a file
      saveAs(blob, 'downloaded_file');
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
            Download
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default FileDisplay;
