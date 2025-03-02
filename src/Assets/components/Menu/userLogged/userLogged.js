import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./userLogged.css";
import UserLoggedSvg from "../../../images/user-logged.svg";
import { useAuth } from "../../Auth/AuthContext";
import axios from "axios";
import { MainUrl } from "../../../../config";
export default function UserLogged() {
  const { logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const history = useNavigate();

  const token = localStorage.getItem("userToken");
  const userPhone = localStorage.getItem("userPhone");
  const [userNameApi, setUserNameApi] = useState("");

  const isLoggedIn = token && userPhone;

  const handleLogout = () => {
    logout();
    history("/");
    window.location.reload();
  };

  const fetchUserName = useCallback(async () => {
    try {
      const response = await axios.get(
        `${MainUrl}user/user/info/`,

        {
          headers: {
            accept: "application/json",
            Authorization: `Token ${token}`,
          },
        }
      );
      setUserNameApi(response.data);
    } catch (error) {
      console.error("Failed to fetch user info", error);
    }
  }, [token]);

  useEffect(() => {
    if (isLoggedIn) {
      fetchUserName();
    }
  }, [isLoggedIn, fetchUserName]);

  const handleToggle = () => {
    setIsOpen((s) => !s);
  };

  return (
    <>
      {isLoggedIn ? (
        <div className="Toggle_Menu_Container">
          <button onClick={handleToggle}>
            <img src={UserLoggedSvg} alt="" className="UserLoggedSvg" />
            {/* {userPhone} */}
          </button>
          <Toggle isOpen={isOpen} userName={userNameApi.name} handleLogout={handleLogout} />
        </div>
      ) : (
        <a href="/login">
          <div className="UserNotLogged">
            <img src={UserLoggedSvg} alt="" className="UserLoggedSvg" />
            Please Login
          </div>
        </a>
      )}
    </>
  );
}

function Toggle({ isOpen, userName, handleLogout }) {
  return (
    <>
      {isOpen ? (
        <div className="Toggle_Menu">
          <div className="Toogle_Account">Welcome</div>
          <div className="Toggle_User">{userName}</div>
          <button onClick={handleLogout} className="Toggle_LogOut">
            Logout
          </button>
        </div>
      ) : null}
    </>
  );
}
