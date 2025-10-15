import React, { useEffect, useState } from "react";
import api from "../api/api"
import { List as ListType } from "../types"
import {
  Container,
  Typography,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
} from "@mui/material";

const ListsPage: React.FC = () => {
  const [lists, setLists] = useState<ListType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/lists")
      .then((res) => {
        // Adjust if backend wraps lists in an object
        setLists(res.data.lists || []);
      })
      .catch((err) => console.error("Error fetching lists:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <CircularProgress />;

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        🛒 Available lists
      </Typography>
      <List>
        {lists.map((list) => (
          <ListItem key={list.id} divider>
            <ListItemText
              primary={list.name}
              secondary={`List ID: ${list.id}`}
            />
          </ListItem>
        ))}
      </List>
    </Container>
  );
};

export default ListsPage;