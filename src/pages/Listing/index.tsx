import { Routes, Route } from "react-router-dom";

import { ProtectedRoute } from "../../components/auth/ProtectedRoute";
import ItemList from "./ItemList";
import ItemListDetail from "./ItemListDetail";

const Listing = () => {
  return (
    <Routes>
      <Route
        element={
          <ProtectedRoute>
            <ItemList />
          </ProtectedRoute>
        }
        index
      />
      <Route
        element={
          <ProtectedRoute>
            <ItemListDetail />
          </ProtectedRoute>
        }
        path=":id"
      />
    </Routes>
  );
};

export default Listing;
