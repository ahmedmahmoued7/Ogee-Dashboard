import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AddRoomF from "./Pages/AddRooms/index";
import AddRoomsDetails from "./Pages/AddRoomsDetails/index";
import RoomsPage from "./Pages/Rooms/index";
import EditRoom from "./Pages/RoomEdit/index";
import Login from "./Pages/Login/index";
import GoEditRoom from "./Pages/GoEditRoom/Index";
import ExportDecorations from "./Pages/ExportDecorations/index";
import ImportDecorations from "./Pages/ImportDecorations/index";
import HomePage from "./Pages/Home/Index";
import ManageUser from "./Pages/Manage User/Index";
import ChangePassword from "./Pages/Change Password/Index";
import UnitPdf from "./Pages/Gen_Unit_Pdf/UnitPdf";
import { AuthProvider } from "./Assets/components/Auth/AuthContext";
import Layout from "./Assets/components/Layout/Layout";
import SearchPage from "./Pages/Search/index";
function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="unit/:id" element={<UnitPdf />} />
          {/*  */}
          <Route path="/" element={<Layout />}>
            <Route path="SearchRooms" element={<SearchPage />} />
            <Route path="ChangePassword" element={<ChangePassword />} />
            <Route path="UpdateUser" element={<ManageUser />} />
            <Route path="ImportDecorations" element={<ImportDecorations />} />
            <Route path="ExportDecorations" element={<ExportDecorations />} />
            <Route path="Room/:id/edit" element={<EditRoom />} />
            <Route path="EditRooms" element={<GoEditRoom />} />
            <Route path="login" element={<Login />} />
            <Route path="Rooms" element={<RoomsPage />} />
            <Route path="Add-rooms-details" element={<AddRoomsDetails />} />
            <Route path="Addrooms" element={<AddRoomF />} />
            <Route path="/" element={<HomePage />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
