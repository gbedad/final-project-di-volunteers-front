import React from 'react';
// import { Document, Page } from 'react-pdf';
// import { Button, Container, Box, Paper, Typography } from '@mui/material';
// import CloudDownloadIcon from '@mui/icons-material/CloudDownload';

import InstructionCoventionComponent from './files/InstructionsConvention';

// import pdfFile from '../assets/presentationtuteurs.pdf';

const ConventionComponent = () => {
  // const [ setNumPages] = React.useState(null);
  // const [ setPageNumber] = React.useState(1);

  // const containerStyle = {
  //   width: '100%',
  //   heigth: '600px',
  // };

  // const pageStyle = {
  //   display: 'inline-block',
  //   width: '100%',
  //   marginRight: '20px',
  //   marginBottom: '20px',
  // };

  // const onDocumentLoadSuccess = ({ numPages }) => {
  //   setNumPages(numPages);
  // };
  // const handleNextPage = () => {
  //   setPageNumber((prevPageNumber) => prevPageNumber + 1);
  // };
  // const handleDownload = () => {
  //   const link = document.createElement('a');
  //   link.href = pdfFile;
  //   link.download = 'convention-reciproque.pdf';
  //   link.click();
  // };

  return (
    <>
      <InstructionCoventionComponent />
    </>
  );
};

export default ConventionComponent;
