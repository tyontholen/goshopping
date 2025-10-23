import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/api";
import {
  Box,
  Container,
  Typography,
  List,
  ListItem,
  ListItemText,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";

interface Item {
  id: string;
  name: string;
  section?: string;
  quantity?: number;
  bought: boolean;
}

// todo: style up with container, touchup sections, positioning of buttons
// todo: refactor parts of code to components

const ListDetailsPage: React.FC = () => {
  const SECTIONS = [
    "Dairy",
    "Meat",
    "Vegetables 🥕",
    "Bakery",
    "Drinks",
    "Other",
  ];
  const DEFAULT_SECTION = "Other";
  const { id } = useParams<{ id: string }>();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [newItem, setNewItem] = useState({
    name: "",
    quantity: 1,
    section: DEFAULT_SECTION,
  });
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string }>({
    open: false,
    message: "",
  });
  const [editOpen, setEditOpen] = useState(false);
  const [editItem, setEditItem] = useState<Item | null>(null);
  const [listName, setListName] = useState<string>("");

  const fetchItems = async () => {
    try {
      const res = await api.get(`/lists/${id}/items`);
      setItems(res.data.items || []);
    } catch (err) {
      console.error("Error fetching items:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [id]);

  useEffect(() => {
  const fetchListData = async () => {
    try {
      const [listRes, itemsRes] = await Promise.all([
        api.get(`/lists/${id}`),
        api.get(`/lists/${id}/items`)
      ]);
      setListName(listRes.data.name);
      setItems(itemsRes.data.items || []);
    } catch (err) {
      console.error("Error fetching list details:", err);
    } finally {
      setLoading(false);
    }
  };

  fetchListData();
}, [id]);

  const handleAddItem = async () => {
    if (!newItem.name.trim()) return;
    try {
      await api.post(`/lists/${id}/items`, newItem);
      setSnackbar({ open: true, message: "Item added!" });
      setNewItem({ name: "", quantity: 1, section: "Other" });
      setOpen(false);
      fetchItems();
    } catch (err) {
      console.error("Error adding item:", err);
      setSnackbar({ open: true, message: "Failed to add item." });
    }
  };

  const handleToggleBought = async (itemId: string) => {
    try {
      await api.patch(`/lists/${id}/items/${itemId}/toggle`);
      fetchItems();
    } catch (err) {
      console.error("Error toggling item:", err);
    }
  };

  const handleDelete = async (itemId: string) => {
    try {
      await api.delete(`/lists/${id}/items/${itemId}`);
      setSnackbar({ open: true, message: "Item deleted!" });
      fetchItems();
    } catch (err) {
      console.error("Error deleting item:", err);
    }
  };

  const handleClearBought = async () => {
    try {
      // Filter out bought items on backend
      const boughtItems = items.filter((item) => item.bought);
      if (boughtItems.length === 0) {
        setSnackbar({ open: true, message: "No bought items to remove!" });
        return;
      }

      // Delete each bought item
      await Promise.all(
        boughtItems.map((item) => api.delete(`/lists/${id}/items/${item.id}`))
      );

      setSnackbar({ open: true, message: "Bought items cleared!" });
      fetchItems();
    } catch (err) {
      console.error("Error clearing bought items:", err);
      setSnackbar({ open: true, message: "Failed to clear bought items." });
    }
  };

  if (loading) return <CircularProgress />;

  return (
    <Container
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        textAlign: "center",
      }}
    >
      <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
  {listName}
</Typography>
      <Box
        sx={{
          width: "100%",
          maxWidth: 600,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
          
        }}
      >
        <Button component={Link} to="/" variant="outlined" sx={{ mb: 2 }}>
           Back to all lists
        </Button>

        <Button
          variant="contained"
          onClick={() => setOpen(true)}
          sx={{ mb: 2 }}
        >
          + Add Item
        </Button>

        <Button
          variant="outlined"
          color="secondary"
          onClick={handleClearBought}
          sx={{ ml: 2, mb: 2 }}
        >
          Delete bought items
        </Button>
      </Box>

      {items.length === 0 ? (
        <Typography>No items found. Add one!</Typography>
      ) : (
        <List
          sx={{
            width: "100%",
            maxWidth: 600,
          }}
        >
          {[...items]
            .sort((a, b) => (a.section || "").localeCompare(b.section || ""))
            .map((item) => (
              <ListItem
                key={item.id}
                divider
                secondaryAction={
                  <>
                    <IconButton
                      edge="end"
                      color="inherit"
                      onClick={() => {
                        setEditItem(item);
                        setEditOpen(true);
                      }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      edge="end"
                      color="success"
                      onClick={() => handleToggleBought(item.id)}
                    >
                      <CheckIcon />
                    </IconButton>
                    <IconButton
                      edge="end"
                      color="error"
                      onClick={() => handleDelete(item.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </>
                }
              >
                <ListItemText
                  primary={`${item.name} (${item.quantity})`}
                  secondary={`${item.section || DEFAULT_SECTION} — ${
                    item.bought ? "✅ Bought" : "🛒 Not bought"
                  }`}
                />
              </ListItem>
            ))}
        </List>
      )}

      {/* Add item dialog */}
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Add Item</DialogTitle>
        <DialogContent>
          <TextField
            label="Item name"
            fullWidth
            margin="dense"
            value={newItem.name}
            onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
          />
          <TextField
            label="Quantity"
            type="number"
            fullWidth
            margin="dense"
            value={newItem.quantity}
            onChange={(e) =>
              setNewItem({ ...newItem, quantity: Number(e.target.value) })
            }
          />
          <TextField
            select
            label="Section"
            fullWidth
            margin="dense"
            value={newItem.section}
            onChange={(e) =>
              setNewItem({ ...newItem, section: e.target.value })
            }
            SelectProps={{ native: true }}
          >
            {SECTIONS.map((section) => (
              <option key={section} value={section}>
                {section}
              </option>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleAddItem} variant="contained">
            Add
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit item dialog */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)}>
        <DialogTitle>Edit Item</DialogTitle>
        <DialogContent>
          <TextField
            label="Item name"
            fullWidth
            margin="dense"
            value={editItem?.name || ""}
            onChange={(e) =>
              setEditItem({ ...editItem!, name: e.target.value })
            }
          />
          <TextField
            label="Quantity"
            type="number"
            fullWidth
            margin="dense"
            value={editItem?.quantity || 1}
            onChange={(e) =>
              setEditItem({ ...editItem!, quantity: Number(e.target.value) })
            }
          />
          <TextField
            select
            label="Section"
            fullWidth
            margin="dense"
            value={editItem?.section || DEFAULT_SECTION}
            onChange={(e) =>
              setEditItem({ ...editItem!, section: e.target.value })
            }
            SelectProps={{ native: true }}
          >
            {SECTIONS.map((section) => (
              <option key={section} value={section}>
                {section}
              </option>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={async () => {
              if (!editItem) return;
              try {
                await api.put(`/lists/${id}/items/${editItem.id}`, editItem);
                setSnackbar({ open: true, message: "Item updated!" });
                setEditOpen(false);
                fetchItems();
              } catch (err) {
                console.error("Error updating item:", err);
                setSnackbar({ open: true, message: "Failed to update item." });
              }
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

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

export default ListDetailsPage;
