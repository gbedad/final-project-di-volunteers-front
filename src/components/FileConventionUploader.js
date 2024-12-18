import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import Button from '@mui/material/Button';
import DeleteIcon from '@mui/icons-material/Delete';

import ImageIcon from '@mui/icons-material/Image';
import IconButton from '@mui/material/IconButton';
import LoadingButton from '@mui/lab/LoadingButton';
import SaveIcon from '@mui/icons-material/Save';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import Stack from '@mui/material/Stack';

import Paper from '@mui/material/Paper';

import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';

import FileDisplay from './FileDisplay';

import Typography from '@mui/material/Typography';

import { MuiFileInput } from 'mui-file-input';

import CircularProgress from '@mui/material/CircularProgress';

import { saveAs } from 'file-saver';

import './fileInputStyle.css';

// const fabStyle = {
//   position: 'absolute',
//   bottom: -10,
//   left: 300,
// };

const BASE_URL = process.env.REACT_APP_BASE_URL;

export default function Uploads({ userSelected, s3FilePath }) {
  const location = useLocation();
  const containerRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [setFileUploaded] = useState(false);
  const [filesUploaded, setFilesUploaded] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const [changeFileList, setChangeFileList] = useState(false);
  const [showUploadButton, setShowUploadButton] = useState(false);
  const [conventionReceived, setConventionReceived] = useState(false);
  const [isColumnDirection, setIsColumnDirection] = useState(false);

  // Define component width for Stack direction
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current.clientWidth < 400) {
        setIsColumnDirection(true);
      } else {
        setIsColumnDirection(false);
      }
    };

    handleResize(); // Initial check
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // console.log(location.state.userLogged.user.id);
  // const userId = location.state.userLogged.user.id;
  const userId =
    location.state.userLogged.user.id === userSelected
      ? location.state.userLogged.user.id
      : userSelected;
  // console.log('USERID', userId);

  const checkFileType = (mime) => {
    switch (mime) {
      case 'image/png':
        return <ImageIcon />;

      case 'application/pdf':
        return <PictureAsPdfIcon />;
      case 'image/jpeg':
        return <ImageIcon />;
      default:
        return <ImageIcon />;
    }
  };

  useEffect(() => {
    const getFiles = async () => {
      const response = await axios.get(`${BASE_URL}/user-by-id/${userId}`);

      if (response.data.file) {
        const filteredFiles = response.data.file.filter((file) =>
          file.path.includes('/conventions/')
        );
        setFilesUploaded(filteredFiles);
        setIsLoading(false);
        setShowUploadButton(false);

        setConventionReceived(true);
      } else {
        setIsLoading(false);
      }
    };
    setChangeFileList(false);
    getFiles();
  }, [changeFileList, userId]);

  // const handleFileChange = (event) => {
  //   setSelectedFile(event.target.files[0]);
  //   setShowUploadButton(event.target.files[0] !== null);
  // };
  const handleChange = (newValue) => {
    setSelectedFile(newValue);
    setShowUploadButton(newValue.name !== null);
    // console.log(newValue);
  };

  const handleFileUpload = async () => {
    const formData = new FormData();
    formData.append('file', selectedFile);
    // console.log(formData);
    setLoading(true);
    try {
      const response = await axios.post(
        `${BASE_URL}/upload/convention/${userId}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      // console.log(response.data);
      if (response.status === 200) {
        // console.log('File uploaded successfully');
        toast.success('Le fichier a bien été téléchargé', {
          position: 'bottom-left',
        });
        setFileUploaded(true);
        setChangeFileList(true);
        setSelectedFile(null);
        setLoading(false);
        await fetch(`${BASE_URL}/update-files-received/${userId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: userId,

            conventionReceived,
          }),
        });
      } else {
        // console.log('Error uploading file:', response.status);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleOpen = (file) => {
    setSelectedFile(file);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleDeleteFile = async (fileId) => {
    try {
      const response = await axios.delete(`${BASE_URL}/files/cancel/${fileId}`);
      if (response.statusText === 'OK') {
        toast.success('Le fichier a bien été effacé', {
          position: 'bottom-left',
        });
        setChangeFileList(true);
      }
    } catch (error) {
      console.error(error);
      // Handle any error cases, such as displaying an error message
    }
  };
  // console.log(filesUploaded);

  const handleDownload = async () => {
    try {
      const { url } = await selectedFile;
      // Fetch the file from the presigned URL
      const response = await fetch(url, { mode: 'cors' });

      if (!response.ok) {
        throw new Error(
          `Failed to fetch file (${response.status}: ${response.statusText})`
        );
      }

      const blob = await response.blob();
      const fileExtension = selectedFile.split('.').pop().toLowerCase();

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
    // console.log('Download button clicked for:', s3FilePath);
  };

  return (
    <>
      {/* <InstructionComponent /> */}
      <Box style={{ position: 'relative' }} ref={containerRef}>
        <Typography variant="h6" component={'p'} m={2}>
          Pour télécharger la convention signée utiliser le bouton "Choisir un
          fichier" et ensuite sur "Enregistrer"
        </Typography>
        <Stack
          direction={isColumnDirection ? 'column' : 'row'}
          spacing={2}
          m={2}>
          <MuiFileInput
            id="file-upload"
            // type="file"
            label="Choisir un fichier"
            // defaultValue="Choisir un fichier"
            value={selectedFile}
            variant="outlined"
            color="primary"
            // onChange={handleFileChange}
            onChange={handleChange}
          />

          {showUploadButton && (
            // <Button
            //   onClick={() => handleFileUpload()}
            //   component="label"
            //   // startIcon={<AddCircleIcon />}
            //   variant="contained">
            //   AJOUTER
            // </Button>
            <LoadingButton
              color="primary"
              onClick={handleFileUpload}
              loading={loading}
              loadingPosition="start"
              startIcon={<SaveIcon />}
              variant="contained">
              <span>Enregistrer</span>
            </LoadingButton>
            // <label>
            //   <Fab
            //     sx={fab.sx}
            //     aria-label={fab.label}
            //     // color="primary.main"
            //     onClick={() => handleFileUpload()}
            //     component="button">
            //     {fab.icon}
            //   </Fab>
            // </label>
          )}
        </Stack>
      </Box>

      <Toaster />

      <Box>
        <Paper>
          {isLoading ? (
            <Stack sx={{ color: 'grey.500' }} spacing={2} direction="row">
              <CircularProgress color="secondary" />
            </Stack>
          ) : (
            filesUploaded.map((f, i) => (
              <List
                dense
                key={i}
                sx={{
                  width: '100%',
                  maxWidth: 760,
                  bgcolor: 'background.paper',
                  position: 'relative',
                  overflow: 'auto',
                  maxHeight: 300,
                  // display: 'inline-block',
                }}>
                <ListItem
                  secondaryAction={
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      onClick={() => handleDeleteFile(f.id)}>
                      <DeleteIcon sx={{ fontSize: 30 }} color="trash" />
                    </IconButton>
                  }>
                  <ListItemButton
                    component="a"
                    onClick={() => handleOpen(f.path)}>
                    <ListItemAvatar>
                      <Avatar>{checkFileType(f.mimetype)}</Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      dense
                      primary={f.filename}
                      secondary={f.mimetype}
                    />
                  </ListItemButton>
                  <Button
                    variant="outlined"
                    color="secondary"
                    size="small"
                    onClick={handleDownload}>
                    Télécharger
                  </Button>
                </ListItem>
              </List>
            ))
          )}
        </Paper>
      </Box>
      {selectedFile && (
        <FileDisplay
          s3FilePath={selectedFile}
          open={open}
          handleClose={handleClose}
        />
      )}
    </>
  );
}
