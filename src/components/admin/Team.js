import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import PersonAddIcon from "@mui/icons-material/PersonAdd";

import { ROLE_LABELS } from "../../js/roles";

const BASE_URL = process.env.REACT_APP_BASE_URL;

const currentUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user"))?.user || {};
  } catch {
    return {};
  }
};

// Roles the current user may give to a newly invited member
const invitableRoles = (myRole) =>
  myRole === "superadmin"
    ? ["interviewer", "admin", "superadmin"]
    : myRole === "admin"
      ? ["interviewer"]
      : [];

// Roles the current user may give, depending on the target's current role
const assignableRoles = (myRole, targetRole) => {
  if (myRole === "superadmin") return Object.keys(ROLE_LABELS);
  if (myRole === "admin" && ["volunteer", "interviewer"].includes(targetRole)) {
    return ["volunteer", "interviewer"];
  }
  return [];
};

const errorText = (err) =>
  err.response?.data?.error || "Une erreur est survenue";

const Team = () => {
  const me = currentUser();
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [found, setFound] = useState(null);
  const [searchError, setSearchError] = useState("");
  const [pending, setPending] = useState(null); // { user, role }
  const [invite, setInvite] = useState(null); // invitation form, unknown e-mail
  const [sending, setSending] = useState(false);

  const loadTeam = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${BASE_URL}/admin/team`);
      setTeam(data);
    } catch (err) {
      toast.error(errorText(err), { position: "top-center" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTeam();
  }, [loadTeam]);

  const search = async (e) => {
    e.preventDefault();
    setFound(null);
    setInvite(null);
    setSearchError("");
    try {
      const { data } = await axios.get(`${BASE_URL}/admin/users/lookup`, {
        params: { email },
      });
      setFound(data);
    } catch (err) {
      if (err.response?.status === 404) {
        // Nobody with this e-mail: offer to invite them
        setInvite({
          first_name: "",
          last_name: "",
          role: invitableRoles(me.role)[0],
        });
      } else {
        setSearchError(errorText(err));
      }
    }
  };

  const sendInvite = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      await axios.post(`${BASE_URL}/admin/team/invite`, {
        ...invite,
        email: email.trim(),
      });
      toast.success(`Invitation envoyée à ${email.trim()}`, {
        position: "top-center",
      });
      setInvite(null);
      setEmail("");
      loadTeam();
    } catch (err) {
      if (err.response?.status === 409 && err.response.data.user) {
        setInvite(null);
        setFound(err.response.data.user);
      } else {
        toast.error(errorText(err), { position: "top-center" });
        if (err.response?.status === 502) {
          setInvite(null);
          loadTeam();
        }
      }
    } finally {
      setSending(false);
    }
  };

  const resend = async (user) => {
    try {
      await axios.post(`${BASE_URL}/admin/team/${user.id}/resend-invite`);
      toast.success(`Invitation renvoyée à ${user.email}`, {
        position: "top-center",
      });
    } catch (err) {
      toast.error(errorText(err), { position: "top-center" });
    }
  };

  const confirmRoleChange = async () => {
    const { user, role } = pending;
    setPending(null);
    try {
      await axios.patch(`${BASE_URL}/admin/users/${user.id}/role`, { role });
      toast.success(
        `${user.first_name} ${user.last_name} est maintenant ${ROLE_LABELS[
          role
        ].toLowerCase()}`,
        { position: "top-center" },
      );
      setFound(null);
      setEmail("");
      loadTeam();
    } catch (err) {
      toast.error(errorText(err), { position: "top-center" });
    }
  };

  const roleSelect = (user) => {
    const options = assignableRoles(me.role, user.role);
    if (user.id === me.id || options.length === 0) {
      return ROLE_LABELS[user.role] || user.role;
    }
    return (
      <Select
        size="small"
        value={user.role}
        onChange={(e) => setPending({ user, role: e.target.value })}
        sx={{ minWidth: 150 }}
      >
        {options.map((role) => (
          <MenuItem key={role} value={role}>
            {ROLE_LABELS[role]}
          </MenuItem>
        ))}
      </Select>
    );
  };

  const columns = [
    {
      field: "name",
      headerName: "Nom",
      flex: 1,
      minWidth: 160,
      valueGetter: ({ row }) => `${row.first_name} ${row.last_name}`,
    },
    { field: "email", headerName: "Email", flex: 1, minWidth: 200 },
    {
      field: "role",
      headerName: "Rôle",
      width: 200,
      renderCell: ({ row }) => roleSelect(row),
    },
    {
      field: "pending",
      headerName: "État",
      width: 250,
      renderCell: ({ row }) =>
        row.pending ? (
          <Stack direction="row" spacing={1} alignItems="center">
            <Chip size="small" color="warning" label="Invitation envoyée" />
            {invitableRoles(me.role).includes(row.role) && (
              <Button size="small" onClick={() => resend(row)}>
                Renvoyer
              </Button>
            )}
          </Stack>
        ) : (
          <Chip size="small" color="success" label="Actif" />
        ),
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h5" gutterBottom>
        Équipe
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {me.role === "superadmin"
          ? "Vous pouvez attribuer tous les rôles."
          : "Vous pouvez nommer des interviewers parmi les personnes inscrites."}{" "}
        Si la personne n'a pas encore de compte, elle recevra une invitation par
        e-mail pour choisir son mot de passe.
      </Typography>

      <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
        <Typography variant="subtitle1" sx={{ mb: 1 }}>
          Ajouter un membre
        </Typography>
        <Stack
          component="form"
          onSubmit={search}
          direction={{ xs: "column", sm: "row" }}
          spacing={1}
        >
          <TextField
            size="small"
            label="E-mail de la personne"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sx={{ flex: 1 }}
          />
          <Button type="submit" variant="contained" disabled={!email.trim()}>
            Rechercher
          </Button>
        </Stack>
        {searchError && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            {searchError}
          </Alert>
        )}
        {found && (
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            alignItems={{ sm: "center" }}
            sx={{ mt: 2 }}
          >
            <Typography sx={{ flex: 1 }}>
              <b>
                {found.first_name} {found.last_name}
              </b>{" "}
              ({found.email}) : {ROLE_LABELS[found.role] || found.role}
            </Typography>
            {assignableRoles(me.role, found.role)
              .filter((role) => role !== found.role && role !== "volunteer")
              .map((role) => (
                <Button
                  key={role}
                  variant="outlined"
                  startIcon={<PersonAddIcon />}
                  onClick={() => setPending({ user: found, role })}
                >
                  Nommer {ROLE_LABELS[role].toLowerCase()}
                </Button>
              ))}
            {assignableRoles(me.role, found.role).length === 0 && (
              <Typography variant="body2" color="text.secondary">
                Vous ne pouvez pas modifier le rôle de cette personne.
              </Typography>
            )}
          </Stack>
        )}
        {invite && (
          <Box component="form" onSubmit={sendInvite} sx={{ mt: 2 }}>
            <Alert severity="info" sx={{ mb: 2 }}>
              Aucun compte avec cet e-mail. Invitez cette personne : elle
              recevra un lien pour choisir son mot de passe (valable 7 jours).
            </Alert>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
              <TextField
                size="small"
                required
                label="Prénom"
                value={invite.first_name}
                onChange={(e) =>
                  setInvite({ ...invite, first_name: e.target.value })
                }
              />
              <TextField
                size="small"
                required
                label="Nom"
                value={invite.last_name}
                onChange={(e) =>
                  setInvite({ ...invite, last_name: e.target.value })
                }
              />
              <Select
                size="small"
                value={invite.role}
                onChange={(e) => setInvite({ ...invite, role: e.target.value })}
                sx={{ minWidth: 150 }}
              >
                {invitableRoles(me.role).map((role) => (
                  <MenuItem key={role} value={role}>
                    {ROLE_LABELS[role]}
                  </MenuItem>
                ))}
              </Select>
              <Button
                type="submit"
                variant="contained"
                disabled={
                  sending ||
                  !invite.first_name.trim() ||
                  !invite.last_name.trim()
                }
              >
                Envoyer l'invitation
              </Button>
            </Stack>
          </Box>
        )}
      </Paper>

      <Box sx={{ height: 450, width: "100%" }}>
        <DataGrid
          rows={team}
          columns={columns}
          loading={loading}
          disableRowSelectionOnClick
          hideFooterSelectedRowCount
        />
      </Box>

      <Dialog open={!!pending} onClose={() => setPending(null)}>
        <DialogTitle>Confirmer le changement de rôle</DialogTitle>
        <DialogContent>
          {pending && (
            <Typography>
              {pending.user.first_name} {pending.user.last_name} :{" "}
              {ROLE_LABELS[pending.user.role]} →{" "}
              <b>{ROLE_LABELS[pending.role]}</b>
            </Typography>
          )}
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Le changement prend effet immédiatement.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPending(null)}>Annuler</Button>
          <Button variant="contained" onClick={confirmRoleChange}>
            Confirmer
          </Button>
        </DialogActions>
      </Dialog>

      <Toaster />
    </Container>
  );
};

export default Team;
