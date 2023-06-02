import React from 'react';
import { Document, Page } from 'react-pdf';
import { Button, Container } from '@mui/material';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';

import pdfFile from '../assets/presentationtuteurs.pdf';

const ConventionComponent = () => {
  const [numPages, setNumPages] = React.useState(null);
  const [pageNumber, setPageNumber] = React.useState(1);

  const containerStyle = {
    width: '100%',
    heigth: '600px',
  };

  const pageStyle = {
    display: 'inline-block',
    width: '100%',
    marginRight: '20px',
    marginBottom: '20px',
  };

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };
  const handleNextPage = () => {
    setPageNumber((prevPageNumber) => prevPageNumber + 1);
  };
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = pdfFile;
    link.download = 'convention-reciproque.pdf';
    link.click();
  };

  return (
    <Container sx={{ height: '600px' }}>
      <center>
        <div style={containerStyle}>
          <h1>Bienvenue dans l'Association Séphora Berrebi</h1>
          <h3>
            Vous pouvez cliquer sur le lien ci-dessous pour télécharger la
            convention réciproque
          </h3>
          <Button
            variant="outlined"
            onClick={handleDownload}
            startIcon={<CloudDownloadIcon />}>
            Télécharger la convention
          </Button>

          {/* <Document file={pdfFile} onLoadSuccess={onDocumentLoadSuccess}>
            {Array.from(new Array(numPages), (el, index) => (
              <div key={`page_${index + 1}`} style={pageStyle}>
                <Page
                  pageNumber={index + 1}
                  width={800}
                  height={500} // Adjust the width as per your requirement
                />
              </div>
            ))}
          </Document> */}
        </div>
      </center>
    </Container>
  );
};

export default ConventionComponent;
