import React, { useEffect, useState } from 'react';
// import { makeStyles } from '@mui/styles';
import {
  Paper,
  Typography,
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
} from '@mui/material';
import { Document, Page, pdfjs } from 'react-pdf';
import AWS from 'aws-sdk';

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

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>File Preview</DialogTitle>
      <DialogContent>{renderFileContent()}</DialogContent>
    </Dialog>
  );
};

export default FileDisplay;
