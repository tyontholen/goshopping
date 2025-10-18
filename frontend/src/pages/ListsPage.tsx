import React, { useEffect, useState } from "react";
import api from "../api/api";
import { List as ListType } from "../types";
import {
  Container,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Alert,
} from "@mui/material";
import { Link } from "react-router-dom";

const ListsPage: React.FC = () => {
  const [lists, setLists] = useState<ListType[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string }>({
    open: false,
    message: "",
  });

  //  Fetch lists
  const fetchLists = async () => {
    try {
      const res = await api.get("/lists");
      setLists(res.data.lists || []);
    } catch (err) {
      console.error("Error fetching lists:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLists();
    const interval = setInterval(fetchLists, 3000);
    return () => clearInterval(interval);
  }, []);

  //  Create new list
  const handleCreateList = async () => {
    if (!newListName.trim()) return;

    try {
      const res = await api.post("/list", { name: newListName });
      console.log("Created:", res.data);
      setSnackbar({ open: true, message: "List created successfully!" });
      setNewListName("");
      setOpen(false);
      fetchLists();
    } catch (err: any) {
      console.error("Error creating list:", err);
      setSnackbar({
        open: true,
        message: "Failed to create list. It might already exist.",
      });
    }
  };

  if (loading) return <CircularProgress />;

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        🛒 Available Lists
      </Typography>

      <Button
        variant="contained"
        color="primary"
        onClick={() => setOpen(true)}
        sx={{ mb: 2 }}
      >
        Create New List
      </Button>

      <List>
        {lists.length === 0 ? (
          <Typography>No lists found.</Typography>
        ) : (
          lists.map((list) => (
            <ListItem key={list.id} divider disablePadding>
              <ListItemButton component={Link} to={`/lists/${list.id}`}>
                <ListItemText
                  primary={list.name}
                  secondary={`List ID: ${list.id}`}
                />
              </ListItemButton>
            </ListItem>
          ))
        )}
      </List>

      {/* Create List Modal */}
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Create New List</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="List Name"
            type="text"
            fullWidth
            variant="outlined"
            value={newListName}
            onChange={(e) => setNewListName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateList} variant="contained" color="primary">
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Feedback Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity="info" variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ListsPage;
