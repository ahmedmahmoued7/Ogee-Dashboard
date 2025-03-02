import React, { useState, useEffect } from "react";
import { Sidebar, Menu, MenuItem, SubMenu } from "react-pro-sidebar";
import { FaBuromobelexperte, FaAlignJustify, FaAlignLeft, FaHome, FaUsersCog, FaCity } from "react-icons/fa";
import { NavLink, useLocation } from "react-router-dom";
import "./LSideBar.css";
import { useAuth } from "../../components/Auth/AuthContext";
import MobileMenu from "./MobileMenu";

import { useMediaQuery } from "react-responsive";

const SidebarComponent = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [roomsOpen, setRoomsOpen] = useState(false);
  const [decorationsOpen, setDecorationsOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const location = useLocation();
  const { token } = useAuth();

  const isMobile = useMediaQuery({ maxWidth: 500 });

  useEffect(() => {
    if (
      location.pathname.startsWith("/rooms") ||
      location.pathname.startsWith("/addrooms") ||
      location.pathname.startsWith("/EditRooms") ||
      location.pathname.startsWith("/SearchRooms")
    ) {
      setRoomsOpen(true);
    } else {
      setRoomsOpen(false);
    }

    if (location.pathname.startsWith("/ImportDecorations") || location.pathname.startsWith("/ExportDecorations")) {
      setDecorationsOpen(true);
    } else {
      setDecorationsOpen(false);
    }

    if (location.pathname.startsWith("/UpdateUser") || location.pathname.startsWith("/ChangePassword")) {
      setUserOpen(true);
    } else {
      setUserOpen(false);
    }
  }, [location.pathname]);

  const handleToggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const handleRoomsClick = () => {
    setRoomsOpen(!roomsOpen);
  };

  const handleDecorationsClick = () => {
    setDecorationsOpen(!decorationsOpen);
  };

  const handleUserClick = () => {
    setUserOpen(!userOpen);
  };

  const iconStyle = {
    fontSize: "25px",
    color: "#054d3e",
  };

  const textStyle = {
    fontSize: "17px",
    color: "#054d3e",
    fontWeight: "600",
  };

  const activeStyle = {
    color: "red",
    fontWeight: "bold",
    fontSize: "17px",
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <>
      {token ? (
        isMobile ? (
          <MobileMenu />
        ) : (
          <Sidebar collapsed={collapsed} style={{ background: "#adadad6d" }}>
            <div
              style={{
                padding: "10px 30px",
                display: "flex",
                justifyContent: "flex-start",
              }}
            >
              <button
                onClick={handleToggleSidebar}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "20px",
                  cursor: "pointer",
                  color: "#054d3e",
                }}
              >
                {collapsed ? (
                  <FaAlignJustify />
                ) : (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "12px",
                      fontSize: "16px",
                      background: "adadad2d",
                    }}
                  >
                    <FaAlignLeft />
                    <span>Welcome to Ogee</span>
                  </div>
                )}
              </button>
            </div>
            <Menu iconShape="circle">
              <MenuItem
                icon={<FaHome style={iconStyle} />}
                component={<NavLink exact to="/" style={isActive("/") ? activeStyle : textStyle} />}
                style={textStyle}
              >
                Home
              </MenuItem>
              <SubMenu label="Rooms" icon={<FaCity style={iconStyle} />} style={textStyle} onClick={handleRoomsClick} open={roomsOpen}>
                <MenuItem
                  component={<NavLink to="/rooms" style={isActive("/rooms") ? activeStyle : textStyle} />}
                  style={{ ...textStyle, background: "#adadad6d" }}
                >
                  Rooms
                </MenuItem>
                <MenuItem
                  component={<NavLink to="/SearchRooms" style={isActive("/SearchRooms") ? activeStyle : textStyle} />}
                  style={{ ...textStyle, background: "#adadad6d" }}
                >
                  Search Rooms
                </MenuItem>
                <MenuItem
                  component={<NavLink to="/addrooms" style={isActive("/addrooms") ? activeStyle : textStyle} />}
                  style={{ ...textStyle, background: "#adadad6d" }}
                >
                  Add Rooms
                </MenuItem>
                <MenuItem
                  component={<NavLink to="/EditRooms" style={isActive("/EditRooms") ? activeStyle : textStyle} />}
                  style={{ ...textStyle, background: "#adadad6d" }}
                >
                  Edit Rooms
                </MenuItem>
              </SubMenu>
              <SubMenu
                label="Decorations Data"
                icon={<FaBuromobelexperte style={iconStyle} />}
                style={textStyle}
                onClick={handleDecorationsClick}
                open={decorationsOpen}
              >
                <MenuItem
                  component={<NavLink to="/ImportDecorations" style={isActive("/ImportDecorations") ? activeStyle : textStyle} />}
                  style={{ ...textStyle, background: "#adadad6d" }}
                >
                  Import
                </MenuItem>
                <MenuItem
                  component={<NavLink to="/ExportDecorations" style={isActive("/ExportDecorations") ? activeStyle : textStyle} />}
                  style={{ ...textStyle, background: "#adadad6d" }}
                >
                  Export
                </MenuItem>
              </SubMenu>
              <SubMenu label="User" icon={<FaUsersCog style={iconStyle} />} style={textStyle} onClick={handleUserClick} open={userOpen}>
                <MenuItem
                  component={<NavLink to="/UpdateUser" style={isActive("/UpdateUser") ? activeStyle : textStyle} />}
                  style={{ ...textStyle, background: "#adadad6d" }}
                >
                  Update User
                </MenuItem>
                <MenuItem
                  component={<NavLink to="/ChangePassword" style={isActive("/ChangePassword") ? activeStyle : textStyle} />}
                  style={{ ...textStyle, background: "#adadad6d" }}
                >
                  Change Password
                </MenuItem>
              </SubMenu>
            </Menu>
          </Sidebar>
        )
      ) : null}
      <div className="page-content"></div>
    </>
  );
};

const WrappedSidebarComponent = () => <SidebarComponent />;

export default WrappedSidebarComponent;
