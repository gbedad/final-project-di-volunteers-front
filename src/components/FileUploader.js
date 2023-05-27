import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import Button from '@mui/material/Button';
import DeleteIcon from '@mui/icons-material/Delete';
import SendIcon from '@mui/icons-material/Send';
import ImageIcon from '@mui/icons-material/Image';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import Stack from '@mui/material/Stack';
import UploadIcon from '@mui/icons-material/Upload';
import Paper from '@mui/material/Paper';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import { FixedSizeList } from 'react-window';
import Fade from '@mui/material/Fade';

import FileDisplay from './FileDisplay';

import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import InstructionComponent from './files/Instructions';

const BASE_URL = process.env.REACT_APP_BASE_URL;

export default function Uploads() {
  const location = useLocation();
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileUploaded, setFileUploaded] = useState(false);
  const [filesUploaded, setFilesUploaded] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [open, setOpen] = useState(false);
  // console.log(location.state.userLogged.user.id);
  const userId = location.state.userLogged.user.id;

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
      } else {
        setIsLoading(false);
      }
    };

    getFiles();
  }, []);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleFileUpload = async () => {
    const formData = new FormData();
    formData.append('file', selectedFile);
    try {
      const response = await axios.post(
        `${BASE_URL}/upload/${location.state.userLogged.id}`,
        formData
      );
      // console.log(response.data);
      setFileUploaded(true);
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
  // console.log(filesUploaded);
  return (
    <>
      <InstructionComponent />
      <Stack direction="row" spacing={2}>
        <Button
          onClick={handleFileUpload}
          variant="contained"
          component="label"
          startIcon={<UploadIcon />}>
          UPLOAD
          <input hidden type="file" onChange={handleFileChange} />
        </Button>
      </Stack>
      {fileUploaded && <p>File Uploaded!</p>}

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
              }}>
              <ListItem>
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
