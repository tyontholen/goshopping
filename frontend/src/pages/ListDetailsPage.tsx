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
import Dialog from "@mui/material/Dialog";
import Slide from "@mui/material/Slide";
import { TransitionProps } from "@mui/material/transitions";

// ✅ Reusable DialogWrapper to prevent stuck overlays or focus lock issues
const SlideUp = React.forwardRef(function SlideUp(
  props: TransitionProps & { children: React.ReactElement<any, any> },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

function DialogWrapper({
  open,
  onClose,
  children,
  paperSx,
  keepMounted = false,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  paperSx?: any;
  keepMounted?: boolean;
}) {
  const handleClose = () => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    onClose();
  };

  const cleanupPortals = () => {
    // Fix stuck aria-hidden/focus issues from rapid dialog toggles
    document.querySelectorAll('[aria-hidden="true"]').forEach((el) => {
      el.removeAttribute("aria-hidden");
    });
    document.querySelectorAll(".MuiBackdrop-root").forEach((b) => {
      (b as HTMLElement).parentElement?.removeChild(b);
    });
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      TransitionComponent={SlideUp}
      closeAfterTransition
      keepMounted={keepMounted}
      onExited={cleanupPortals}
      PaperProps={{
        sx: {
          bgcolor: "#121212",
          color: "#fff",
          borderRadius: 3,
          p: 3,
          ...(paperSx || {}),
        },
      }}
    >
      {children}
    </Dialog>
  );
}

// ✅ Item interface
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

  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string }>(
    { open: false, message: "" }
  );

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

  const handleDelete = async (itemId: string) => {
    try {
      await api.delete(`/lists/${id}/items/${itemId}`);
      setItems((prev) => prev.filter((i) => i.id !== itemId));
      setSnackbar({ open: true, message: "Item deleted!" });
    } catch (err) {
      console.error("Error deleting item:", err);
    }
  };

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

      {/* Top Buttons */}
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

      {/* Items List */}
      {items.length === 0 ? (
        <Typography>No items found. Add one!</Typography>
      ) : (
        <List sx={{ width: "100%", maxWidth: 600 }}>
          {[...items]
            .sort((a, b) => {
              if (a.bought !== b.bought) return a.bought ? 1 : -1;
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
                  bgcolor: "background.paper",
                  borderRadius: 2,
                  mb: 1,
                  px: 2,
                  "&:hover": { bgcolor: "#1a1a1a" },
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <CheckIcon
                    onClick={() => handleToggleBought(item.id)}
                    sx={{
                      cursor: "pointer",
                      color: item.bought ? "#1bd760" : "#535353",
                      transition: "color 0.2s ease",
                      "&:hover": {
                        color: item.bought ? "#1ed760" : "#b3b3b3",
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

      {/* Add Item Dialog */}
      <DialogWrapper open={open} onClose={() => setOpen(false)}>
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
      </DialogWrapper>

      {/* Edit Item Dialog */}
      <DialogWrapper
        open={editOpen}
        onClose={() => setEditOpen(false)}
        paperSx={{
          minWidth: 400,
          maxWidth: "90%",
          minHeight: 380,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <DialogTitle sx={{ fontSize: 20 }}>Edit Item</DialogTitle>
        <DialogContent
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 3,
            mt: 1,
          }}
        >
          <TextField
            label="Item name"
            fullWidth
            variant="outlined"
            value={editItem?.name || ""}
            onChange={(e) =>
              setEditItem({ ...editItem!, name: e.target.value })
            }
            InputLabelProps={{ shrink: true }}
            margin="normal"
            sx={{ input: { color: "#fff", padding: "10px 12px" } }}
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
        <DialogActions sx={{ justifyContent: "center", mt: 3, pb: 3, gap: 2 }}>
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
                setSnackbar({
                  open: true,
                  message: "Failed to update item.",
                });
              }
            }}
          >
            Save Changes
          </Button>
        </DialogActions>
      </DialogWrapper>

      {/* Confirm Delete All Bought */}
      <DialogWrapper open={confirmOpen} onClose={() => setConfirmOpen(false)}>
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
      </DialogWrapper>

      {/* Confirm Delete One */}
      <DialogWrapper
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
      </DialogWrapper>

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
