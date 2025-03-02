import React, { useState, useEffect } from "react";
import { useAuth } from "../../Assets/components/Auth/AuthContext";
import axios from "axios";
import { ToastContainer } from "react-toastify";
import "./Manage_User.css";
import { MainUrl } from "../../config";
import UserLogged from "../../Assets/components/Menu/userLogged/userLogged";

const Popup = ({ message, onClose }) => {
  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <h3>{message}</h3>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default function ManageUserContent() {
  const { token } = useAuth();
  const [userInfo, setUserInfo] = useState({});
  const [popupMessage, setPopupMessage] = useState("");

  useEffect(() => {
    fetchUserInfo();
  }, []);

  const fetchUserInfo = async () => {
    try {
      const response = await axios.get(`${MainUrl}user/user/info/`, {
        headers: { Authorization: `Token ${token}` },
      });
      setUserInfo(response.data);
    } catch (error) {
      console.error("Error fetching user info:", error);
    }
  };

  const handleUpdateUser = async () => {
    try {
      const response = await axios.post(
        `${MainUrl}user/update-user/`,
        { ...userInfo },
        {
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      setPopupMessage(response.data.message);
    } catch (error) {
      console.error("Error updating user info:", error);
    }
  };

  const handleChange = (e) => {
    setUserInfo({ ...userInfo, [e.target.name]: e.target.value });
  };

  return (
    <>
      <div className="GoEdit_UserLogged">
        <UserLogged />
      </div>
      <div className="update-user-container">
        <h1>Update User</h1>
        <div className="user-info">
          <div className="info-row">
            <label>Name:</label>
            <input
              type="text"
              name="name"
              value={userInfo.name || ""}
              onChange={handleChange}
            />
          </div>
          <div className="info-row">
            <label>Email:</label>
            <input
              type="email"
              name="email"
              value={userInfo.email || ""}
              onChange={handleChange}
            />
          </div>
          <div className="info-row">
            <label>Phone:</label>
            <input
              type="text"
              name="phone"
              value={userInfo.phone || ""}
              onChange={handleChange}
            />
          </div>
          <div className="info-row">
            <label>Date of Birth:</label>
            <input
              type="date"
              name="date_of_birth"
              value={userInfo.date_of_birth || ""}
              onChange={handleChange}
            />
          </div>
          <div className="info-row">
            <label>User Since:</label>
            <input
              type="text"
              name="createdAt"
              value={
                userInfo.createdAt
                  ? new Date(userInfo.createdAt).toLocaleDateString()
                  : ""
              }
              disabled
            />
          </div>
          <div className="Button_Manage_Container">
            <button onClick={handleUpdateUser} className="Button_Update_User">
              Update User Info
            </button>
          </div>
        </div>
      </div>
      <ToastContainer />
      {popupMessage && (
        <Popup message={popupMessage} onClose={() => setPopupMessage("")} />
      )}
    </>
  );
}
