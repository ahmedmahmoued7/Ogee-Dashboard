import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./AddRoomsDetails.css";
import axios from "axios";
import Select, { components } from "react-select";
import { SortableContainer, SortableElement, SortableHandle } from "react-sortable-hoc";
import { arrayMoveImmutable } from "array-move";
import { SketchPicker } from "react-color";
import { useAuth } from "../../Assets/components/Auth/AuthContext";
import UserLogged from "../../Assets/components/Menu/userLogged/userLogged";
import imageCompression from "browser-image-compression";
import { MainUrl } from "../../config";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

// to handle Factors choices

const SortableMultiValueLabel = SortableHandle((props) => <components.MultiValueLabel {...props} />);

const SortableMultiValue = SortableElement((props) => {
  const onMouseDown = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const innerProps = { ...props.innerProps, onMouseDown };
  return <components.MultiValue {...props} innerProps={innerProps} />;
});

const SortableSelect = SortableContainer(Select);

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

function AddRoomsDetailsContent() {
  const { token } = useAuth();
  const history = useNavigate();

  const [popupMessage, setPopupMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const modules = {
    toolbar: [
      [{ header: "1" }, { header: "2" }, { font: [] }],
      [{ size: [] }],
      ["bold", "italic", "underline", "strike", "blockquote"],
      [{ list: "ordered" }, { list: "bullet" }, { indent: "-1" }, { indent: "+1" }],
      ["link", "image"],
      ["clean"], // Remove formatting button
    ],
  };

  useEffect(() => {
    // Redirect user to login page if not authenticated
    if (!token) {
      console.log("No token found, redirecting to login...");
      history("/login");
    }
  }, [token, history]);

  // here to check when i need to move or relaod page before going
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = "";
      return "Are you sure you want to leave? All data will be lost.";
    };

    // Adding event listener
    window.addEventListener("beforeunload", handleBeforeUnload);

    // Cleanup function
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  // for door tap
  const [doors, setDoors] = useState([
    {
      doorMaterialID: null,
      doorWidth: "",
      doorHeight: "",
    },
  ]);

  const addDoor = () => {
    if (doors.length >= 2) {
      setPopupMessage("You can't add more than 2 doors");
    } else {
      const newDoor = {
        doorMaterialID: null,
        doorWidth: "",
        doorHeight: "",
      };
      setDoors([...doors, newDoor]);
    }
  };

  const removeDoor = (index) => {
    const newDoors = doors.filter((_, i) => i !== index);
    setDoors(newDoors);
  };

  const updateDoorField = (index, field, value) => {
    const updatedDoors = doors.map((door, i) => (i === index ? { ...door, [field]: value } : door));
    setDoors(updatedDoors);
  };

  // Handler for doors
  const handleDoorMaterialChange = (selectedOption, index) => {
    const updatedDoors = doors.map((door, i) =>
      i === index
        ? {
            ...door,
            doorMaterialID: selectedOption ? selectedOption.value : null,
          }
        : door
    );
    setDoors(updatedDoors);
  };

  // end doors tap
  // start window tap
  const [windows, setWindows] = useState([
    {
      windowMaterialID: null,
      windowAddonMaterialID: null,
      windowWidth: "",
      windowHeight: "",
    },
  ]);

  // Windows functions (similar structure as doors)
  const addWindow = () => {
    if (windows.length >= 2) {
      setPopupMessage("You can't add more than 2 windows");
    } else {
      const newWindow = {
        windowMaterialID: null,
        windowAddonMaterialID: null,
        windowWidth: "",
        windowHeight: "",
      };
      setWindows([...windows, newWindow]);
    }
  };

  const removeWindow = (indexWindow) => {
    const newWindows = windows.filter((_, i) => i !== indexWindow);
    setWindows(newWindows);
  };

  const updateWindowField = (index, field, value) => {
    const updatedWindows = windows.map((window, i) => (i === index ? { ...window, [field]: value } : window));
    setWindows(updatedWindows);
  };
  // Handler for windows
  const handleWindowMaterialChange = (selectedOption, indexWindow) => {
    const updatedWindows = windows.map((window, i) =>
      i === indexWindow
        ? {
            ...window,
            windowMaterialID: selectedOption ? selectedOption.value : null,
          }
        : window
    );
    setWindows(updatedWindows);
  };
  // end window tap

  // Handler for windows
  const handleAddonWindowMaterialChange = (selectedOption, indexWindow) => {
    const updatedWindows = windows.map((window, i) =>
      i === indexWindow
        ? {
            ...window,
            windowAddonMaterialID: selectedOption ? selectedOption.value : null,
          }
        : window
    );
    setWindows(updatedWindows);
  };
  // end window tap

  // Initializing separate state for room images
  const [roomImages, setRoomImages] = useState([{ imageFile: null }]);
  const [roomImagePreviews, setRoomImagePreviews] = useState({});
  const [isCompressing, setIsCompressing] = useState(false);

  // Function to handle adding new image upload fields
  const addRoomImage = () => {
    if (roomImages.length >= 6) {
      setPopupMessage("You can't add more than 2 images");
    } else {
      setRoomImages([...roomImages, { imageFile: null }]);
    }
  };

  // Function to handle image change for rooms
  const handleRoomImageChange = async (e, index) => {
    const file = e.target.files[0];
    if (!file) return;

    const options = {
      maxSizeMB: 0.8,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
    };

    setIsCompressing(true);
    try {
      const compressedFile = file.size > 1024 * 1024 ? await imageCompression(file, options) : file;
      console.log(`Compressed from ${file.size} to ${compressedFile.size}`);

      const imageUrl = URL.createObjectURL(compressedFile);
      setRoomImagePreviews((prev) => ({ ...prev, [index]: imageUrl }));

      // Update the roomImages array with the compressed file instead of the original
      setRoomImages((prev) => prev.map((img, idx) => (idx === index ? { ...img, imageFile: compressedFile } : img)));

      setIsCompressing(false);
    } catch (error) {
      console.error("Compression error:", error);
      setIsCompressing(false);
    }
  };

  const uploadRoomImages = async (roomId) => {
    const uploadPromises = roomImages.map(async (image, index) => {
      if (!image.imageFile) {
        console.log(`No file selected for image at index ${index}`);
        return;
      }

      console.log(`Uploading file at index ${index}:`, {
        Name: image.imageFile.name,
        Type: image.imageFile.type,
        Size: `${image.imageFile.size / 1024 / 1024} MB`,
      });

      const formData = new FormData();
      formData.append("image", image.imageFile, image.imageFile.name); // Ensure the name is included

      try {
        const response = await axios.post(`${MainUrl}home/rooms/${roomId}/upload-images/`, formData, {
          headers: {
            Accept: "application/json",
            Authorization: `Token ${token}`,
            // Removed 'Content-Type': 'multipart/form-data'
          },
        });
        console.log(`Image ${index} uploaded, server response:`, response.data);
      } catch (error) {
        console.error(`Error uploading image at index ${index}:`, error);
        if (error.response) {
          console.error(`Response data:`, error.response.data);
          console.error(`Status:`, error.response.status);
          console.error(`Headers:`, error.response.headers);
        }
      }
    });

    await Promise.all(uploadPromises);
    console.log("All images have been uploaded.");
  };

  // Function to remove an image from the room images
  const removeRoomImage = (index) => {
    const updatedRoomImages = roomImages.filter((_, idx) => idx !== index);
    setRoomImages(updatedRoomImages);

    const updatedImagePreviews = { ...roomImagePreviews };
    delete updatedImagePreviews[index];
    setRoomImagePreviews(updatedImagePreviews);
  };

  const [wallMaterialID, setWallMaterialID] = useState([]);
  const [wallMaterial_ID, setWallMaterial_ID] = useState("");
  //
  const [wallMaterialAddon1ID, setWallMaterialAddon1ID] = useState([]);
  const [wallMaterialAddon1_ID, setWallMaterialAddon1_ID] = useState("");
  //
  const [wallMaterialAddon2ID, setWallMaterialAddon2ID] = useState([]);
  const [wallMaterialAddon2_ID, setWallMaterialAddon2_ID] = useState([]);

  //
  const [cielingMaterialID, setCielingMaterialID] = useState([]);
  const [cielingMaterial_ID, setCielingMaterial_ID] = useState("");
  //
  const [cielingMaterialAddon1ID, setCielingMaterialAddon1ID] = useState([]);
  const [cielingMaterialAddon1_ID, setCielingMaterialAddon1_ID] = useState("");
  //
  const [cielingMaterialAddon2ID, setCielingMaterialAddon2ID] = useState([]);
  const [cielingMaterialAddon2_ID, setCielingMaterialAddon2_ID] = useState("");
  //
  const [floorMaterialID, setFloorMaterialID] = useState([]);
  const [floorMaterial_ID, setFloorMaterial_ID] = useState("");
  //
  const [airconditioningID, setAirconditioningID] = useState([]);
  const [airconditioning_ID, setAirconditioning_ID] = useState("");
  //
  const [utilityFactors, setUtilityFactors] = useState([]);
  const [selectedUtilityFactors, setSelectedUtilityFactors] = useState([]);

  //
  const [reception_SquareName, setReception_SquareName] = useState("");

  function ProgressPopup({ isOpen }) {
    if (!isOpen) return null;

    return (
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "rgba(0, 0, 0, 0.5)",
        }}
      >
        <div
          style={{
            padding: 20,
            backgroundColor: "white",
            borderRadius: "10px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <p>Submitting... Please wait.</p>
        </div>
      </div>
    );
  }

  //

  // here for wall color input and color pickup
  const [wallColor, setWallColor] = useState("");
  const [showColorPicker, setShowColorPicker] = useState(false);

  const handleColorChange = (color) => {
    setWallColor(color.hex);
  };

  const colorPickerRef = useRef();

  // Function to handle outside click
  const handleOutsideClick = (event) => {
    if (colorPickerRef.current && !colorPickerRef.current.contains(event.target)) {
      setShowColorPicker(false);
    }
  };

  // Add event listener when color picker is shown
  useEffect(() => {
    if (showColorPicker) {
      document.addEventListener("mousedown", handleOutsideClick);
    }

    // Cleanup
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [showColorPicker]);

  //
  const [length, setLength] = useState("");
  //
  const [percentage, setPercentage] = useState("");
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [one, setOne] = useState("");
  const [two, setTwo] = useState("");
  const [three, setThree] = useState("");
  const [four, setFour] = useState("");
  const [name, setName] = useState("");
  const [isGallery, setIsGallery] = useState(true);
  const [isAirConditioning, setIsAirConditioning] = useState(false);
  const [isCalculatable, setIsCalculatable] = useState(false);

  //here a States for form fields (form 3)
  const [Gallery_photo_description, setGallery_photo_description] = useState("");

  const [Gallery_photo_description_english, setGallery_photo_description_english] = useState("");
  const [design_code, setDesign_code] = useState("");
  const [english_name, setEnglish_name] = useState("");
  const [arabic_name, setArabic_name] = useState("");
  const [finishing_cost_Id, setFinishing_cost_Id] = useState("");
  const [finishing_style_Id, setFinishing_style_Id] = useState("");
  const [room_names_Id, setRoom_names_Id] = useState("");
  const [finishing_cost_Name, setFinishing_cost_Name] = useState("");
  const [finishing_style_Name, setFinishing_style_Name] = useState("");
  const [room_names_Name, setRoom_names_Name] = useState("");

  //   //here a States for form fields (form doors)

  const [doorMaterialID, setDoorMaterialID] = useState([]);
  const [doorMaterial_ID, setDoorMaterial_ID] = useState("");
  const [doorWidth, setDoorWidth] = useState("");
  const [doorHeight, setDoorHeight] = useState("");

  //   //here a States for form fields (form window)

  const [windowMaterialID, setWindowMaterialID] = useState([]);
  const [windowMaterial_ID, setWindowMaterial_ID] = useState("");
  const [windowAddonMaterialID, setWindowAddonMaterialID] = useState([]);
  const [windowAddonMaterial_ID, setWindowAddonMaterial_ID] = useState("");
  const [windowWidth, setWindowWidth] = useState("");
  const [windowHeight, setWindowHeight] = useState("");

  const encodedRoomNames = encodeURIComponent(room_names_Name);
  // Fetch Wall Material ID

  const fetchDecorationsData = useCallback(async () => {
    try {
      const response = await axios.get(
        `${MainUrl}home/decorations/?finishing_cost_name=${finishing_cost_Name}&finishing_style_name=${finishing_style_Name}&room_names_name=${encodedRoomNames}`
      );
      const data = response.data;

      // Filter Data By decoration_type and Update the State
      // wallMaterials
      const wallMaterials = data
        .filter((item) => item.decoration_type === "wall")
        .map((item) => ({
          id: item.id,
          label: item.name,
        }));
      setWallMaterialID(wallMaterials);

      // wallMaterialAddons1
      const wallMaterialAddons1 = data
        .filter((item) => item.decoration_type === "wall_addon")
        .map((item) => ({
          id: item.id,
          label: item.name,
        }));
      setWallMaterialAddon1ID(wallMaterialAddons1);

      // wallMaterialAddons2
      const wallMaterialAddons2 = data
        .filter((item) => item.decoration_type === "wall_addon")
        .map((item) => ({
          id: item.id,
          label: item.name,
        }));
      setWallMaterialAddon2ID(wallMaterialAddons2);

      // CielingMaterial
      const CielingMaterial = data
        .filter((item) => item.decoration_type === "ceiling")
        .map((item) => ({
          id: item.id,
          label: item.name,
        }));
      setCielingMaterialID(CielingMaterial);

      // CielingMaterialAddon1
      const CielingMaterialAddon1 = data
        .filter((item) => item.decoration_type === "ceiling_addon")
        .map((item) => ({
          id: item.id,
          label: item.name,
        }));
      setCielingMaterialAddon1ID(CielingMaterialAddon1);

      // CielingMaterialAddon2
      const CielingMaterialAddon2 = data
        .filter((item) => item.decoration_type === "ceiling_addon")
        .map((item) => ({
          id: item.id,
          label: item.name,
        }));
      setCielingMaterialAddon2ID(CielingMaterialAddon2);

      // CielingMaterialAddon2
      const FloorMaterials = data
        .filter((item) => item.decoration_type === "floor")
        .map((item) => ({
          id: item.id,
          label: item.name,
        }));
      setFloorMaterialID(FloorMaterials);

      const doorMaterials = data
        .filter((item) => item.decoration_type === "door")
        .map((item) => ({
          id: item.id,
          label: item.name,
        }));
      setDoorMaterialID(doorMaterials);

      const windowMaterials = data
        .filter((item) => item.decoration_type === "window")
        .map((item) => ({
          id: item.id,
          label: item.name,
        }));
      setWindowMaterialID(windowMaterials);

      const windowMaterialsAddon = data
        .filter((item) => item.decoration_type === "window_addon")
        .map((item) => ({
          id: item.id,
          label: item.name,
        }));
      setWindowAddonMaterialID(windowMaterialsAddon);
      // catch error
    } catch (error) {
      console.error("Failed to fetch decorations data", error);
    }
  }, [finishing_cost_Name, finishing_style_Name, room_names_Name]);

  // Invoke this function in your useEffect to fetch data when component mounts or any of the dependency changes
  useEffect(() => {
    if (finishing_cost_Id && finishing_style_Id && room_names_Id) {
      fetchDecorationsData();
    }
  }, [fetchDecorationsData]);

  //  handle change
  const handleChange = (setter) => (selectedOption) => {
    setter(selectedOption ? selectedOption.value : "");
  };

  // handle option
  const getOptions = (data) =>
    data.map(({ id, label }) => ({
      value: id,
      label: label,
    }));

  // koka

  // Fetch Airconditioning ID
  const fetchAirconditioningID = useCallback(async () => {
    try {
      const response = await axios.get(`${MainUrl}airconditions/all/`);
      const data = response.data.map((item) => ({
        id: item.id,
        label: item.english_name,
      }));
      setAirconditioningID(data);
    } catch (error) {
      console.error("Failed to fetch wall material IDs", error);
    }
  }, []);

  // Fetch Utility factors
  const fetchUtilityfactors = useCallback(async () => {
    try {
      const response = await axios.get(`${MainUrl}home/utility_factors/`, {
        headers: {
          accept: "application/json",
          Authorization: `Token ${token}`,
        },
      });
      const data = response.data;

      // Assuming encodedRoomNames is the room ID you want to match
      const roomID = parseInt(room_names_Id);

      // Filter utility factors based on room_names_Id
      const filteredData = data
        .filter((item) => item.room_names_Id === roomID)
        .map((item) => ({
          value: item.id,
          label: item.name,
        }));

      setUtilityFactors(filteredData);
    } catch (error) {
      console.error("Failed to fetch utility factors", error);
    }
  }, [encodedRoomNames]);

  const onSortEnd = ({ oldIndex, newIndex }) => {
    setSelectedUtilityFactors(arrayMoveImmutable(selectedUtilityFactors, oldIndex, newIndex));
  };
  // Handle change for the Select
  const onChange = (selectedOptions) => {
    setSelectedUtilityFactors(selectedOptions || []);
  };

  //
  useEffect(() => {
    if (finishing_cost_Id && finishing_style_Id && room_names_Id) {
      fetchAirconditioningID();
      fetchUtilityfactors();
    }
  }, [finishing_cost_Id, finishing_style_Id, room_names_Id]);

  useEffect(() => {
    const storedData = JSON.parse(localStorage.getItem("formData"));
    if (storedData) {
      setDesign_code(storedData.design_code || "");
      setEnglish_name(storedData.english_name || "");
      setArabic_name(storedData.arabic_name || "");
      setFinishing_cost_Id(storedData.finishing_cost_Id || "");
      setFinishing_cost_Name(storedData.finishing_cost_Name || "");
      setFinishing_style_Id(storedData.finishing_style_Id || "");
      setFinishing_style_Name(storedData.finishing_style_Name || "");
      setRoom_names_Id(storedData.room_names_Id || "");
      setRoom_names_Name(storedData.room_names_Name || "");
      setReception_SquareName(storedData.reception_SquareName || "");
    }
  }, []);

  // State to control current form display
  const [activeForm, setActiveForm] = useState("General");
  // const [currentForm, setCurrentForm] = useState(1);

  const handleTabClick = (tabName) => {
    setActiveForm(tabName); // This sets the active tab
  };

  const renderForm = () => {
    return (
      <div>
        <div style={{ display: activeForm === "General" ? "block" : "none" }}>{GeneralForm()}</div>
        <div style={{ display: activeForm === "Doors" ? "block" : "none" }}>{Doors()}</div>
        <div style={{ display: activeForm === "Windows" ? "block" : "none" }}>{Windows()}</div>
        <div style={{ display: activeForm === "Images" ? "block" : "none" }}>{Images()}</div>
      </div>
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);

    const isImageTooLarge = roomImages.some((image) => image.imageFile && image.imageFile.size > 1048576);
    if (isImageTooLarge) {
      setPopupMessage("Images Maximum 1MB Please Check Again");
      return; // Stop the submission if any image is too large
    }

    const dynamicDoors = doors.map((door) => ({
      height: door.doorHeight ? parseFloat(door.doorHeight) : 0,
      width: door.doorWidth ? parseFloat(door.doorWidth) : 0,
      doorMaterialID: door.doorMaterialID ? parseInt(door.doorMaterialID) : null,
    }));
    // .filter((door) => door.height && door.width && door.doorMaterialID);

    // Constructing dynamic windows array
    const dynamicWindows = windows
      .map((window) => ({
        height: window.windowHeight ? parseFloat(window.windowHeight) : 0,
        width: window.windowWidth ? parseFloat(window.windowWidth) : 0,
        windowMaterialID: window.windowMaterialID ? parseInt(window.windowMaterialID) : null,
        windowAddonMaterialID: window.windowAddonMaterialID ? parseInt(window.windowAddonMaterialID) : null,
      }))
      // .filter(
      //   (window) => window.height && window.width && window.windowMaterialID
      // )
      .map((window) => {
        const dynamicWindow = {
          height: window.height ? window.height : 0,
          width: window.width ? window.height : 0,
          windowMaterialID: window.windowMaterialID,
        };
        if (window.windowAddonMaterialID) {
          dynamicWindow.windowAddonMaterialID = window.windowAddonMaterialID;
        }
        return dynamicWindow;
      });

    const formattedImages = roomImages.map((img) => ({ image: img.imageFile }));

    try {
      // Construct your payload here from the state as previously outlined
      const payload = {
        doors: dynamicDoors,
        windows: dynamicWindows,
        images: formattedImages,
        design_code: design_code,
        english_name: english_name,
        arabic_name: arabic_name,
        percentage: percentage,
        height: height,
        wall_color: wallColor,
        isGallery: isGallery,
        isAirConditioning: isAirConditioning,
        Gallery_photo_description: Gallery_photo_description,
        Gallery_photo_description_english: Gallery_photo_description_english,
        wallMaterialID: wallMaterial_ID,
        wallMaterialAddon1ID: wallMaterialAddon1_ID,
        wallMaterialAddon2ID: wallMaterialAddon2_ID,
        cielingMaterialID: cielingMaterial_ID,
        cielingMaterialAddon1ID: cielingMaterialAddon1_ID,
        cielingMaterialAddon2ID: cielingMaterialAddon2_ID,
        floorMaterialID: floorMaterial_ID,
        finishing_cost_Id: finishing_cost_Id,
        finishing_style_Id: finishing_style_Id,
        room_names_Id: room_names_Id,
        utility_factors: selectedUtilityFactors.length > 0 ? selectedUtilityFactors.map((factor) => factor.value) : [],
      };

      if (one) payload.one = parseFloat(one);
      if (two) payload.two = parseFloat(two);
      if (three) payload.three = parseFloat(three);
      if (four) payload.four = parseFloat(four);
      if (length) payload.length = parseFloat(length);
      if (width) payload.width = parseFloat(width);

      const headers = {
        "Content-Type": "application/json",
        accept: "application/json",
        Authorization: `Token ${token}`,
      };

      // to send a POST request
      const response = await axios.post(`${MainUrl}home/rooms/`, payload, {
        headers,
      });

      // Optional: upload images or other post-submit actions here
      if (response.status === 200 || response.status === 201) {
        const roomId = response.data.id; // assuming the response contains the room ID
        // i add it here 06-02-25 to go to calculate room price api and calculate the room
        await axios.get(`https://dash.ogeedecor.com/home/calculate-room-price/${roomId}/`, { headers });
        await uploadRoomImages(roomId, roomImages); // call to upload images
        setPopupMessage("The room has been added successfully!");
        setTimeout(() => {
          history("/Rooms");
        }, 3000);
      } else {
        setPopupMessage("Room created but check response for image upload!");
      }
    } catch (error) {
      setPopupMessage("Failed to add room. Please update data!");
      console.error("Error submitting the form", error);
    } finally {
      setIsLoading(false);
      window.scrollTo(0, 0);
    }
  };

  const decodedRoomNames = decodeURIComponent(encodedRoomNames);

  const renderUtilityFactors = () => {
    if (decodedRoomNames === "Bathroom" || decodedRoomNames === "Kitchen" || decodedRoomNames === "laundry room") {
      return (
        <div className="Form_Box_SecondPage">
          <h3>Utility factors</h3>
          <SortableSelect
            react-sortable-hoc
            className="MultiSelect_Box_SecondPage"
            useDragHandle
            axis="xy"
            onSortEnd={onSortEnd}
            distance={4}
            getHelperDimensions={({ node }) => node.getBoundingClientRect()}
            isMulti
            options={utilityFactors}
            value={selectedUtilityFactors}
            onChange={onChange}
            components={{
              MultiValue: SortableMultiValue,
              MultiValueLabel: SortableMultiValueLabel,
            }}
            closeMenuOnSelect={false}
          />
        </div>
      );
    }
    return null;
  };

  // General Form
  const GeneralForm = () => {
    // form for L-shape
    if (reception_SquareName === "L-Shape") {
      return (
        <form className="Field_Container_SecondPage" onSubmit={handleSubmit}>
          {/* first line */}
          <div className="Form2_Contain_L1_SecondPage">
            {/* Length */}
            <div className="Form_Box_SecondPage">
              <div className="Form_Box_SecondPage">
                <h3>Height</h3>
                <input
                  type="number"
                  onChange={(e) => setHeight(e.target.value)}
                  className="InputForm2_SecondPage"
                  name="height"
                  value={height}
                  id="height"
                  required
                />
              </div>
            </div>
            {/* Percentage */}
            <div className="Form_Box_SecondPage">
              <h3>S1</h3>
              <input type="number" onChange={(e) => setOne(e.target.value)} className="InputForm2_SecondPage" name="one" value={one} id="one" required />
            </div>
            {/* Width */}
            <div className="Form_Box_SecondPage">
              <h3>S2</h3>
              <input type="number" onChange={(e) => setTwo(e.target.value)} value={two} name="two" id="two" className="InputForm2_SecondPage" required />
            </div>
          </div>
          {/* second line */}
          <div className="Form2_Contain_L1_SecondPage">
            <div className="Form_Box_SecondPage">
              <h3>S3</h3>
              <input
                type="number"
                onChange={(e) => setThree(e.target.value)}
                value={three}
                name="three"
                id="three"
                className="InputForm2_SecondPage"
                required
              />
            </div>
            <div className="Form_Box_SecondPage">
              <h3>S4</h3>
              <input type="number" onChange={(e) => setFour(e.target.value)} value={four} name="four" id="four" className="InputForm2_SecondPage" required />
            </div>
            {/* Wall color */}
            <div className="Form_Box_SecondPage">
              <h3>Correction Factor</h3>
              <input
                type="number"
                onChange={(e) => setPercentage(e.target.value)}
                className="InputForm2_SecondPage"
                name="percentage"
                value={percentage}
                id="percentage"
                required
              />
            </div>
          </div>
          {/* third line */}
          <div className="Form2_Contain_L1_SecondPage">
            {/* WallMaterialAddon1ID Api */}
            <div className="Form_Box_SecondPage">
              <h3>Wall color</h3>
              <input
                type="text"
                value={wallColor}
                onClick={() => setShowColorPicker((show) => !show)}
                onChange={(e) => setWallColor(e.target.value)}
                placeholder="Click to select color"
                className="InputForm2_SecondPage"
                required
              />
              {showColorPicker && (
                <div ref={colorPickerRef} className="ChromePicker">
                  <SketchPicker color={wallColor} onChangeComplete={handleColorChange} className="" />
                </div>
              )}
            </div>

            {/* WallMaterialAddon2ID Api */}
            <div className="Form_Box_SecondPage">
              <h3>Wall Material</h3>
              <Select
                className="Select_Box_SecondPage"
                value={wallMaterialID.find((option) => option.value === wallMaterial_ID)}
                onChange={handleChange(setWallMaterial_ID)}
                options={getOptions(wallMaterialID)}
                placeholder="Select...."
                isClearable
                required
              />
            </div>
            {/* CielingMaterialID Api */}
            <div className="Form_Box_SecondPage">
              <h3>Wall Addon 1</h3>
              <Select
                className="Select_Box_SecondPage"
                value={wallMaterialAddon1ID.find((option) => option.value === wallMaterialAddon1_ID)}
                isClearable
                onChange={handleChange(setWallMaterialAddon1_ID)}
                options={getOptions(wallMaterialAddon1ID)}
                placeholder="Select...."
                required
              />
            </div>
          </div>
          {/* fourth line */}
          <div className="Form2_Contain_L1_SecondPage">
            <div className="Form_Box_SecondPage">
              <h3>Wall Addon 2</h3>
              <Select
                className="Select_Box_SecondPage"
                value={wallMaterialAddon2ID.find((option) => option.value === wallMaterialAddon2_ID)}
                onChange={handleChange(setWallMaterialAddon2_ID)}
                options={getOptions(wallMaterialAddon2ID)}
                placeholder="Select...."
                isClearable
                required
              />
            </div>
            {/* CielingMaterialAddon2ID Api*/}
            <div className="Form_Box_SecondPage">
              <h3>Cieling Material</h3>
              <Select
                className="Select_Box_SecondPage"
                value={cielingMaterialID.find((option) => option.value === cielingMaterial_ID)}
                onChange={handleChange(setCielingMaterial_ID)}
                options={getOptions(cielingMaterialID)}
                placeholder="Select...."
                isClearable
                required
              />
            </div>
            {/* FloorMaterialID Api */}
            <div className="Form_Box_SecondPage">
              <h3>Cieling Addon 1</h3>
              <Select
                className="Select_Box_SecondPage"
                value={cielingMaterialAddon1ID.find((option) => option.value === cielingMaterialAddon1_ID)}
                onChange={handleChange(setCielingMaterialAddon1_ID)}
                options={getOptions(cielingMaterialAddon1ID)}
                placeholder="Select...."
                isClearable
                required
              />
            </div>
          </div>
          {/* fifth line */}
          <div className="Form2_Contain_L1_SecondPage">
            <div className="Form_Box_SecondPage">
              <h3>Cieling Addon 2</h3>
              <Select
                className="Select_Box_SecondPage"
                value={cielingMaterialAddon2ID.find((option) => option.value === cielingMaterialAddon2_ID)}
                onChange={handleChange(setCielingMaterialAddon2_ID)}
                options={getOptions(cielingMaterialAddon1ID)}
                placeholder="Select...."
                isClearable
                required
              />
            </div>
            {/* AirconditioningID Api */}

            <div className="Form_Box_SecondPage">
              <h3>Floor Material</h3>
              <Select
                className="Select_Box_SecondPage"
                value={floorMaterialID.find((option) => option.value === floorMaterial_ID)}
                onChange={handleChange(setFloorMaterial_ID)}
                options={getOptions(floorMaterialID)}
                placeholder="Select...."
                isClearable
                required
              />
            </div>

            {/* Utility factors */}

            {/*  */}
          </div>
          {/* sixth line */}
          <div className="Form2_Contain_L1_SecondPage">
            {/* Name Input */}
            <div className="Form_Box_SecondPage">
              <h3>Is Gallery</h3>
              <input
                id="isGallery"
                type="checkbox"
                checked={isGallery}
                onChange={(e) => setIsGallery(e.target.checked)}
                className="InputForm2_SecondPage"
                name="isGallery"
                required
              />
            </div>
            {/* AirconditioningID Api */}

            {/* Utility factors */}
            <div className="Form_Box_SecondPage">
              <h3>Include AC</h3>
              <input
                id="isAirConditioning"
                type="checkbox"
                name="isAirConditioning"
                checked={isAirConditioning}
                onChange={(e) => setIsAirConditioning(e.target.checked)}
                className="InputForm2_SecondPage"
              />
            </div>

            {/*  */}
          </div>
          <div className="Form2_Contain_L1_SecondPage">
            {/* Empty */}

            {/*  */}
          </div>
          <div className="Form2_Contain_L1_SecondPage">{renderUtilityFactors()}</div>

          {/*  */}
          <div className="Form2_Contain_L1_SecondPage">
            {/* Empty */}

            {/*  */}
          </div>
          {/* last */}
          <div className="Form2_Contain_L1_SecondPage">
            {/* Arabic Description */}
            <div className="Form_Box_SecondPage_TextArea">
              <h3>Arabic Description</h3>
              <ReactQuill
                value={Gallery_photo_description}
                onChange={setGallery_photo_description}
                placeholder="Write something..."
                theme="snow"
                modules={modules}
              />
            </div>

            {/* English Description */}
            <div className="Form_Box_SecondPage_TextArea">
              <h3>English Description</h3>
              <ReactQuill
                value={Gallery_photo_description_english}
                onChange={setGallery_photo_description_english}
                placeholder="Write something..."
                theme="snow"
                modules={modules}
              />
            </div>
          </div>
          {/* buttons next and back */}
          <div className="Button_Box">
            <button
              type="button"
              className="B_Button_SecondPage"
              onClick={() => {
                window.location.href = "/Addrooms";
              }}
            >
              Back
            </button>
            <button type="submit" className="N_Button_SecondPage">
              submit
            </button>
          </div>
        </form>
      );
    }
    // form for Sq-shape
    else if (reception_SquareName === "Sq-Shape") {
      return (
        <>
          <form className="Field_Container_SecondPage" onSubmit={handleSubmit}>
            {/* first line */}
            <div className="Form2_Contain_L1_SecondPage">
              {/* Length */}
              <div className="Form_Box_SecondPage">
                <div className="Form_Box_SecondPage">
                  <h3>Height</h3>
                  <input
                    type="number"
                    onChange={(e) => setHeight(e.target.value)}
                    className="InputForm2_SecondPage"
                    name="height"
                    value={height}
                    id="height"
                    required
                  />
                </div>
              </div>
              {/* Percentage */}
              <div className="Form_Box_SecondPage">
                <h3>Width</h3>
                <input
                  type="number"
                  onChange={(e) => setWidth(e.target.value)}
                  className="InputForm2_SecondPage"
                  name="width"
                  value={width}
                  id="width"
                  required
                />
              </div>
              {/* Width */}
              <div className="Form_Box_SecondPage">
                <h3>Length</h3>
                <input
                  type="number"
                  onChange={(e) => setLength(e.target.value)}
                  value={length}
                  name="length"
                  id="length"
                  className="InputForm2_SecondPage"
                  required
                />
              </div>
            </div>
            {/* second line */}
            <div className="Form2_Contain_L1_SecondPage">
              {/* Wall color */}
              <div className="Form_Box_SecondPage">
                <h3>Correction Factor</h3>
                <input
                  type="number"
                  onChange={(e) => setPercentage(e.target.value)}
                  className="InputForm2_SecondPage"
                  name="percentage"
                  value={percentage}
                  id="percentage"
                  required
                />
              </div>
            </div>
            {/* third line */}
            <div className="Form2_Contain_L1_SecondPage">
              {/* WallMaterialAddon1ID Api */}
              <div className="Form_Box_SecondPage">
                <h3>Wall color</h3>
                <input
                  type="text"
                  value={wallColor}
                  onClick={() => setShowColorPicker((show) => !show)}
                  onChange={(e) => setWallColor(e.target.value)}
                  placeholder="Click to select color"
                  className="InputForm2_SecondPage"
                  required
                />
                {showColorPicker && (
                  <div ref={colorPickerRef} className="ChromePicker">
                    <SketchPicker color={wallColor} onChangeComplete={handleColorChange} className="" />
                  </div>
                )}
              </div>

              {/* WallMaterialAddon2ID Api */}
              <div className="Form_Box_SecondPage">
                <h3>Wall Material</h3>
                <Select
                  className="Select_Box_SecondPage"
                  value={wallMaterialID.find((option) => option.value === wallMaterial_ID)}
                  onChange={handleChange(setWallMaterial_ID)}
                  options={getOptions(wallMaterialID)}
                  placeholder="Select...."
                  isClearable
                  required
                />
              </div>
              {/* CielingMaterialID Api */}
              <div className="Form_Box_SecondPage">
                <h3>Wall Addon 1</h3>

                <Select
                  className="Select_Box_SecondPage"
                  value={wallMaterialAddon1ID.find((option) => option.value === wallMaterialAddon1_ID)}
                  isClearable
                  onChange={handleChange(setWallMaterialAddon1_ID)}
                  options={getOptions(wallMaterialAddon1ID)}
                  placeholder="Select...."
                  required
                />
              </div>
            </div>
            {/* fourth line */}
            <div className="Form2_Contain_L1_SecondPage">
              <div className="Form_Box_SecondPage">
                <h3>Wall Addon 2</h3>
                <Select
                  className="Select_Box_SecondPage"
                  value={wallMaterialAddon2ID.find((option) => option.value === wallMaterialAddon2_ID)}
                  onChange={handleChange(setWallMaterialAddon2_ID)}
                  options={getOptions(wallMaterialAddon2ID)}
                  placeholder="Select...."
                  isClearable
                  required
                />
              </div>
              {/* CielingMaterialAddon2ID Api*/}
              <div className="Form_Box_SecondPage">
                <h3>Cieling Material</h3>
                <Select
                  className="Select_Box_SecondPage"
                  value={cielingMaterialID.find((option) => option.value === cielingMaterial_ID)}
                  onChange={handleChange(setCielingMaterial_ID)}
                  options={getOptions(cielingMaterialID)}
                  placeholder="Select...."
                  isClearable
                  required
                />
              </div>
              {/* FloorMaterialID Api */}
              <div className="Form_Box_SecondPage">
                <h3>Cieling Addon 1</h3>
                <Select
                  className="Select_Box_SecondPage"
                  value={cielingMaterialAddon1ID.find((option) => option.value === cielingMaterialAddon1_ID)}
                  onChange={handleChange(setCielingMaterialAddon1_ID)}
                  options={getOptions(cielingMaterialAddon1ID)}
                  placeholder="Select...."
                  isClearable
                  required
                />
              </div>
            </div>
            {/* fifth line */}
            <div className="Form2_Contain_L1_SecondPage">
              <div className="Form_Box_SecondPage">
                <h3>Cieling Addon 2</h3>
                <Select
                  className="Select_Box_SecondPage"
                  value={cielingMaterialAddon2ID.find((option) => option.value === cielingMaterialAddon2_ID)}
                  onChange={handleChange(setCielingMaterialAddon2_ID)}
                  options={getOptions(cielingMaterialAddon1ID)}
                  placeholder="Select...."
                  isClearable
                  required
                />
              </div>
              {/* AirconditioningID Api */}

              <div className="Form_Box_SecondPage">
                <h3>Floor Material</h3>

                <Select
                  className="Select_Box_SecondPage"
                  value={floorMaterialID.find((option) => option.value === floorMaterial_ID)}
                  onChange={handleChange(setFloorMaterial_ID)}
                  options={getOptions(floorMaterialID)}
                  placeholder="Select...."
                  isClearable
                  required
                />
              </div>
              {/*  */}
            </div>
            {/* sixth line */}
            <div className="Form2_Contain_L1_SecondPage">
              {/* Name Input */}
              <div className="Form_Box_SecondPage">
                <h3>Is Gallery</h3>
                <input
                  id="isGallery"
                  type="checkbox"
                  checked={isGallery}
                  onChange={(e) => setIsGallery(e.target.checked)}
                  className="InputForm2_SecondPage"
                  name="isGallery"
                  required
                />
              </div>
              {/* AirconditioningID Api */}

              {/* Utility factors */}
              <div className="Form_Box_SecondPage">
                <h3>Include AC</h3>
                <input
                  id="isAirConditioning"
                  type="checkbox"
                  name="isAirConditioning"
                  checked={isAirConditioning}
                  onChange={(e) => setIsAirConditioning(e.target.checked)}
                  className="InputForm2_SecondPage"
                />
              </div>

              {/*  */}
            </div>
            <div className="Form2_Contain_L1_SecondPage">
              {/* Empty */}

              {/*  */}
            </div>
            <div className="Form2_Contain_L1_SecondPage">{renderUtilityFactors()}</div>

            {/*  */}
            <div className="Form2_Contain_L1_SecondPage">
              {/* Empty */}

              {/*  */}
            </div>
            {/* last */}
            <div className="Form2_Contain_L1_SecondPage">
              {/* Arabic Description */}
              <div className="Form_Box_SecondPage_TextArea">
                <h3>Arabic Description</h3>
                <ReactQuill
                  value={Gallery_photo_description}
                  onChange={setGallery_photo_description}
                  placeholder="Write something..."
                  theme="snow"
                  modules={modules}
                />
              </div>

              {/* English Description */}
              <div className="Form_Box_SecondPage_TextArea">
                <h3>English Description</h3>
                <ReactQuill
                  value={Gallery_photo_description_english}
                  onChange={setGallery_photo_description_english}
                  placeholder="Write something..."
                  theme="snow"
                  modules={modules}
                />
              </div>
            </div>
            {/* buttons next and back */}
            <div className="Button_Box">
              <button
                type="button"
                className="B_Button_SecondPage"
                onClick={() => {
                  window.location.href = "/Addrooms";
                }}
              >
                Back
              </button>
              <button type="submit" className="N_Button_SecondPage">
                submit
              </button>
            </div>
          </form>
        </>
      );
    }
    // form for normal
    else {
      return (
        <>
          <form className="Field_Container_SecondPage" onSubmit={handleSubmit}>
            {/* first line */}
            <div className="Form2_Contain_L1_SecondPage">
              {/* Length */}
              <div className="Form_Box_SecondPage">
                <div className="Form_Box_SecondPage">
                  <h3>Height</h3>
                  <input
                    type="number"
                    onChange={(e) => setHeight(e.target.value)}
                    className="InputForm2_SecondPage"
                    name="height"
                    value={height}
                    id="height"
                    required
                  />
                </div>
              </div>
              {/* Percentage */}
              <div className="Form_Box_SecondPage">
                <h3>Width</h3>
                <input
                  type="number"
                  onChange={(e) => setWidth(e.target.value)}
                  className="InputForm2_SecondPage"
                  name="width"
                  value={width}
                  id="width"
                  required
                />
              </div>
              {/* Width */}
              <div className="Form_Box_SecondPage">
                <h3>Length</h3>
                <input
                  type="number"
                  onChange={(e) => setLength(e.target.value)}
                  value={length}
                  name="length"
                  id="length"
                  className="InputForm2_SecondPage"
                  required
                />
              </div>
            </div>
            {/* second line */}
            <div className="Form2_Contain_L1_SecondPage">
              {/* Wall color */}
              <div className="Form_Box_SecondPage">
                <h3>Correction Factor</h3>
                <input
                  type="number"
                  onChange={(e) => setPercentage(e.target.value)}
                  className="InputForm2_SecondPage"
                  name="percentage"
                  value={percentage}
                  id="percentage"
                  required
                />
              </div>
            </div>
            {/* third line */}
            <div className="Form2_Contain_L1_SecondPage">
              {/* WallMaterialAddon1ID Api */}
              <div className="Form_Box_SecondPage">
                <h3>Wall color</h3>
                <input
                  type="text"
                  value={wallColor}
                  onClick={() => setShowColorPicker((show) => !show)}
                  onChange={(e) => setWallColor(e.target.value)}
                  placeholder="Click to select color"
                  className="InputForm2_SecondPage"
                  required
                />
                {showColorPicker && (
                  <div ref={colorPickerRef} className="ChromePicker">
                    <SketchPicker color={wallColor} onChangeComplete={handleColorChange} className="" />
                  </div>
                )}
              </div>

              {/* WallMaterialAddon2ID Api */}
              <div className="Form_Box_SecondPage">
                <h3>Wall Material</h3>
                <Select
                  className="Select_Box_SecondPage"
                  value={wallMaterialID.find((option) => option.value === wallMaterial_ID)}
                  onChange={handleChange(setWallMaterial_ID)}
                  options={getOptions(wallMaterialID)}
                  placeholder="Select...."
                  isClearable
                  required
                />
              </div>
              {/* CielingMaterialID Api */}
              <div className="Form_Box_SecondPage">
                <h3>Wall Addon 1</h3>

                <Select
                  className="Select_Box_SecondPage"
                  value={wallMaterialAddon1ID.find((option) => option.value === wallMaterialAddon1_ID)}
                  isClearable
                  onChange={handleChange(setWallMaterialAddon1_ID)}
                  options={getOptions(wallMaterialAddon1ID)}
                  placeholder="Select...."
                  required
                />
              </div>
            </div>
            {/* fourth line */}
            <div className="Form2_Contain_L1_SecondPage">
              <div className="Form_Box_SecondPage">
                <h3>Wall Addon 2</h3>
                <Select
                  className="Select_Box_SecondPage"
                  value={wallMaterialAddon2ID.find((option) => option.value === wallMaterialAddon2_ID)}
                  onChange={handleChange(setWallMaterialAddon2_ID)}
                  options={getOptions(wallMaterialAddon2ID)}
                  placeholder="Select...."
                  isClearable
                  required
                />
              </div>
              {/* CielingMaterialAddon2ID Api*/}
              <div className="Form_Box_SecondPage">
                <h3>Cieling Material</h3>
                <Select
                  className="Select_Box_SecondPage"
                  value={cielingMaterialID.find((option) => option.value === cielingMaterial_ID)}
                  onChange={handleChange(setCielingMaterial_ID)}
                  options={getOptions(cielingMaterialID)}
                  placeholder="Select...."
                  isClearable
                  required
                />
              </div>
              {/* FloorMaterialID Api */}
              <div className="Form_Box_SecondPage">
                <h3>Cieling Addon 1</h3>
                <Select
                  className="Select_Box_SecondPage"
                  value={cielingMaterialAddon1ID.find((option) => option.value === cielingMaterialAddon1_ID)}
                  onChange={handleChange(setCielingMaterialAddon1_ID)}
                  options={getOptions(cielingMaterialAddon1ID)}
                  placeholder="Select...."
                  isClearable
                  required
                />
              </div>
            </div>
            {/* fifth line */}
            <div className="Form2_Contain_L1_SecondPage">
              <div className="Form_Box_SecondPage">
                <h3>Cieling Addon 2</h3>
                <Select
                  className="Select_Box_SecondPage"
                  value={cielingMaterialAddon2ID.find((option) => option.value === cielingMaterialAddon2_ID)}
                  onChange={handleChange(setCielingMaterialAddon2_ID)}
                  options={getOptions(cielingMaterialAddon1ID)}
                  placeholder="Select...."
                  isClearable
                  required
                />
              </div>
              {/* AirconditioningID Api */}

              <div className="Form_Box_SecondPage">
                <h3>Floor Material</h3>

                <Select
                  className="Select_Box_SecondPage"
                  value={floorMaterialID.find((option) => option.value === floorMaterial_ID)}
                  onChange={handleChange(setFloorMaterial_ID)}
                  options={getOptions(floorMaterialID)}
                  placeholder="Select...."
                  isClearable
                  required
                />
              </div>
              {/*  */}
            </div>
            {/* sixth line */}
            <div className="Form2_Contain_L1_SecondPage">
              {/* Name Input */}
              <div className="Form_Box_SecondPage">
                <h3>Is Gallery</h3>
                <input
                  id="isGallery"
                  type="checkbox"
                  checked={isGallery}
                  onChange={(e) => setIsGallery(e.target.checked)}
                  className="InputForm2_SecondPage"
                  name="isGallery"
                  required
                />
              </div>
              {/* AirconditioningID Api */}

              {/* Utility factors */}
              <div className="Form_Box_SecondPage">
                <h3>Include AC</h3>
                <input
                  id="isAirConditioning"
                  type="checkbox"
                  name="isAirConditioning"
                  checked={isAirConditioning}
                  onChange={(e) => setIsAirConditioning(e.target.checked)}
                  className="InputForm2_SecondPage"
                />
              </div>

              {/*  */}
            </div>
            <div className="Form2_Contain_L1_SecondPage">
              {/* Empty */}

              {/*  */}
            </div>
            <div className="Form2_Contain_L1_SecondPage">{renderUtilityFactors()}</div>

            {/*  */}
            <div className="Form2_Contain_L1_SecondPage">
              {/* Empty */}

              {/*  */}
            </div>
            {/* last */}
            <div className="Form2_Contain_L1_SecondPage">
              {/* Arabic Description */}
              <div className="Form_Box_SecondPage_TextArea">
                <h3>Arabic Description</h3>
                <ReactQuill
                  value={Gallery_photo_description}
                  onChange={setGallery_photo_description}
                  placeholder="Write something..."
                  theme="snow"
                  modules={modules}
                />
              </div>

              {/* English Description */}
              <div className="Form_Box_SecondPage_TextArea">
                <h3>English Description</h3>
                <ReactQuill
                  value={Gallery_photo_description_english}
                  onChange={setGallery_photo_description_english}
                  placeholder="Write something..."
                  theme="snow"
                  modules={modules}
                />
              </div>
            </div>
            {/* buttons next and back */}
            <div className="Button_Box">
              <button
                type="button"
                className="B_Button_SecondPage"
                onClick={() => {
                  window.location.href = "/Addrooms";
                }}
              >
                Back
              </button>
              <button type="submit" className="N_Button_SecondPage">
                submit
              </button>
            </div>
          </form>
        </>
      );
    }
  };

  //  Doors Form
  const Doors = () => {
    return (
      <>
        {/*  */}
        <form className="Doors_Container">
          <div className="Doors_Head_Container">
            <div className="Doors_Head">Door Material</div>
            <div className="Doors_Head">Width</div>
            <div className="Doors_Head">Height</div>
            <div className="Doors_Head">Delete?</div>
          </div>
          {/*  */}
          {doors.map((door, index) => (
            <div className="Doors_Buttons_Container" key={`door-${index}`}>
              <div className="Form_Box_Doors">
                <Select
                  className="Select_Box_Doors"
                  value={doorMaterialID.find((option) => option.value === door.doorMaterialID)}
                  onChange={(selectedOption) => handleDoorMaterialChange(selectedOption, index)}
                  options={getOptions(doorMaterialID)}
                  placeholder="Select...."
                  isClearable
                />
              </div>
              <div className="Form_Box_Doors">
                <input
                  type="number"
                  value={door.doorWidth}
                  onChange={(e) => updateDoorField(index, "doorWidth", e.target.value)}
                  className="InputForm2_SecondPage"
                />
              </div>
              <div className="Form_Box_Doors">
                <input
                  type="number"
                  value={door.doorHeight}
                  onChange={(e) => updateDoorField(index, "doorHeight", e.target.value)}
                  className="InputForm2_SecondPage"
                />
              </div>
              <div className="Form_Button_Doors">
                <button type="button" className="Door_Button_Remove" onClick={() => removeDoor(index)}>
                  Remove
                </button>
              </div>
              <div></div>
            </div>
          ))}
          <div className="Doors_End_Container">
            <button type="button" className="Door_Button_Add" onClick={addDoor}>
              Add Door
            </button>
          </div>
        </form>
      </>
    );
  };

  // Windows Form
  const Windows = () => {
    return (
      <>
        {/*  */}
        <form className="Doors_Container">
          <div className="Doors_Head_Container">
            <div className="Doors_Head">Window Material</div>
            <div className="Doors_Head">Window Addon</div>
            <div className="Doors_Head">Width</div>
            <div className="Doors_Head">Height</div>
            <div className="Doors_Head">Delete?</div>
          </div>
          {/*  */}
          {windows.map((window, indexWindow) => (
            <div className="Windows_Buttons_Container" key={`window-${indexWindow}`}>
              <div className="Form_Box_Doors">
                <Select
                  className="Select_Box_Doors"
                  value={windowMaterialID.find((option) => option.value === windowMaterial_ID)}
                  onChange={(selectedOption) => handleWindowMaterialChange(selectedOption, indexWindow)}
                  options={getOptions(windowMaterialID)}
                  placeholder="Select...."
                  isClearable
                />
              </div>
              <div className="Form_Box_Doors">
                <Select
                  className="Select_Box_Doors"
                  value={windowAddonMaterialID.find((option) => option.value === windowAddonMaterial_ID)}
                  onChange={(selectedOption) => handleAddonWindowMaterialChange(selectedOption, indexWindow)}
                  options={getOptions(windowAddonMaterialID)}
                  placeholder="Select...."
                  isClearable
                />
              </div>
              <div className="Form_Box_Doors">
                <input
                  type="number"
                  value={window.windowWidth}
                  onChange={(e) => updateWindowField(indexWindow, "windowWidth", e.target.value)}
                  className="InputForm2_SecondPage"
                />
              </div>
              <div className="Form_Box_Doors">
                <input
                  type="number"
                  value={window.windowHeight}
                  onChange={(e) => updateWindowField(indexWindow, "windowHeight", e.target.value)}
                  className="InputForm2_SecondPage"
                />
              </div>
              <div className="Form_Button_Doors">
                <button type="button" className="Door_Button_Remove" onClick={() => removeWindow(indexWindow)}>
                  Remove
                </button>
              </div>
              <div></div>
            </div>
          ))}
          <div className="Doors_End_Container">
            <button type="button" className="Door_Button_Add" onClick={addWindow}>
              Add window
            </button>
          </div>
        </form>
      </>
    );
  };

  // RoomImages Form
  const Images = () => {
    return (
      <>
        <ProgressPopup isOpen={isCompressing} />
        <form className="Doors_Container">
          <div className="Images_Head_Container">
            <div className="Images_Head">Image Max 1 MB</div>
            <div className="Images_Head">Preview</div>
            <div className="Images_Head">Delete?</div>
          </div>
          {/*  */}
          {roomImages.map((_, index) => (
            <div className="Images_Buttons_Container" key={`roomImage-${index}`}>
              <div className="Form_Images_Box">
                <input className="Input_Images" type="file" onChange={(e) => handleRoomImageChange(e, index)} accept="image/*" />
              </div>
              <div className="Form_Images_Box_Preivew">
                {roomImagePreviews[index] && <img src={roomImagePreviews[index]} alt="Room Preview" style={{ width: "150px", height: "150px" }} />}
              </div>

              <div className="Form_Images_Box">
                <button type="button" className="Images_Button_Remove" onClick={() => removeRoomImage(index)}>
                  Remove
                </button>
              </div>
              <div></div>
            </div>
          ))}
          <div className="Images_End_Container">
            <button type="button" className="Images_Button_Add" onClick={addRoomImage}>
              Add image
            </button>
          </div>
        </form>
      </>
    );
  };

  // To Return Forms
  return (
    <>
      <div className="Container_SecondPage">
        <div className="Add_UserLogged">
          <UserLogged />
        </div>
        <div className="Details_Head_Container">
          <div className="Add_Room_SecondPage">Add Room</div>
          <div className="Details_Path_Container">
            <Link to="/">Home</Link>
            <h4>&gt;</h4>
            <Link to="/Rooms">Rooms</Link>
            <h4>&gt;</h4>
            <Link to="/AddRooms">Add Rooms</Link>
            <h4>&gt;</h4>

            <h4>Rooms Details</h4>
          </div>
        </div>
        <div className="SecondPage_Container">
          <div className="SecondPage_Taps">
            {["General", "Doors", "Windows", "Images"].map((tabName) => (
              <a key={tabName} className={`Taps_Container ${activeForm === tabName ? "active" : ""}`} role="tab" onClick={() => handleTabClick(tabName)}>
                {tabName}
              </a>
            ))}
          </div>
          <div> {renderForm()}</div>
        </div>
      </div>
      {popupMessage && <Popup message={popupMessage} onClose={() => setPopupMessage("")} />}
    </>
  );
}

export default AddRoomsDetailsContent;
