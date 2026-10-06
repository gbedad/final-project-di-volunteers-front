import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { saveAs } from 'file-saver';
import toast, { Toaster } from 'react-hot-toast';
import {
  Box,
  Button,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Link,
  Switch,
  Tab,
  Tabs,
  ToggleButton,
  ToggleButtonGroup,
  Stack,
  Typography,
} from '@mui/material';
import { DataGrid, GridActionsCellItem, GridToolbar } from '@mui/x-data-grid';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

import FileDisplay from '../FileDisplay';
import { getFileUrl, fileNameOf } from '../../js/fileUrl';
import { isManager } from '../../js/roles';
import PageHeader from './PageHeader';
import ConventionTemplateCard from './ConventionTemplateCard';

const BASE_URL = process.env.REACT_APP_BASE_URL;

const gridToolbar = {
  slots: { toolbar: GridToolbar },
  slotProps: {
    toolbar: { showQuickFilter: true, csvOptions: { delimiter: ';' } },
  },
};

const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString('fr-FR') : '—';

const CONVENTION_LABELS = {
  complete: 'complète',
  to_countersign: 'à contresigner',
  to_sign: 'à signer',
};

const Received = ({ value }) =>
  value ? (
    <CheckCircleIcon color="success" fontSize="small" />
  ) : (
    <CancelIcon color="error" fontSize="small" />
  );

const AdminFiles = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const userLogged = location.state?.userLogged;
  // Interviewers can view documents but not delete them
  const canDelete = isManager(
    userLogged?.user?.role ||
      JSON.parse(localStorage.getItem('user') || '{}').user?.role
  );

  const [tab, setTab] = useState(0);
  const [files, setFiles] = useState([]);
  const [missing, setMissing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('all');
  const [hideDeclined, setHideDeclined] = useState(true);
  const [onlyToCountersign, setOnlyToCountersign] = useState(false);
  const [previewPath, setPreviewPath] = useState(null);
  const [fileToDelete, setFileToDelete] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [filesRes, missingRes] = await Promise.all([
        axios.get(`${BASE_URL}/admin/files`),
        axios.get(`${BASE_URL}/admin/missing-documents`),
      ]);
      setFiles(filesRes.data);
      setMissing(missingRes.data);
    } catch (err) {
      console.error(err);
      toast.error('Impossible de charger les documents', {
        position: 'top-center',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const openProfile = (userId) =>
    navigate('/change-status', { state: { userId, userLogged } });

  const handleDownload = async (path) => {
    try {
      const response = await fetch(await getFileUrl(path), { mode: 'cors' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      saveAs(await response.blob(), fileNameOf(path));
    } catch (err) {
      console.error(err);
      toast.error('Téléchargement impossible', { position: 'top-center' });
    }
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`${BASE_URL}/admin/files/${fileToDelete.id}`);
      setFiles((prev) => prev.filter((f) => f.id !== fileToDelete.id));
      toast.success('Document supprimé', { position: 'top-center' });
    } catch (err) {
      console.error(err);
      toast.error('Suppression impossible', { position: 'top-center' });
    } finally {
      setFileToDelete(null);
    }
  };

  const volunteerCell = (user) =>
    user ? (
      <Link component="button" onClick={() => openProfile(user.id)}>
        {`${user.first_name} ${user.last_name}`}
      </Link>
    ) : (
      '—'
    );

  const fileColumns = [
    {
      field: 'volunteer',
      headerName: 'Bénévole',
      flex: 1,
      minWidth: 160,
      valueGetter: ({ row }) =>
        row.user ? `${row.user.first_name} ${row.user.last_name}` : '',
      renderCell: ({ row }) => volunteerCell(row.user),
    },
    {
      field: 'email',
      headerName: 'Email',
      flex: 1,
      minWidth: 180,
      valueGetter: ({ row }) => row.user?.email || '',
    },
    { field: 'filename', headerName: 'Document', flex: 1.2, minWidth: 180 },
    { field: 'type', headerName: 'Type', width: 120 },
    {
      field: 'uploaded_at',
      headerName: 'Déposé le',
      width: 120,
      type: 'date',
      valueGetter: ({ value }) => (value ? new Date(value) : null),
      valueFormatter: ({ value }) => formatDate(value),
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 130,
      getActions: ({ row }) => [
        <GridActionsCellItem
          key="view"
          icon={<VisibilityIcon />}
          label="Voir"
          onClick={() => setPreviewPath(row.path)}
        />,
        <GridActionsCellItem
          key="download"
          icon={<DownloadIcon />}
          label="Télécharger"
          onClick={() => handleDownload(row.path)}
        />,
        ...(canDelete
          ? [
              <GridActionsCellItem
                key="delete"
                icon={<DeleteIcon color="error" />}
                label="Supprimer"
                onClick={() => setFileToDelete(row)}
              />,
            ]
          : []),
      ],
    },
  ];

  const missingColumns = [
    {
      field: 'name',
      headerName: 'Bénévole',
      flex: 1,
      minWidth: 160,
      valueGetter: ({ row }) => `${row.first_name} ${row.last_name}`,
      renderCell: ({ row }) => volunteerCell(row),
    },
    { field: 'email', headerName: 'Email', flex: 1, minWidth: 180 },
    { field: 'phone', headerName: 'Téléphone', width: 130 },
    { field: 'status', headerName: 'Statut', width: 130 },
    ...[
      ['cv_received', 'CV'],
      ['id_received', "Pièce d'identité"],
      ['b3_received', 'B3'],
    ].map(([field, headerName]) => ({
      field,
      headerName,
      width: 120,
      type: 'boolean',
      renderCell: ({ value }) => <Received value={value} />,
    })),
    {
      field: 'convention_state',
      headerName: 'Convention',
      width: 150,
      valueGetter: ({ value }) => CONVENTION_LABELS[value] || '',
      renderCell: ({ row }) =>
        row.convention_state === 'complete' ? (
          <Received value />
        ) : row.convention_state === 'to_countersign' ? (
          <Chip size="small" color="warning" label="à contresigner" />
        ) : (
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <Received value={false} />
            <Typography variant="caption" color="text.secondary">
              à signer
            </Typography>
          </Stack>
        ),
    },
    {
      field: 'honorability_received',
      headerName: 'Attestation d’honorabilité',
      width: 190,
      // Asked only once the convention is signed (null before)
      valueGetter: ({ row }) =>
        row.honorability_received === null
          ? 'non demandée'
          : row.honorability_received
          ? 'reçue'
          : row.honorability_late
          ? 'en retard'
          : 'à fournir',
      renderCell: ({ row }) =>
        row.honorability_received === null ? (
          <Typography variant="body2" color="text.disabled">
            —
          </Typography>
        ) : row.honorability_received ? (
          <Received value />
        ) : (
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <Received value={false} />
            {row.honorability_due && (
              <Typography
                variant="caption"
                color={row.honorability_late ? 'error' : 'text.secondary'}
                sx={{ fontWeight: row.honorability_late ? 600 : 400 }}>
                {row.honorability_late ? 'en retard, ' : ''}avant le{' '}
                {new Date(row.honorability_due).toLocaleDateString('fr-FR')}
              </Typography>
            )}
          </Stack>
        ),
    },
    {
      field: 'files_uploaded',
      headerName: 'Fichiers déposés',
      type: 'number',
      width: 130,
    },
  ];

  const visibleFiles = useMemo(
    () =>
      typeFilter === 'all'
        ? files
        : files.filter((f) =>
            typeFilter === 'convention'
              ? ['convention', 'convention_final'].includes(f.doc_type)
              : (f.doc_type || 'other') === typeFilter
          ),
    [files, typeFilter]
  );

  const toCountersign = missing.filter(
    (u) => u.convention_state === 'to_countersign'
  ).length;
  const visibleMissing = useMemo(
    () =>
      missing
        .filter((u) => !hideDeclined || u.status !== 'Déclinée')
        .filter(
          (u) => !onlyToCountersign || u.convention_state === 'to_countersign'
        ),
    [missing, hideDeclined, onlyToCountersign]
  );

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <PageHeader title="Documents des bénévoles" />
      <ConventionTemplateCard canReplace={canDelete} />

      <Tabs value={tab} onChange={(e, value) => setTab(value)} sx={{ mb: 2 }}>
        <Tab label={`Tous les documents (${files.length})`} />
        <Tab label={`Documents manquants (${visibleMissing.length})`} />
      </Tabs>

      {tab === 0 && (
        <>
          <ToggleButtonGroup
            size="small"
            exclusive
            value={typeFilter}
            onChange={(e, value) => value && setTypeFilter(value)}
            sx={{ mb: 2, flexWrap: 'wrap' }}>
            <ToggleButton value="all">Tous</ToggleButton>
            <ToggleButton value="cv">CV</ToggleButton>
            <ToggleButton value="id">Pièce d'identité</ToggleButton>
            <ToggleButton value="b3">Casier judiciaire</ToggleButton>
            <ToggleButton value="honorability">
              Attestation d'honorabilité
            </ToggleButton>
            <ToggleButton value="convention">Conventions</ToggleButton>
            <ToggleButton value="other">Autres</ToggleButton>
          </ToggleButtonGroup>
          <Box sx={{ height: 600, width: '100%' }}>
            <DataGrid
              rows={visibleFiles}
              columns={fileColumns}
              loading={loading}
              disableRowSelectionOnClick
              initialState={{
                sorting: {
                  sortModel: [{ field: 'uploaded_at', sort: 'desc' }],
                },
              }}
              {...gridToolbar}
            />
          </Box>
        </>
      )}

      {tab === 1 && (
        <>
          <FormControlLabel
            sx={{ mb: 1 }}
            control={
              <Switch
                checked={hideDeclined}
                onChange={(e) => setHideDeclined(e.target.checked)}
              />
            }
            label="Masquer les candidatures déclinées"
          />
          <FormControlLabel
            sx={{ mb: 1, ml: 2 }}
            control={
              <Switch
                checked={onlyToCountersign}
                onChange={(e) => setOnlyToCountersign(e.target.checked)}
              />
            }
            label={`Seulement les conventions à contresigner (${toCountersign})`}
          />
          <Box sx={{ height: 600, width: '100%' }}>
            <DataGrid
              rows={visibleMissing}
              columns={missingColumns}
              loading={loading}
              disableRowSelectionOnClick
              {...gridToolbar}
            />
          </Box>
        </>
      )}

      {previewPath && (
        <FileDisplay
          s3FilePath={previewPath}
          open={!!previewPath}
          handleClose={() => setPreviewPath(null)}
        />
      )}

      <Dialog open={!!fileToDelete} onClose={() => setFileToDelete(null)}>
        <DialogTitle>Supprimer ce document ?</DialogTitle>
        <DialogContent>
          <Typography>
            {fileToDelete?.filename}
            {fileToDelete?.user &&
              ` (${fileToDelete.user.first_name} ${fileToDelete.user.last_name})`}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Le fichier sera définitivement supprimé.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFileToDelete(null)}>Annuler</Button>
          <Button color="error" variant="contained" onClick={confirmDelete}>
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>

      <Toaster />
    </Container>
  );
};

export default AdminFiles;
