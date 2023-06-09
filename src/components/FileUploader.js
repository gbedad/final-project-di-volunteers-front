import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import Button from '@mui/material/Button';
import DeleteIcon from '@mui/icons-material/Delete';
import SendIcon from '@mui/icons-material/Send';
import ImageIcon from '@mui/icons-material/Image';
import IconButton from '@mui/material/IconButton';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import Stack from '@mui/material/Stack';
import UploadIcon from '@mui/icons-material/Upload';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import { FixedSizeList } from 'react-window';
import Fade from '@mui/material/Fade';
import TextField from '@mui/material/TextField';
import Alert from '@mui/material/Alert';
import FileDisplay from './FileDisplay';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import Typography from '@mui/material/Typography';
import Fab from '@mui/material/Fab';
import AddIcon from '@mui/icons-material/Add';

import CircularProgress from '@mui/material/CircularProgress';

import InstructionComponent from './files/Instructions';

import './fileInputStyle.css';

const fabStyle = {
  position: 'absolute',
  bottom: -10,
  left: 300,
};

const BASE_URL = process.env.REACT_APP_BASE_URL;

export default function Uploads() {
  const location = useLocation();
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileUploaded, setFileUploaded] = useState(false);
  const [filesUploaded, setFilesUploaded] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [openAlert, setOpenAlert] = useState(false);
  const [changeFileList, setChangeFileList] = useState(false);
  const [showUploadButton, setShowUploadButton] = useState(false);

  // console.log(location.state.userLogged.user.id);
  const userId = location.state.userLogged.user.id;

  const Alert = React.forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
  });

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
        setFilesUploaded(response.data.file);
        setIsLoading(false);
        setShowUploadButton(false);
      } else {
        setIsLoading(false);
      }
    };
    setChangeFileList(false);
    getFiles();
  }, [changeFileList]);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
    setShowUploadButton(event.target.files[0] !== null);
  };

  const handleFileUpload = async () => {
    const formData = new FormData();
    formData.append('file', selectedFile);
    console.log(formData);
    try {
      const response = await axios.post(
        `${BASE_URL}/upload/${userId}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      // console.log(response.data);
      if (response.status === 200) {
        console.log('File uploaded successfully');
        setFileUploaded(true);
        setChangeFileList(true);
        setOpenAlert(true);
        setSelectedFile(null);
      } else {
        console.log('Error uploading file:', response.status);
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

  const handleAlertClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpenAlert(false);
  };

  const handleDeleteFile = async (fileId) => {
    try {
      const response = await axios.delete(`${BASE_URL}/files/cancel/${fileId}`);
      console.log(response.data); // Optional: Log the response if needed
      // Add any additional logic or state updates upon successful file deletion
      setChangeFileList(true);
    } catch (error) {
      console.error(error);
      // Handle any error cases, such as displaying an error message
    }
  };
  // console.log(filesUploaded);

  const fab = {
    color: 'primary',
    sx: fabStyle,
    icon: <AddIcon />,
    label: 'Add',
  };

  return (
    <>
      {/* <InstructionComponent /> */}
      <Box style={{ position: 'relative' }}>
        <Stack direction="row" spacing={2}>
          <input
            id="file-upload"
            type="file"
            defaultValue=""
            onChange={handleFileChange}
          />
          {showUploadButton && (
            // <Button
            //   onClick={handleFileUpload}
            //   component="label"
            //   startIcon={<AddCircleIcon />}>
            //   AJOUTER
            // </Button>
            <label>
              <Fab
                sx={fab.sx}
                aria-label={fab.label}
                color={fab.color}
                onClick={() => handleFileUpload()}
                component="button">
                {fab.icon}
              </Fab>
            </label>
          )}
        </Stack>
      </Box>
      {fileUploaded && (
        <Snackbar
          open={openAlert}
          autoHideDuration={3000}
          onClose={handleAlertClose}>
          <Alert
            onClose={handleAlertClose}
            severity="success"
            sx={{ width: '100%' }}>
            File Uploaded!
          </Alert>
        </Snackbar>
      )}
      <Box>
        <Paper>
          {isLoading ? (
            <Stack sx={{ color: 'grey.500' }} spacing={2} direction="row">
              <CircularProgress color="secondary" />
            </Stack>
          ) : (
            filesUploaded.map((f, i) => (
              <List
                key={i}
                sx={{
                  width: '100%',
                  maxWidth: 360,
                  bgcolor: 'background.paper',
                  position: 'relative',
                  overflow: 'auto',
                  maxHeight: 300,
                  display: 'inline-block',
                }}>
                <ListItem
                  secondaryAction={
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      onClick={() => handleDeleteFile(f.id)}>
                      <DeleteIcon sx={{ fontSize: 40 }} color="secondary" />
                    </IconButton>
                  }>
                  <ListItemButton
                    component="a"
                    onClick={() => handleOpen(f.path)}>
                    <ListItemAvatar>
                      <Avatar>{checkFileType(f.mimetype)}</Avatar>
                    </ListItemAvatar>
                    <ListItemText primary={f.filename} secondary={f.mimetype} />
                  </ListItemButton>
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
