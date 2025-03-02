import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../SideBar/LSideBar";
import MobileMenu from "../SideBar/MobileMenu";
import Footer from "../Footer/Footer";
import { useMediaQuery } from "react-responsive";

const Layout = () => {
  const isMobile = useMediaQuery({ maxWidth: 500 });

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {isMobile ? <MobileMenu /> : <Sidebar />}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          overflow: "auto",
        }}
      >
        <Outlet />
        <Footer />
      </div>
    </div>
  );
};

export default Layout;
