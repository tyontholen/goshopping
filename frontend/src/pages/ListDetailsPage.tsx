import React, { useEffect, useState } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
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
import Slide from "@mui/material/Slide";
import { TransitionProps } from "@mui/material/transitions";



interface Item {
  id: string;
  name: string;
  section?: string;
  quantity?: number;
  bought: boolean;
}

const ListDetailsPage: React.FC = () => {
  const SECTIONS = [
    "Canned food 🥫",
    "Pasta & Rice 🍝🍚",
    "Hygiene 🧼",
    "Thai 🍜",
    "Taco 🌮",
    "Vegetables 🥕",
    "Cheese 🧀",
    "Meat 🍗",
    "Toppings 🌭",
    "Sauces 🍼",
    "Spices 🧂",
    "Bread 🍞",
    "Dairy 🥛",
    "Drinks 🥤",
    "Snacks 🍿",
    "Nuts 🥜",
    "Freezer ❄",
    "Other",
  ];
  const DEFAULT_SECTION = "Other";

  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const listNameFromState = (location.state as { name?: string })?.name;

  const [listName, setListName] = useState(listNameFromState || "Loading...");
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editItem, setEditItem] = useState<Item | null>(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmInput, setConfirmInput] = useState("");

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<Item | null>(null);

  const [newItem, setNewItem] = useState({
    name: "",
    quantity: 1,
    section: DEFAULT_SECTION,
  });

  const Transition = React.forwardRef(function Transition(
  props: TransitionProps & { children: React.ReactElement<any, any> },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const handleCloseEditDialog = () => {
  if (document.activeElement instanceof HTMLElement) {
    document.activeElement.blur(); // remove focus
  }
  setEditOpen(false);
};

  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string }>({
    open: false,
    message: "",
  });

  // ✅ Unified fetch for list name + items
  const fetchListData = async () => {
    try {
      const [listRes, itemsRes] = await Promise.all([
        api.get(`/lists/${id}`),
        api.get(`/lists/${id}/items`),
      ]);

      const listData = listRes.data.list || listRes.data;
      setListName(listData.name || "Unnamed List");
      setItems(itemsRes.data.items || []);
    } catch (err) {
      console.error("Error fetching list details:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListData();
  }, [id]);

  // ✅ Add item
  const handleAddItem = async () => {
    if (!newItem.name.trim()) return;
    try {
      const res = await api.post(`/lists/${id}/items`, newItem);
      setItems((prev) => [...prev, res.data.item || newItem]);
      setSnackbar({ open: true, message: "Item added!" });
      setNewItem({ name: "", quantity: 1, section: DEFAULT_SECTION });
      setOpen(false);
    } catch (err) {
      console.error("Error adding item:", err);
      setSnackbar({ open: true, message: "Failed to add item." });
    }
  };

  // ✅ Toggle bought
  const handleToggleBought = async (itemId: string) => {
    try {
      await api.patch(`/lists/${id}/items/${itemId}/toggle`);
      setItems((prev) =>
        prev.map((i) => (i.id === itemId ? { ...i, bought: !i.bought } : i))
      );
    } catch (err) {
      console.error("Error toggling item:", err);
    }
  };

  // ✅ Delete single item
  const handleDelete = async (itemId: string) => {
    try {
      await api.delete(`/lists/${id}/items/${itemId}`);
      setItems((prev) => prev.filter((i) => i.id !== itemId));
      setSnackbar({ open: true, message: "Item deleted!" });
    } catch (err) {
      console.error("Error deleting item:", err);
    }
  };

  // ✅ Clear all bought
  const handleClearBought = async () => {
    const boughtItems = items.filter((item) => item.bought);
    if (boughtItems.length === 0) {
      setSnackbar({ open: true, message: "No bought items to remove!" });
      return;
    }

    try {
      await Promise.all(
        boughtItems.map((item) => api.delete(`/lists/${id}/items/${item.id}`))
      );
      setItems((prev) => prev.filter((i) => !i.bought));
      setSnackbar({ open: true, message: "Bought items cleared!" });
    } catch (err) {
      console.error("Error clearing bought items:", err);
      setSnackbar({ open: true, message: "Failed to clear bought items." });
    }
  };

  if (loading) {
    return (
      <Container sx={{ textAlign: "center", mt: 10 }}>
        <CircularProgress />
      </Container>
    );
  }

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

      {/* Buttons */}
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
        <Button component={Link} to="/" variant="outlined">
          Back to all lists
        </Button>

        <Button variant="contained" onClick={() => setOpen(true)}>
          + Add Item
        </Button>

        <Button
          variant="outlined"
          color="secondary"
          onClick={() => {
            if (items.some((item) => item.bought)) {
              setConfirmOpen(true);
            } else {
              setSnackbar({
                open: true,
                message: "No bought items to remove!",
              });
            }
          }}
        >
          Delete bought items
        </Button>
      </Box>

      {/* ✅ Items list */}
      {items.length === 0 ? (
        <Typography>No items found. Add one!</Typography>
      ) : (
        <List sx={{ width: "100%", maxWidth: 600 }}>
          {[...items]
            .sort((a, b) => {
              // 1️⃣ Unbought items first
              if (a.bought !== b.bought) return a.bought ? 1 : -1;

              // 2️⃣ Within the same bought state, sort by section
              return (a.section || "").localeCompare(b.section || "");
            })
            .map((item) => (
              <ListItem
                key={item.id}
                divider
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  bgcolor: "background.paper", // uses your #121212
                  borderRadius: 2,
                  mb: 1,
                  px: 2,
                  "&:hover": {
                    bgcolor: "#1a1a1a",
                  },
                }}
              >
                {/* Left side: checkmark and text */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <CheckIcon
                    onClick={() => handleToggleBought(item.id)}
                    sx={{
                      cursor: "pointer",
                      color: item.bought ? "#1bd760" : "#535353", // Spotify green or medium gray
                      transition: "color 0.2s ease",
                      "&:hover": {
                        color: item.bought ? "#1ed760" : "#b3b3b3", // lighter green / gray on hover
                      },
                    }}
                  />
                  <ListItemText
                    primary={item.name}
                    secondary={`${item.section || DEFAULT_SECTION} — ${
                      item.bought ? "Bought" : "Not bought"
                    }`}
                  />
                </Box>

                {/* Right side: edit + delete */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <IconButton
                    color="inherit"
                    onClick={() => {
                      setEditItem(item);
                      setEditOpen(true);
                    }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => {
                      setItemToDelete(item);
                      setDeleteConfirmOpen(true);
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
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
{/* Edit item dialog */}
<Dialog
  open={editOpen}
  onClose={handleCloseEditDialog}
  TransitionComponent={Transition}
  disableEnforceFocus
  PaperProps={{
    sx: {
      bgcolor: "#121212",
      color: "#fff",
      borderRadius: 3,
      p: 3,               // more padding inside dialog
      minWidth: 400,      // wider to fit labels
      maxWidth: "90%",
      minHeight: 380,     // taller so fields aren’t squished
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
    },
  }}
>
  <DialogTitle sx={{ fontSize: 20 }}>Edit Item</DialogTitle>

  <DialogContent
    sx={{
      display: "flex",
      flexDirection: "column",
      gap: 3,            // more space between fields
      mt: 1,
    }}
  >
   <TextField
  label="Item name"
  fullWidth
  variant="outlined"
  value={editItem?.name || ""}
  onChange={(e) => setEditItem({ ...editItem!, name: e.target.value })}
  InputLabelProps={{ shrink: true }}
  margin="normal"       // use "normal" instead of "dense"
  sx={{
    input: { color: "#fff", padding: "10px 12px" },  // more vertical padding
  }}
/>
    <TextField
      label="Quantity"
      type="number"
      fullWidth
      variant="outlined"
      value={editItem?.quantity || 1}
      onChange={(e) =>
        setEditItem({ ...editItem!, quantity: Number(e.target.value) })
      }
      InputLabelProps={{ shrink: true }}
    />
    <TextField
      select
      label="Section"
      fullWidth
      variant="outlined"
      value={editItem?.section || DEFAULT_SECTION}
      onChange={(e) =>
        setEditItem({ ...editItem!, section: e.target.value })
      }
      SelectProps={{ native: true }}
      InputLabelProps={{ shrink: true }}
    >
      {SECTIONS.map((section) => (
        <option key={section} value={section}>
          {section}
        </option>
      ))}
    </TextField>
  </DialogContent>

  <DialogActions
    sx={{
      justifyContent: "center",
      mt: 3,
      pb: 3,
      gap: 2,
    }}
  >
    <Button
      onClick={() => setEditOpen(false)}
      variant="outlined"
      sx={{ minWidth: 100 }}
    >
      Cancel
    </Button>
    <Button
      variant="contained"
      sx={{
        minWidth: 120,
        fontWeight: 600,
        bgcolor: "#1bd760",
        "&:hover": { bgcolor: "#1ed760" },
      }}
      onClick={async () => {
        if (!editItem) return;
        try {
          await api.put(`/lists/${id}/items/${editItem.id}`, editItem);
          setItems((prev) =>
            prev.map((i) => (i.id === editItem.id ? editItem : i))
          );
          setSnackbar({ open: true, message: "Item updated!" });
          setEditOpen(false);
        } catch (err) {
          console.error("Error updating item:", err);
          setSnackbar({ open: true, message: "Failed to update item." });
        }
      }}
    >
      Save Changes
    </Button>
  </DialogActions>
</Dialog>

      {/* Confirm delete bought items dialog */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Delete All Bought Items</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            ⚠️ This will permanently delete all items marked as <b>“Bought”</b>.
            <br />
            To confirm, type <b>"yes"</b> below.
          </Typography>
          <TextField
            label="Type 'yes' to confirm"
            fullWidth
            value={confirmInput}
            onChange={(e) => setConfirmInput(e.target.value)}
            autoFocus
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            disabled={confirmInput.toLowerCase() !== "yes"}
            onClick={async () => {
              await handleClearBought();
              setConfirmInput("");
              setConfirmOpen(false);
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirm delete single item */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
      >
        <DialogTitle>Delete Item</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 1 }}>
            Are you sure you want to delete{" "}
            <b>{itemToDelete?.name || "this item"}</b>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            onClick={async () => {
              if (itemToDelete) {
                await handleDelete(itemToDelete.id);
              }
              setItemToDelete(null);
              setDeleteConfirmOpen(false);
            }}
          >
            Yes, delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
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
