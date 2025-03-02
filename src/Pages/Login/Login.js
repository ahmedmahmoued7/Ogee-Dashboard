import React, { useState, useRef, useEffect } from "react";
import Cookies from "js-cookie";
import { useAuth } from "../../Assets/components/Auth/AuthContext";
import "./Login.css";
import Logo from "../../Assets/images/Logo.svg";
import LoginImg from "../../Assets/images/Login-img.svg";
import EyeOpen from "../../Assets/images/eye-open.svg";
import EyeClose from "../../Assets/images/eyeclose.svg";
import { ToastContainer } from "react-toastify";
import { MainUrl } from "../../config";
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
function LoginContent() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const passwordInputRef = useRef(null);
  const [rememberMe, setRememberMe] = useState(false);
  const { login } = useAuth();
  const [popupMessage, setPopupMessage] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${MainUrl}user/login/`, {
        method: "POST",
        headers: {
          Accept: "*/*",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone,
          password,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        if (data.is_staff) {
          setPopupMessage(data.message);
          Cookies.set("userToken", data.token, {
            expires: 7,
            secure: true,
            httpOnly: true,
            sameSite: "strict",
          });
          Cookies.set("userPhone", phone, {
            expires: 7,
            secure: true,
            httpOnly: true,
            sameSite: "strict",
          });

          if (rememberMe) {
            localStorage.setItem("rememberMe", "true");
            localStorage.setItem("username", phone);
            localStorage.setItem("password", password);
          } else {
            localStorage.removeItem("rememberMe");
            localStorage.removeItem("username");
            localStorage.removeItem("password");
          }

          login(data.token, phone);

          window.location.href = "/";
        } else {
          throw new Error("Sorry, you have no permission.");
        }
      } else {
        throw new Error(data.message || "An error occurred in user or password.");
      }
    } catch (error) {
      setPopupMessage(error.message);
    }
  };

  useEffect(() => {
    const rememberMe = localStorage.getItem("rememberMe") === "true";
    const username = rememberMe ? localStorage.getItem("username") : "";
    const password = rememberMe ? localStorage.getItem("password") : "";

    setRememberMe(rememberMe);
    setPhone(username);
    setPassword(password);
  }, []);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (passwordInputRef.current && !passwordInputRef.current.contains(event.target)) {
        setShowPassword(false); // Hide password when clicking outside
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [passwordInputRef]);

  return (
    <>
      <div className="Login_Container">
        <div className="Login_S1">
          <div className="container_login">
            <div className="wrap_Login">
              <div className="Login_S1_P1">
                <div>
                  <img src={Logo} alt="" />
                </div>
                <div className="LogIn_Text">Log In</div>
                {/* username */}
                <form onSubmit={handleLogin}>
                  <div className="Input_User_Container">
                    <h3>User Name</h3>
                    <input
                      type="text"
                      name="username"
                      className="Input_User_Login"
                      placeholder="write your username here"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                  {/* password */}
                  <div className="Input_User_Container">
                    <h3>password</h3>
                    <div ref={passwordInputRef} className="password-input-container">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="pass"
                        className="Input_User_Login"
                        placeholder="********"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <img src={showPassword ? EyeClose : EyeOpen} alt="" className="toggle-password-icon" onClick={togglePasswordVisibility} />
                    </div>
                  </div>
                  {/*  */}
                  <div className="Input_Re_Container">
                    <input type="checkbox" checked={rememberMe} className="CheckBox_size" onChange={(e) => setRememberMe(e.target.checked)} />
                    <h3>Remember me</h3>
                  </div>
                  {/*  */}
                  <button className="Button_Login">Log In</button>
                </form>
              </div>
              <div>
                <img src={LoginImg} alt="LoginImg" className="LoginImg" />
              </div>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer />
      {popupMessage && <Popup message={popupMessage} onClose={() => setPopupMessage("")} />}
    </>
  );
}

export default LoginContent;
