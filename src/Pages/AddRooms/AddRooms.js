import React, { useState, useEffect, useCallback } from "react";
import "./AddRooms.css";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import Select from "react-select";
import { useAuth } from "../../Assets/components/Auth/AuthContext";
import UserLogged from "../../Assets/components/Menu/userLogged/userLogged";
import { MainUrl } from "../../config";
function AddRoom() {
  const { token } = useAuth();
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = "";
      return "Are you sure you want to leave? All data will be lost.";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);
  //here a States for select data (form 1)
  const [finishingCosts, setFinishingCosts] = useState([]);
  const [finishingStyles, setFinishingStyles] = useState([]);
  const [roomNames, setRoomNames] = useState([]);

  //here a States for form fields (form 1)

  const [design_code, setDesign_code] = useState("");
  const [english_name, setEnglish_name] = useState("");
  const [arabic_name, setArabic_name] = useState("");
  const [finishing_cost_Id, setFinishing_cost_Id] = useState("");
  const [finishing_style_Id, setFinishing_style_Id] = useState("");
  const [room_names_Id, setRoom_names_Id] = useState("");
  const [finishing_cost_Name, setFinishing_cost_Name] = useState("");
  const [finishing_style_Name, setFinishing_style_Name] = useState("");
  const [room_names_Name, setRoom_names_Name] = useState("");
  const [reception_Square, setReception_Square] = useState([]);
  const [reception_SquareName, setReception_SquareName] = useState("");

  const decodedRoomNames = decodeURIComponent(room_names_Name);

  // Fetching functions for select data

  const options = [
    { value: "L-Shape", label: "L-Shape" },
    { value: "Sq-Shape", label: "Sq-Shape" },
  ];

  // Fetch Finishing Costs
  const fetchFinishingCosts = useCallback(async () => {
    try {
      if (!token) {
        history("/");
        console.log("No token found");
        return;
      }
      const response = await axios.get(`${MainUrl}finishing/finishing-costs/`);
      const data = response.data.map((item) => ({
        id: item.id,
        label: item.name,
      }));
      setFinishingCosts(data);
    } catch (error) {
      console.error("Failed to fetch wall material IDs", error);
    }
  }, []);

  const finishingCostsOptions = finishingCosts.map((material) => ({
    value: material.id,
    label: material.label,
  }));

  const handleFinishingCostsChange = (selectedOption) => {
    setFinishing_cost_Id(selectedOption ? selectedOption.value : "");
    setFinishing_cost_Name(selectedOption ? selectedOption.label : "");
  };

  // Fetch Finishing Styles
  const fetchFinishingStyles = useCallback(async () => {
    try {
      const response = await axios.get(`${MainUrl}finishing/finishing-styles/`);
      const data = response.data.map((item) => ({
        id: item.id,
        label: item.name,
      }));
      setFinishingStyles(data);
    } catch (error) {
      console.error("Failed to fetch wall material IDs", error);
    }
  }, []);

  const finishingStylesOptions = finishingStyles.map((material) => ({
    value: material.id,
    label: material.label,
  }));

  const handleFinishingStylesChange = (selectedOption) => {
    setFinishing_style_Id(selectedOption ? selectedOption.value : "");
    setFinishing_style_Name(selectedOption ? selectedOption.label : "");
  };

  // Fetch Room Names

  const fetchRoomNames = useCallback(async () => {
    try {
      const response = await axios.get(`${MainUrl}home/room-names/`);
      const data = response.data.map((item) => ({
        id: item.id,
        label: item.name,
      }));
      setRoomNames(data);
    } catch (error) {
      console.error("Failed to fetch wall material IDs", error);
    }
  }, []);

  const roomNamesOptions = roomNames.map((material) => ({
    value: material.id,
    label: material.label,
  }));

  const handleRoomNamesChange = (selectedOption) => {
    setRoom_names_Id(selectedOption ? selectedOption.value : "");
    setRoom_names_Name(selectedOption ? selectedOption.label : "");
  };
  //

  useEffect(() => {
    fetchFinishingCosts();
    fetchFinishingStyles();
    fetchRoomNames();
  }, []);

  const SquareOption = reception_Square.map((square) => ({
    value: square.id,
    label: square.label,
  }));

  const handleSquareOption = (selectedOption) => {
    setReception_SquareName(selectedOption ? selectedOption.value : "");
  };
  // Validation function for the second form

  const history = useNavigate();

  const handleNext = () => {
    // Checking each field individually
    if (design_code.trim() === "") {
      alert("Please enter the design code.");
      return;
    }
    if (english_name.trim() === "") {
      alert("Please enter the English name.");
      return;
    }
    if (arabic_name.trim() === "") {
      alert("Please enter the Arabic name.");
      return;
    }
    if (finishing_cost_Id.toString().trim() === "") {
      alert("Please select a finishing cost.");
      return;
    }
    if (finishing_style_Id.toString().trim() === "") {
      alert("Please select a finishing style.");
      return;
    }
    if (room_names_Id.toString().trim() === "") {
      alert("Please select a room name.");
      return;
    }

    if (decodedRoomNames === "Reception") {
      // Check if reception_SquareName is empty
      if (reception_SquareName.trim() === "") {
        alert("Please select Reception Shape.");
        return;
      }
    }

    const formData = {
      design_code,
      english_name,
      arabic_name,
      finishing_cost_Id,
      finishing_style_Id,
      room_names_Id,
      finishing_cost_Name,
      finishing_style_Name,
      room_names_Name,
      reception_Square,
      reception_SquareName,
    };

    localStorage.setItem("formData", JSON.stringify(formData));
    history("/Add-rooms-details");
  };

  const renderFirstForm = () => {
    return (
      <div className="Container">
        <form className="Field_Container">
          {/* Input fields */}
          <div className="Form_Box">
            <h3>Design code</h3>
            <input
              type="text"
              onChange={(e) => setDesign_code(e.target.value)}
              className="Input"
              value={design_code}
              name="design_code"
              id="design_code"
              required
            />
          </div>
          {/*  */}
          <div className="Form_Box">
            <h3>English name</h3>
            <input
              type="text"
              onChange={(e) => setEnglish_name(e.target.value)}
              className="Input"
              name="english_name"
              value={english_name}
              id="english_name"
              required
            />
          </div>
          <div className="Form_Box">
            <h3>Arabic name</h3>
            <input
              type="text"
              onChange={(e) => setArabic_name(e.target.value)}
              className="Input"
              name="arabic_name"
              value={arabic_name}
              id="arabic_name"
              required
            />
          </div>
          {/* Select boxes */}
          <div className="Form_Box">
            <h3>Finishing cost</h3>
            <Select
              className="Select_Box"
              value={finishingCostsOptions.find((option) => option.value === finishing_cost_Id)}
              onChange={handleFinishingCostsChange}
              options={finishingCostsOptions}
              id="finishing_style_Id"
              name="finishing_style_Id"
              placeholder="Select...."
              isClearable
              required
            />
          </div>
          <div className="Form_Box">
            <h3>Finishing style</h3>
            <Select
              className="Select_Box"
              value={finishingStylesOptions.find((option) => option.value === finishing_style_Id)}
              onChange={handleFinishingStylesChange}
              options={finishingStylesOptions}
              id="finishing_style_Id"
              name="finishing_style_Id"
              placeholder="Select...."
              isClearable
              required
            />
          </div>
          <div className="Form_Box">
            <h3>Room names</h3>
            <Select
              className="Select_Box"
              value={roomNamesOptions.find((option) => option.value === room_names_Id)}
              onChange={handleRoomNamesChange}
              options={roomNamesOptions}
              id="room_names_Id"
              name="room_names_Id"
              placeholder="Select...."
              isClearable
              required
            />
          </div>
          {/* if Reception */}
          {decodedRoomNames === "Reception" ? (
            <div className="Form_Box">
              <h3>Shape</h3>
              <Select
                className="Select_Box"
                options={options}
                value={SquareOption.find((option) => option.value === reception_Square)}
                onChange={handleSquareOption}
                name="reception_Square"
                id="reception_Square"
                isClearable
                required
              />
            </div>
          ) : null}
          {/*  */}
          {/* Next Button */}
          <div className="Button_Box">
            <button type="button" className="N_Button" onClick={handleNext}>
              Next
            </button>
          </div>
        </form>
      </div>
    );
  };

  return (
    <div className="Container">
      <div className="Rooms_Header">
        <UserLogged />
      </div>
      <div className="Details_Head_Container">
        <div className="Details_Path_Container">
          <div className="Add_Room">Add Room</div>
          <Link to="/">Home</Link>
          <h4>&gt;</h4>
          <Link to="/Rooms">Rooms</Link>
          <h4>&gt;</h4>
          <h4>Add Rooms</h4>
        </div>
      </div>

      {renderFirstForm()}
    </div>
  );
}

export default AddRoom;
