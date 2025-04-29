import { Routes, Route } from "react-router-dom";

import BidList from "./BidList";

import { ProtectedRoute } from "../../components/auth/ProtectedRoute";

const Bids = () => {
  return (
    <Routes>
      <Route
        element={
          <ProtectedRoute>
            <BidList />
          </ProtectedRoute>
        }
        index
      />
    </Routes>
  );
};

export default Bids;
