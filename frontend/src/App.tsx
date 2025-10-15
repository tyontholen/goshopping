import React from "react";
import ListsPage from "./pages/ListsPage";
import { CssBaseline, Container } from "@mui/material";

const App: React.FC = () => {
  return (
    <>
      <CssBaseline />
      <Container maxWidth="md">
        <ListsPage />
      </Container>
    </>
  );
};

export default App;