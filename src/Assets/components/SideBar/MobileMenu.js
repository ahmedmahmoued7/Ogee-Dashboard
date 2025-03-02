// MobileMenu.js
import React from "react";
import { slide as Menu } from "react-burger-menu";
import { NavLink, useLocation } from "react-router-dom";
import "./MobileMenu.css";

const MobileMenu = () => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  const activeStyle = {
    color: "red",
    fontWeight: "bold",
    fontSize: "17px",
  };

  const textStyle = {
    fontSize: "17px",
    color: "#054d3e",
    fontWeight: "600",
  };

  return (
    <div className="MobileMenu">
      <Menu>
        <NavLink exact to="/" style={isActive("/") ? activeStyle : textStyle}>
          Home
        </NavLink>
        <NavLink to="/rooms" style={isActive("/rooms") ? activeStyle : textStyle}>
          Rooms
        </NavLink>
        <NavLink to="/addrooms" style={isActive("/addrooms") ? activeStyle : textStyle}>
          Add Rooms
        </NavLink>
        <NavLink to="/EditRooms" style={isActive("/EditRooms") ? activeStyle : textStyle}>
          Edit Rooms
        </NavLink>
        <NavLink to="/ImportDecorations" style={isActive("/ImportDecorations") ? activeStyle : textStyle}>
          Import
        </NavLink>
        <NavLink to="/ExportDecorations" style={isActive("/ExportDecorations") ? activeStyle : textStyle}>
          Export
        </NavLink>
        <NavLink to="/UpdateUser" style={isActive("/UpdateUser") ? activeStyle : textStyle}>
          Update User
        </NavLink>
        <NavLink to="/ChangePassword" style={isActive("/ChangePassword") ? activeStyle : textStyle}>
          Change Password
        </NavLink>
      </Menu>
    </div>
  );
};

export default MobileMenu;
