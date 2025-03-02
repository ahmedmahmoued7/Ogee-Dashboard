import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../Assets/components/Auth/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import EyeOpen from "../../Assets/images/eye-open.svg";
import EyeClose from "../../Assets/images/eyeclose.svg";
import "./Change_Password.css";
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

export default function ChangePasswordContent() {
  const { logout } = useAuth();
  const { token } = useAuth();
  const history = useNavigate();
  const [userInfo, setUserInfo] = useState({});
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [popupMessage, setPopupMessage] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const passwordInputRef = useRef(null);

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

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      setPopupMessage("New password and confirm password do not match.");
      return;
    }

    try {
      const response = await axios.post(
        `${MainUrl}user/change-password/`,
        { phone: userInfo.phone, new_password: newPassword },
        {
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      setPopupMessage(response.data.message);
      setTimeout(() => {
        logout();
        history("/");
      }, 3000);
    } catch (error) {
      console.error("Error changing password:", error);
    }
  };

  const toggleNewPasswordVisibility = () => {
    setShowNewPassword(!showNewPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <>
      {" "}
      <div className="GoEdit_UserLogged">
        <UserLogged />
      </div>
      <div className="change-password-container">
        <h1>Change Password</h1>
        <div className="change-password">
          <div className="info-row">
            <label>New Password:</label>
            <input
              type={showNewPassword ? "text" : "password"}
              name="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="Input_Change_Password"
              ref={passwordInputRef}
            />
            <img
              src={showNewPassword ? EyeClose : EyeOpen}
              alt=""
              className="toggle-password-icon2"
              onClick={toggleNewPasswordVisibility}
            />
          </div>
          <div className="info-row">
            <label>Confirm New Password:</label>
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="Input_Change_Password"
              ref={passwordInputRef}
            />
            <img
              src={showConfirmPassword ? EyeClose : EyeOpen}
              alt=""
              className="toggle-password-icon2"
              onClick={toggleConfirmPasswordVisibility}
            />
          </div>
          <div className="Button_Manage_Container">
            <button
              onClick={handleChangePassword}
              className="Button_Change_Password"
            >
              Change Password
            </button>
          </div>
        </div>
      </div>
      {popupMessage && (
        <Popup message={popupMessage} onClose={() => setPopupMessage("")} />
      )}
    </>
  );
}
