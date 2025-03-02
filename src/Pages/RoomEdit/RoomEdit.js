import React, { useState, useEffect, useCallback, useRef } from "react";
import "./RoomEdit.css";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import Select, { components } from "react-select";
import { useAuth } from "../../Assets/components/Auth/AuthContext";
import { SketchPicker } from "react-color";
import UserLogged from "../../Assets/components/Menu/userLogged/userLogged";
import imageCompression from "browser-image-compression";
import { ToastContainer } from "react-toastify";
import { MainUrl } from "../../config";
import { SortableContainer, SortableElement, SortableHandle } from "react-sortable-hoc";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

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

function EditRoomContent() {
  const modules = {
    toolbar: [
      [{ header: "1" }, { header: "2" }, { font: [] }],
      [{ size: [] }],
      ["bold", "italic", "underline", "strike", "blockquote"],
      [{ list: "ordered" }, { list: "bullet" }, { indent: "-1" }, { indent: "+1" }],
      ["link", "image"],
      ["clean"],
    ],
  };

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
  const SortableSelect = SortableContainer(Select);

  const SortableMultiValueLabel = SortableHandle((props) => <components.MultiValueLabel {...props} />);

  const SortableMultiValue = SortableElement((props) => {
    const onMouseDown = (e) => {
      e.preventDefault();
      e.stopPropagation();
    };
    const innerProps = { ...props.innerProps, onMouseDown };
    return <components.MultiValue {...props} innerProps={innerProps} />;
  });
  const { id } = useParams();
  const history = useNavigate();
  const [popupMessage, setPopupMessage] = useState("");
  const [roomData, setRoomData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeForm, setActiveForm] = useState("General");
  const [isUploading, setIsUploading] = useState(false);
  const [designCode, setDesignCode] = useState("");
  const [englishName, setEnglishName] = useState("");
  const [arabicName, setArabicName] = useState("");
  const [finishingCosts, setFinishingCosts] = useState([]);
  const [finishingStyles, setFinishingStyles] = useState([]);
  const [roomNames, setRoomNames] = useState([]);
  const [height, setHeight] = useState("");
  const [width, setWidth] = useState("");
  const [length, setLength] = useState("");
  const [percentage, setPercentage] = useState("");
  const [wallMaterials, setWallMaterials] = useState([]);
  const [selectedWallMaterial, setSelectedWallMaterial] = useState(null);
  const [floorMaterial, setFloorMaterial] = useState([]);
  const [selectedFloorMaterial, setSelectedFloorMaterial] = useState(null);
  const [wallMaterialAddon1, setWallMaterialAddon1] = useState([]);
  const [selectedWallMaterialAddon1, setSelectedWallMaterialAddon1] = useState(null);
  const [wallMaterialAddon2, setWallMaterialAddon2] = useState([]);
  const [selectedWallMaterialAddon2, setSelectedWallMaterialAddon2] = useState(null);
  const [cielingMaterial, setCielingMaterial] = useState([]);
  const [selectedCielingMaterial, setSelectedCielingMaterial] = useState(null);
  const [cielingMaterialAddon1, setCielingMaterialAddon1] = useState([]);
  const [selectedCielingMaterialAddon1, setSelectedCielingMaterialAddon1] = useState(null);
  const [cielingMaterialAddon2, setCielingMaterialAddon2] = useState([]);
  const [selectedCielingMaterialAddon2, setSelectedCielingMaterialAddon2] = useState(null);
  const [isCalculatable, setIsCalculatable] = useState();
  const [isAirConditioning, setIsAirConditioning] = useState(false);
  const [airConditioningOptions, setAirConditioningOptions] = useState([]);
  const [selectedAirConditioning, setSelectedAirConditioning] = useState(null);
  const [utilityFactors, setUtilityFactors] = useState([]);
  const [selectedUtilityFactors, setSelectedUtilityFactors] = useState([]);
  const [englishDescription, setEnglishDescription] = useState("");
  const [arabicDescription, setArabicDescription] = useState("");
  const [doors, setDoors] = useState([]);
  const [doorMaterialIDOptions, setDoorMaterialIDOptions] = useState([]);
  const [selectedDoorMaterial, setSelectedDoorMaterial] = useState(null);
  const [doorHeight, setDoorHeight] = useState("");
  const [doorWidth, setDoorWidth] = useState("");

  const [windows, setWindows] = useState([]);
  const [windowsMaterialIDOptions, setWindowsMaterialIDOptions] = useState([]);
  const [selectedWindowsMaterial, setSelectedWindowsMaterial] = useState(null);
  const [windowsMaterialAddonIDOptions, setWindowsMaterialAddonIDOptions] = useState([]);
  const [selectedWindowsMaterialAddon, setSelectedWindowsMaterialAddon] = useState(null);
  const [windowsHeight, setWindowsHeight] = useState("");
  const [windowsWidth, setWindowsWidth] = useState("");

  const [roomImages, setRoomImages] = useState([{ imageFile: null }]);
  const [roomShape, setRoomShape] = useState("");

  const [selectedFinishingCost, setSelectedFinishingCost] = useState(null);
  const [selectedFinishingStyle, setSelectedFinishingStyle] = useState(null);
  const [selectedRoomNames, setSelectedRoomNames] = useState(null);

  const [one, setOne] = useState("");
  const [two, setTwo] = useState("");
  const [three, setThree] = useState("");
  const [four, setFour] = useState("");

  // for delete window , door , color

  const [pendingDoorDeletions, setPendingDoorDeletions] = useState([]);
  const [pendingWindowDeletions, setPendingWindowDeletions] = useState([]);
  const [pendingImageDeletions, setPendingImageDeletions] = useState([]);

  // for wall color
  const [wallColor, setWallColor] = useState("");
  const [showColorPicker, setShowColorPicker] = useState(false);
  const colorPickerRef = useRef();
  const handleColorChange = (color) => {
    setWallColor(color.hex);
  };

  const handleOutsideClick = (event) => {
    if (colorPickerRef.current && !colorPickerRef.current.contains(event.target)) {
      setShowColorPicker(false);
    }
  };

  useEffect(() => {
    if (showColorPicker) {
      document.addEventListener("mousedown", handleOutsideClick);
    }

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [showColorPicker]);
  //

  const finishingCostName = selectedFinishingCost ? selectedFinishingCost.label : "";
  const finishingStyleName = selectedFinishingStyle ? selectedFinishingStyle.label : "";
  const roomNamesName = selectedRoomNames ? selectedRoomNames.label : "";

  const { token } = useAuth();
  const fetchData = async () => {
    setIsLoading(true);
    try {
      if (!token) {
        history("/login");
        console.log("No token found");
        return;
      }

      const fetchRoomsPage = async (url) => {
        const response = await axios.get(url, {
          headers: {
            accept: "application/json",
            Authorization: `Token ${token}`,
          },
        });
        return response.data;
      };

      let nextPage = `${MainUrl}home/rooms/gallery-rooms/`;
      let specificRoom = null;

      while (nextPage) {
        const data = await fetchRoomsPage(nextPage);

        specificRoom = data.results.find((room) => room.id === parseInt(id));
        if (specificRoom) break;

        nextPage = data.next;
      }

      if (!specificRoom) {
        setError("Room not found");
        setRoomData(null);
        setIsLoading(false);
        return;
      }

      setRoomData(specificRoom);
      setDesignCode(specificRoom.design_code);
      setEnglishName(specificRoom.english_name || "");
      setArabicName(specificRoom.arabic_name || "");
      setEnglishDescription(specificRoom.Gallery_photo_description_english || "");
      setArabicDescription(specificRoom.Gallery_photo_description || "");
      setWindows(specificRoom.windows || []);

      const imageUrls = specificRoom.images.map((img) => ({
        imageUrl: img.image,
        isNew: false,
        id: img.id,
      }));
      setRoomImages(imageUrls);

      const {
        finishing_cost_Id,
        finishing_style_Id,
        room_names_Id,
        wallMaterial,
        wallMaterialAddon1,
        wallMaterialAddon2,
        cielingMaterial,
        cielingMaterialAddon1,
        cielingMaterialAddon2,
        floorMaterial,
      } = specificRoom;

      const [
        wallMaterialsResponse,
        wallAddon1Response,
        wallAddon2Response,
        cielingMaterialResponse,
        cielingMaterialAddon1Response,
        cielingMaterialAddon2Response,
        floorMaterialResponse,
      ] = await Promise.all([
        axios.get(`${MainUrl}home/decorations/`, {
          params: {
            decoration_type: "wall",
            finishing_cost_id: finishing_cost_Id,
            finishing_style_id: finishing_style_Id,
            room_names_id: room_names_Id,
          },
        }),
        axios.get(`${MainUrl}home/decorations/`, {
          params: {
            decoration_type: "wall_addon",
            finishing_cost_id: finishing_cost_Id,
            finishing_style_id: finishing_style_Id,
            room_names_id: room_names_Id,
          },
        }),
        axios.get(`${MainUrl}home/decorations/`, {
          params: {
            decoration_type: "wall_addon",
            finishing_cost_id: finishing_cost_Id,
            finishing_style_id: finishing_style_Id,
            room_names_id: room_names_Id,
          },
        }),
        axios.get(`${MainUrl}home/decorations/`, {
          params: {
            decoration_type: "ceiling",
            finishing_cost_id: finishing_cost_Id,
            finishing_style_id: finishing_style_Id,
            room_names_id: room_names_Id,
          },
        }),
        axios.get(`${MainUrl}home/decorations/`, {
          params: {
            decoration_type: "ceiling_addon",
            finishing_cost_id: finishing_cost_Id,
            finishing_style_id: finishing_style_Id,
            room_names_id: room_names_Id,
          },
        }),
        axios.get(`${MainUrl}home/decorations/`, {
          params: {
            decoration_type: "ceiling_addon",
            finishing_cost_id: finishing_cost_Id,
            finishing_style_id: finishing_style_Id,
            room_names_id: room_names_Id,
          },
        }),
        axios.get(`${MainUrl}home/decorations/`, {
          params: {
            decoration_type: "floor",
            finishing_cost_id: finishing_cost_Id,
            finishing_style_id: finishing_style_Id,
            room_names_id: room_names_Id,
          },
        }),
      ]);

      setSelectedWallMaterial(
        wallMaterialsResponse.data
          .map((item) => ({
            value: item.id,
            label: item.name,
          }))
          .find((wm) => wm.value === wallMaterial?.id) || null
      );
      setSelectedWallMaterialAddon1(
        wallAddon1Response.data
          .map((item) => ({
            value: item.id,
            label: item.name,
          }))
          .find((wm) => wm.value === wallMaterialAddon1?.id) || null
      );
      setSelectedWallMaterialAddon2(
        wallAddon2Response.data
          .map((item) => ({
            value: item.id,
            label: item.name,
          }))
          .find((wm) => wm.value === wallMaterialAddon2?.id) || null
      );
      setSelectedCielingMaterial(
        cielingMaterialResponse.data
          .map((item) => ({
            value: item.id,
            label: item.name,
          }))
          .find((cm) => cm.value === cielingMaterial?.id) || null
      );
      setSelectedCielingMaterialAddon1(
        cielingMaterialAddon1Response.data
          .map((item) => ({
            value: item.id,
            label: item.name,
          }))
          .find((cm) => cm.value === cielingMaterialAddon1?.id) || null
      );
      setSelectedCielingMaterialAddon2(
        cielingMaterialAddon2Response.data
          .map((item) => ({
            value: item.id,
            label: item.name,
          }))
          .find((cm) => cm.value === cielingMaterialAddon2?.id) || null
      );
      setSelectedFloorMaterial(
        floorMaterialResponse.data
          .map((item) => ({
            value: item.id,
            label: item.name,
          }))
          .find((fm) => fm.value === floorMaterial?.id) || null
      );

      setSelectedFinishingCost({
        value: finishing_cost_Id,
        label: specificRoom.finishing_cost?.name || "",
      });

      setSelectedFinishingStyle({
        value: finishing_style_Id,
        label: specificRoom.finishing_style?.name || "",
      });

      setSelectedRoomNames({
        value: room_names_Id,
        label: specificRoom.room_names?.name || "",
      });

      setHeight(specificRoom.height || 0);
      setWidth(specificRoom.width || 0);
      setLength(specificRoom.length || 0);
      setPercentage(specificRoom.percentage || 0);
      setWallColor(specificRoom.wall_color || "#ffffff");
      setIsCalculatable(specificRoom.isCalculatable || false);
      setIsAirConditioning(specificRoom.isAirConditioning || false);

      const [costsResponse, stylesResponse, roomNamesResponse] = await Promise.all([
        axios.get(`${MainUrl}finishing/finishing-costs/`, {
          headers: { accept: "application/json" },
        }),
        axios.get(`${MainUrl}finishing/finishing-styles/`, {
          headers: { accept: "application/json" },
        }),
        axios.get(`${MainUrl}home/room-names/`, {
          headers: { accept: "application/json" },
        }),
      ]);

      setFinishingCosts(costsResponse.data.map((item) => ({ value: item.id, label: item.name })));
      setFinishingStyles(
        stylesResponse.data.map((item) => ({
          value: item.id,
          label: item.name,
        }))
      );
      setRoomNames(
        roomNamesResponse.data.map((item) => ({
          value: item.id,
          label: item.name,
        }))
      );
    } catch (error) {
      console.error("Error fetching data:", error);
      setError(error.message || "Error occurred while fetching data");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDecorationsData = useCallback(async () => {
    const encodedRoomNames = encodeURIComponent(roomNamesName);

    try {
      const response = await axios.get(
        `${MainUrl}home/decorations/?finishing_cost_name=${finishingCostName}&finishing_style_name=${finishingStyleName}&room_names_name=${encodedRoomNames}`
      );
      const data = response.data;

      const wallMaterials = data
        .filter((item) => item.decoration_type === "wall")
        .map((item) => ({
          value: item.id,
          label: item.name,
        }));
      setWallMaterials(wallMaterials);
      // wall addon 1
      const wallMaterialAddons1 = data
        .filter((item) => item.decoration_type === "wall_addon")
        .map((item) => ({
          value: item.id,
          label: item.name,
        }));
      setWallMaterialAddon1(wallMaterialAddons1);
      // wall addon 2
      const wallMaterialAddons2 = data
        .filter((item) => item.decoration_type === "wall_addon")
        .map((item) => ({
          value: item.id,
          label: item.name,
        }));
      setWallMaterialAddon2(wallMaterialAddons2);
      // CielingMaterial
      const CielingMaterial = data
        .filter((item) => item.decoration_type === "ceiling")
        .map((item) => ({
          value: item.id,
          label: item.name,
        }));
      setCielingMaterial(CielingMaterial);
      // CielingMaterialAddon1
      const CielingMaterialAddon1 = data
        .filter((item) => item.decoration_type === "ceiling_addon")
        .map((item) => ({
          value: item.id,
          label: item.name,
        }));
      setCielingMaterialAddon1(CielingMaterialAddon1);
      // CielingMaterialAddon2
      const CielingMaterialAddon2 = data
        .filter((item) => item.decoration_type === "ceiling_addon")
        .map((item) => ({
          value: item.id,
          label: item.name,
        }));
      setCielingMaterialAddon2(CielingMaterialAddon2);

      // CielingMaterialAddon2
      const FloorMaterials = data
        .filter((item) => item.decoration_type === "floor")
        .map((item) => ({
          value: item.id,
          label: item.name,
        }));
      setFloorMaterial(FloorMaterials);

      // door
      const doorMaterials = data
        .filter((item) => item.decoration_type === "door")
        .map((item) => ({
          value: item.id,
          label: item.name,
        }));
      setDoorMaterialIDOptions(doorMaterials);

      // WINDOW
      const windowMaterials = data
        .filter((item) => item.decoration_type === "window")
        .map((item) => ({
          value: item.id,
          label: item.name,
        }));
      setWindowsMaterialIDOptions(windowMaterials);

      // window 2

      const windowMaterialsAddon = data
        .filter((item) => item.decoration_type === "window_addon")
        .map((item) => ({
          value: item.id,
          label: item.name,
        }));
      setWindowsMaterialAddonIDOptions(windowMaterialsAddon);

      // error
    } catch (error) {
      console.error("Failed to fetch decorations data", error);
    }
  }, [finishingCostName, finishingStyleName, roomNamesName]);

  useEffect(() => {
    if (finishingCostName && finishingStyleName && roomNamesName) {
      fetchDecorationsData();
    }
  }, [fetchDecorationsData]);

  //

  const fetchAirConditioningOptions = useCallback(async () => {
    try {
      const response = await axios.get(`${MainUrl}airconditions/all/`, {
        headers: {
          accept: "application/json",
          Authorization: `Token ${token}`,
        },
      });
      const options = response.data.map((item) => ({
        value: item.id,
        label: item.english_name,
      }));
      setAirConditioningOptions(options);
    } catch (error) {
      console.error("Failed to fetch air conditioning options:", error);
    }
  }, []);

  const fetchUtilityFactors = useCallback(async () => {
    try {
      const response = await axios.get(`${MainUrl}home/utility_factors/`, {
        headers: {
          accept: "application/json",
          Authorization: `Token ${token}`,
        },
      });
      const data = response.data.map((item) => ({
        value: item.id,
        label: item.name,
      }));
      setUtilityFactors(data);
    } catch (error) {
      console.error("Failed to fetch floor material IDs", error);
    }
  }, []);

  useEffect(() => {
    fetchAirConditioningOptions();
    fetchUtilityFactors();
    fetchData();
  }, [fetchUtilityFactors, fetchAirConditioningOptions, id]);

  useEffect(() => {
    if (roomData) {
      setSelectedFinishingCost(finishingCosts.find((fc) => fc.value === roomData.finishing_cost_Id));

      const transformedSelectedUtilityFactors = roomData.utility_factors.map((id) => utilityFactors.find((factor) => factor.value === id));

      setSelectedUtilityFactors(transformedSelectedUtilityFactors);

      setSelectedFinishingStyle(finishingStyles.find((fs) => fs.value === roomData.finishing_style_Id));

      setWindows(
        roomData.windows.map((window) => ({
          id: window.id,
          height: window.height,
          width: window.width,
          windowMaterialID: window.windowMaterialID,
          windowAddonMaterialID: window.windowAddonMaterialID,
        }))
      );
      setSelectedRoomNames(roomNames.find((fs) => fs.value === roomData.room_names_Id));
      if (roomData.isAirConditioning) {
        setSelectedAirConditioning(airConditioningOptions.find((ac) => ac.value === roomData.airconditioningID) || null);
      } else {
        setSelectedAirConditioning(null);
      }
    }
  }, [roomData, finishingCosts, finishingStyles, roomNames, airConditioningOptions, utilityFactors]);

  // for doors data

  useEffect(() => {
    if (doors.length > 0 && doorMaterialIDOptions.length > 0) {
      const selectedMaterial = doorMaterialIDOptions.find((option) => option.value === doors[0].doorMaterialID);
      setSelectedDoorMaterial(selectedMaterial);
    }
  }, [doors, doorMaterialIDOptions]);
  useEffect(() => {
    if (doors.length > 0) {
      setDoorHeight(doors[0].height);
      setDoorWidth(doors[0].width);
    }
  }, [doors]);

  // for windows
  useEffect(() => {
    if (windows.length > 0 && windowsMaterialIDOptions.length > 0) {
      const selectedWindowMaterial = windowsMaterialIDOptions.find((option) => option.value === windows[0].windowMaterialID);

      setSelectedWindowsMaterial(selectedWindowMaterial);
    }
    if (windows.length > 0 && windowsMaterialAddonIDOptions.length > 0) {
      const selectedWindowMaterialAddon = windowsMaterialIDOptions.find((option) => option.value === windows[0].windowAddonMaterialID);
      setSelectedWindowsMaterialAddon(selectedWindowMaterialAddon);
    }
  }, [windows, windowsMaterialIDOptions, windowsMaterialAddonIDOptions]);
  useEffect(() => {
    if (windows.length > 0) {
      setWindowsHeight(windows[0].height);
      setWindowsWidth(windows[0].width);
    }
  }, [windows]);

  useEffect(() => {
    console.log("Room Data:", roomData);
    console.log("Image URLs:", roomImages);
  }, [roomData, roomImages]);

  useEffect(() => {
    if (roomData && roomData.windows) {
      setWindows(roomData.windows);
    }
  }, [roomData]);

  useEffect(() => {
    if (roomData && roomData.doors) {
      setDoors(roomData.doors);
    }
  }, [roomData]);

  useEffect(() => {
    console.log("Current windows state:", windows);
  }, [windows]);
  // end for doors data

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsUploading(true);

    const deleteDoorPromises = pendingDoorDeletions
      .filter((doorId) => doorId !== undefined)
      .map((doorId) =>
        axios.delete(`${MainUrl}home/doors/${doorId}/delete/`, {
          headers: { Authorization: `Token ${token}` },
        })
      );

    const deleteWindowPromises = pendingWindowDeletions
      .filter((windowId) => windowId !== undefined)
      .map((windowId) =>
        axios.delete(`${MainUrl}home/windows/${windowId}/delete/`, {
          headers: { Authorization: `Token ${token}` },
        })
      );
    const deleteImagePromises = pendingImageDeletions
      .filter((imageId) => imageId !== undefined)
      .map((imageId) =>
        axios.delete(`${MainUrl}home/delete-image/${imageId}/`, {
          headers: { Authorization: `Token ${token}` },
        })
      );

    const isImageTooLarge = roomImages.some((image) => image.imageFile && image.imageFile.size > 1048576);
    if (isImageTooLarge) {
      setPopupMessage("Images Size Maximum 1MB Please Check it");

      return;
    }

    try {
      await Promise.all([...deleteDoorPromises, ...deleteWindowPromises, ...deleteImagePromises]);
      const existingDoors = doors.filter((door) => door.id);
      const updateDoorPromises = existingDoors.map((door) =>
        axios.patch(
          `${MainUrl}home/doors/${door.id}/`,
          {
            height: parseFloat(door.height),
            width: parseFloat(door.width),
            doorMaterialID: parseInt(door.doorMaterialID),
          },
          {
            headers: {
              accept: "application/json",
              Authorization: `Token ${token}`,
              "Content-Type": "application/json",
            },
          }
        )
      );

      await Promise.all(updateDoorPromises);

      const newDoors = doors.filter((door) => !door.id);
      const newDoorsPayload = newDoors.map((door) => ({
        height: parseFloat(door.height) ? parseFloat(door.height) : 0,
        width: parseFloat(door.width) ? parseFloat(door.width) : 0,
        doorMaterialID: parseInt(door.doorMaterialID),
      }));

      const existingWindows = windows.filter((window) => window.id);
      const updateWindowPromises = existingWindows.map((window) =>
        axios.patch(
          `${MainUrl}home/windows/${window.id}/`,
          {
            height: parseFloat(window.height),
            width: parseFloat(window.width),
            windowMaterialID: parseInt(window.windowMaterialID),
            windowAddonMaterialID: parseInt(window.windowAddonMaterialID),
          },
          {
            headers: {
              accept: "application/json",
              Authorization: `Token ${token}`,
              "Content-Type": "application/json",
            },
          }
        )
      );

      await Promise.all(updateWindowPromises);

      const newWindows = windows.filter((window) => !window.id);
      const newWindowsPayload = newWindows.map((window) => ({
        height: parseFloat(window.height) ? parseFloat(window.height) : 0,
        width: parseFloat(window.width) ? parseFloat(window.width) : 0,
        windowMaterialID: parseInt(window.windowMaterialID),
        windowAddonMaterialID: parseInt(window.windowAddonMaterialID),
      }));

      const newImages = roomImages.filter((image) => image.isNew && image.imageFile);
      const uploadedImageUrls = await Promise.all(
        newImages.map(async (image) => {
          const formData = new FormData();
          formData.append("image", image.imageFile, image.imageFile.name);
          const response = await axios.post(`${MainUrl}home/rooms/${id}/upload-images/`, formData, {
            headers: {
              accept: "application/json",
              Authorization: `Token ${token}`,
              "X-CSRFTOKEN": "csrf-token",
            },
          });
          return response.data.image;
        })
      );

      const existingImages = roomImages.filter((image) => !image.isNew).map((image) => ({ image: image.imageUrl }));
      const allImages = [...existingImages, ...uploadedImageUrls.map((url) => ({ image: url }))];

      const payload = {
        design_code: designCode,
        english_name: englishName,
        arabic_name: arabicName,
        finishing_cost_Id: selectedFinishingCost ? selectedFinishingCost.value : null,
        finishing_style_Id: selectedFinishingStyle ? selectedFinishingStyle.value : null,
        room_names_Id: selectedRoomNames ? selectedRoomNames.value : null,
        height: height,
        percentage: percentage,
        wall_color: wallColor,
        wallMaterialID: selectedWallMaterial ? selectedWallMaterial.value : null,
        wallMaterialAddon1ID: selectedWallMaterialAddon1 ? selectedWallMaterialAddon1.value : null,
        wallMaterialAddon2ID: selectedWallMaterialAddon2 ? selectedWallMaterialAddon2.value : null,
        cielingMaterialID: selectedCielingMaterial ? selectedCielingMaterial.value : null,
        cielingMaterialAddon1ID: selectedCielingMaterialAddon1 ? selectedCielingMaterialAddon1.value : null,
        cielingMaterialAddon2ID: selectedCielingMaterialAddon2 ? selectedCielingMaterialAddon2.value : null,
        floorMaterialID: selectedFloorMaterial ? selectedFloorMaterial.value : null,
        isAirConditioning: isAirConditioning,
        utility_factors: selectedUtilityFactors.filter((factor) => factor != null).map((factor) => factor.value),
        Gallery_photo_description: arabicDescription,
        Gallery_photo_description_english: englishDescription,
        doors: newDoorsPayload,
        windows: newWindowsPayload,
        images: allImages,
      };

      if (one) payload.one = parseFloat(one);
      if (two) payload.two = parseFloat(two);
      if (three) payload.three = parseFloat(three);
      if (four) payload.four = parseFloat(four);
      if (length) payload.length = parseFloat(length);
      if (width) payload.width = parseFloat(width);

      await axios.patch(`${MainUrl}home/rooms/${id}/`, payload, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
      });

      // i add it here 06-02-25 to go to calculate room price api and calculate the room
      await axios.get(`https://dash.ogeedecor.com/home/calculate-room-price/${id}/`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
      });
      setPopupMessage("Room has been updated");
      history("/Rooms");
    } catch (error) {
      setPopupMessage("Failed to update room. Please update data!");
      console.error("Error during the update process:", error);
    } finally {
      setIsLoading(false);
      window.scrollTo(0, 0);
      setIsUploading(false);
    }
  };

  const LoadingPopup2 = () => (
    <div className="loading-popup">
      <div className="loading-circle">
        <div className="loading-semicircle"></div>
      </div>
      <div className="loading-text">
        Loading<span className="loading-dots"></span>
      </div>
    </div>
  );

  if (isLoading)
    return (
      <div>
        <LoadingPopup2 />
      </div>
    );
  if (error) return <div>Error: {error.message || "An error occurred"}</div>;

  const handleTabClick = (tabName) => {
    setActiveForm(tabName);
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

  const GeneralForm = () => {
    const decodedRoomNames = decodeURIComponent(roomNamesName);

    const renderUtilityFactors = () => {
      if (decodedRoomNames === "Bathroom" || decodedRoomNames === "Kitchen") {
        return (
          <div className="Form_Box_SecondPage">
            <h3>Utility factors</h3>
            <SortableSelect
              react-sortable-hoc
              className="MultiSelect_Box_SecondPage"
              useDragHandle
              axis="xy"
              distance={4}
              getHelperDimensions={({ node }) => node.getBoundingClientRect()}
              isMulti
              options={utilityFactors}
              value={selectedUtilityFactors}
              onChange={(option) => setSelectedUtilityFactors(option || [])}
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

    const shouldRenderAlternativeForm = !width || !length;

    return (
      <>
        {shouldRenderAlternativeForm ? (
          <form className="Field_Container_SecondPage">
            {/* Line 1 */}

            <div className="Form2_Contain_L1_SecondPage">
              {/* Design Code */}
              <div className="Form_Box_SecondPage">
                <h3>Design Code</h3>
                <input
                  type="name"
                  className="InputForm2_SecondPage"
                  name="height"
                  value={designCode}
                  onChange={(e) => setDesignCode(e.target.value)}
                  id="height"
                  required
                />
              </div>
              {/* English Name */}
              <div className="Form_Box_SecondPage">
                <h3>English Name</h3>
                <input
                  type="name"
                  className="InputForm2_SecondPage"
                  name="height"
                  value={englishName}
                  onChange={(e) => setEnglishName(e.target.value)}
                  id="height"
                  required
                />
              </div>
              {/* Arabic Name */}
              <div className="Form_Box_SecondPage">
                <h3>Arabic Name</h3>
                <input
                  type="name"
                  className="InputForm2_SecondPage"
                  name="height"
                  value={arabicName}
                  onChange={(e) => setArabicName(e.target.value)}
                  id="height"
                  required
                />
              </div>
            </div>
            {/* Line 2 */}
            <div className="Form2_Contain_L1_SecondPage">
              {/*  */}
              <div className="Form_Box">
                <h3>Finishing cost</h3>
                {finishingCosts.length > 0 && (
                  <Select
                    className="Select_Box"
                    value={selectedFinishingCost}
                    onChange={(option) => setSelectedFinishingCost(option)}
                    options={finishingCosts}
                    placeholder="Select...."
                    isClearable
                    required
                  />
                )}
              </div>
              {/*  */}
              <div className="Form_Box">
                <h3>Finishing style</h3>
                {finishingStyles.length > 0 && (
                  <Select
                    className="Select_Box"
                    value={selectedFinishingStyle}
                    onChange={(option) => setSelectedFinishingStyle(option)}
                    options={finishingStyles}
                    placeholder="Select...."
                    isClearable
                    required
                  />
                )}
              </div>
              {/*  */}
              <div className="Form_Box">
                <h3>Room Name</h3>
                {roomNames.length > 0 && (
                  <Select
                    className="Select_Box"
                    value={selectedRoomNames}
                    onChange={(option) => setSelectedRoomNames(option)}
                    options={roomNames}
                    placeholder="Select...."
                    isClearable
                    required
                  />
                )}
              </div>
            </div>
            {/* Line 3 */}
            <div className="Form2_Contain_L1_SecondPage">
              {/*  */}
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
              {/*  */}
              <div className="Form_Box_SecondPage">
                <h3>S1</h3>
                <input type="number" onChange={(e) => setOne(e.target.value)} className="InputForm2_SecondPage" name="width" value={one} id="width" required />
              </div>
              {/*  */}
              <div className="Form_Box_SecondPage">
                <h3>S2</h3>
                <input type="number" onChange={(e) => setTwo(e.target.value)} className="InputForm2_SecondPage" name="Length" value={two} id="width" required />
              </div>
            </div>
            {/* Line 4 */}
            <div className="Form2_Contain_L1_SecondPage">
              <div className="Form_Box_SecondPage">
                <h3>S3</h3>
                <input
                  type="number"
                  onChange={(e) => setThree(e.target.value)}
                  className="InputForm2_SecondPage"
                  name="Length"
                  value={three}
                  id="width"
                  required
                />
              </div>
              {/*  */}
              <div className="Form_Box_SecondPage">
                <h3>S4</h3>
                <input
                  type="number"
                  onChange={(e) => setFour(e.target.value)}
                  className="InputForm2_SecondPage"
                  name="Length"
                  value={four}
                  id="width"
                  required
                />
              </div>
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
            {/* Line  5 */}
            <div className="Form2_Contain_L1_SecondPage">
              <div className="Form_Box_SecondPage">
                <h3>Wall color</h3>
                <input
                  type="text"
                  value={wallColor}
                  onClick={() => setShowColorPicker((show) => !show)}
                  onChange={(e) => setWallColor(e.target.value)}
                  placeholder="Click to select color"
                  className="InputForm2_SecondPage"
                />
                {showColorPicker && (
                  <div ref={colorPickerRef} className="ChromePicker">
                    <SketchPicker color={wallColor} onChangeComplete={handleColorChange} className="" />
                  </div>
                )}
              </div>
              {/*  */}
              <div className="Form_Box">
                <h3>Wall Material</h3>
                <Select
                  className="Select_Box"
                  value={selectedWallMaterial}
                  onChange={(option) => setSelectedWallMaterial(option)}
                  options={wallMaterials}
                  placeholder="Select Wall Material"
                  isClearable
                />
              </div>
              {/*  */}
              <div className="Form_Box">
                <h3>Wall Addon 1</h3>
                <Select
                  className="Select_Box"
                  value={selectedWallMaterialAddon1}
                  onChange={(option) => setSelectedWallMaterialAddon1(option)}
                  options={wallMaterialAddon1}
                  placeholder="Select Wall Material addon"
                  isClearable
                />
              </div>
            </div>
            {/* Line  6 */}
            <div className="Form2_Contain_L1_SecondPage">
              {/*  */}
              <div className="Form_Box">
                <h3>Wall Addon 2</h3>
                <Select
                  className="Select_Box"
                  value={selectedWallMaterialAddon2}
                  onChange={(option) => setSelectedWallMaterialAddon2(option)}
                  options={wallMaterialAddon2}
                  placeholder="Select Wall Material addon"
                  isClearable
                />
              </div>
              {/*  */}
              <div className="Form_Box">
                <h3>Cieling Material</h3>
                <Select
                  className="Select_Box"
                  value={selectedCielingMaterial}
                  onChange={(option) => setSelectedCielingMaterial(option)}
                  options={cielingMaterial}
                  placeholder="Select cieling Material"
                  isClearable
                />
              </div>
              {/*  */}
              <div className="Form_Box">
                <h3>Cieling Addon 1</h3>
                <Select
                  className="Select_Box"
                  value={selectedCielingMaterialAddon1}
                  onChange={(option) => setSelectedCielingMaterialAddon1(option)}
                  options={cielingMaterialAddon1}
                  placeholder="Select cieling Material"
                  isClearable
                />
              </div>
              {/*  */}
            </div>
            {/* Line 7 */}
            <div className="Form2_Contain_L1_SecondPage">
              {/* {" "} */}
              <div className="Form_Box">
                <h3>Cieling Addon 2</h3>
                <Select
                  className="Select_Box"
                  value={selectedCielingMaterialAddon2}
                  onChange={(option) => setSelectedCielingMaterialAddon2(option)}
                  options={cielingMaterialAddon2}
                  placeholder="Select cieling Material"
                  isClearable
                />
              </div>
              {/*  */}
              <div className="Form_Box">
                <h3>Floor Material</h3>
                <Select
                  className="Select_Box"
                  value={selectedFloorMaterial}
                  onChange={(option) => setSelectedFloorMaterial(option)}
                  options={floorMaterial}
                  placeholder="Select Floor Material"
                  isClearable
                />
              </div>
            </div>
            {/* Line 8 */}
            <div className="Form2_Contain_L1_SecondPage">
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
              <div className="Form_Box">
                {isAirConditioning && (
                  <div className="Form_Box">
                    <h3>AC Type</h3>
                    <h4>{selectedAirConditioning ? selectedAirConditioning.label : "Not specified Please Update the Room First"}</h4>
                  </div>
                )}
              </div>
            </div>
            <div className="Form2_Contain_L1_SecondPage">{renderUtilityFactors()}</div>
            <div className="Form2_Contain_L1_SecondPage">
              {/* English Description */}
              <div className="Form_Box_SecondPage_TextArea">
                <h3>English Description</h3>
                <ReactQuill
                  value={englishDescription}
                  onChange={setEnglishDescription}
                  placeholder="Enter English description..."
                  modules={modules}
                  theme="snow"
                />
              </div>

              {/* Arabic Description */}
              <div className="Form_Box_SecondPage_TextArea">
                <h3>Arabic Description</h3>
                <ReactQuill
                  value={arabicDescription}
                  onChange={setArabicDescription}
                  placeholder="أدخل الوصف باللغة العربية..."
                  modules={modules}
                  theme="snow"
                />
              </div>
            </div>
          </form>
        ) : (
          // if not L-shape
          <form className="Field_Container_SecondPage">
            {/* Line 1 */}

            <div className="Form2_Contain_L1_SecondPage">
              {/* Design Code */}
              <div className="Form_Box_SecondPage">
                <h3>Design Code</h3>
                <input
                  type="name"
                  className="InputForm2_SecondPage"
                  name="height"
                  value={designCode}
                  onChange={(e) => setDesignCode(e.target.value)}
                  id="height"
                  required
                />
              </div>
              {/* English Name */}
              <div className="Form_Box_SecondPage">
                <h3>English Name</h3>
                <input
                  type="name"
                  className="InputForm2_SecondPage"
                  name="height"
                  value={englishName}
                  onChange={(e) => setEnglishName(e.target.value)}
                  id="height"
                  required
                />
              </div>
              {/* Arabic Name */}
              <div className="Form_Box_SecondPage">
                <h3>Arabic Name</h3>
                <input
                  type="name"
                  className="InputForm2_SecondPage"
                  name="height"
                  value={arabicName}
                  onChange={(e) => setArabicName(e.target.value)}
                  id="height"
                  required
                />
              </div>
            </div>
            {/* Line 2 */}
            <div className="Form2_Contain_L1_SecondPage">
              {/*  */}
              <div className="Form_Box">
                <h3>Finishing cost</h3>
                {finishingCosts.length > 0 && (
                  <Select
                    className="Select_Box"
                    value={selectedFinishingCost}
                    onChange={(option) => setSelectedFinishingCost(option)}
                    options={finishingCosts}
                    placeholder="Select...."
                    isClearable
                    required
                  />
                )}
              </div>
              {/*  */}
              <div className="Form_Box">
                <h3>Finishing style</h3>
                {finishingStyles.length > 0 && (
                  <Select
                    className="Select_Box"
                    value={selectedFinishingStyle}
                    onChange={(option) => setSelectedFinishingStyle(option)}
                    options={finishingStyles}
                    placeholder="Select...."
                    isClearable
                    required
                  />
                )}
              </div>
              {/*  */}
              <div className="Form_Box">
                <h3>Room Name</h3>
                {roomNames.length > 0 && (
                  <Select
                    className="Select_Box"
                    value={selectedRoomNames}
                    onChange={(option) => setSelectedRoomNames(option)}
                    options={roomNames}
                    placeholder="Select...."
                    isClearable
                    required
                  />
                )}
              </div>
            </div>
            {/* Line 3 */}
            <div className="Form2_Contain_L1_SecondPage">
              {/*  */}
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
              {/*  */}
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
              {/*  */}
              <div className="Form_Box_SecondPage">
                <h3>Length</h3>
                <input
                  type="number"
                  onChange={(e) => setLength(e.target.value)}
                  className="InputForm2_SecondPage"
                  name="Length"
                  value={length}
                  id="width"
                  required
                />
              </div>
            </div>
            {/* Line 4 */}
            <div className="Form2_Contain_L1_SecondPage">
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
            {/* Line  5 */}
            <div className="Form2_Contain_L1_SecondPage">
              <div className="Form_Box_SecondPage">
                <h3>Wall color</h3>
                <input
                  type="text"
                  value={wallColor}
                  onClick={() => setShowColorPicker((show) => !show)}
                  onChange={(e) => setWallColor(e.target.value)}
                  placeholder="Click to select color"
                  className="InputForm2_SecondPage"
                />
                {showColorPicker && (
                  <div ref={colorPickerRef} className="ChromePicker">
                    <SketchPicker color={wallColor} onChangeComplete={handleColorChange} className="" />
                  </div>
                )}
              </div>
              {/*  */}
              <div className="Form_Box">
                <h3>Wall Material</h3>
                <Select
                  className="Select_Box"
                  value={selectedWallMaterial}
                  onChange={(option) => setSelectedWallMaterial(option)}
                  options={wallMaterials}
                  placeholder="Select Wall Material"
                  isClearable
                />
              </div>
              {/*  */}
              <div className="Form_Box">
                <h3>Wall Addon 1</h3>
                <Select
                  className="Select_Box"
                  value={selectedWallMaterialAddon1}
                  onChange={(option) => setSelectedWallMaterialAddon1(option)}
                  options={wallMaterialAddon1}
                  placeholder="Select Wall Material addon"
                  isClearable
                />
              </div>
            </div>
            {/* Line  6 */}
            <div className="Form2_Contain_L1_SecondPage">
              {/*  */}
              <div className="Form_Box">
                <h3>Wall Addon 2</h3>
                <Select
                  className="Select_Box"
                  value={selectedWallMaterialAddon2}
                  onChange={(option) => setSelectedWallMaterialAddon2(option)}
                  options={wallMaterialAddon2}
                  placeholder="Select Wall Material addon"
                  isClearable
                />
              </div>
              {/*  */}
              <div className="Form_Box">
                <h3>Cieling Material</h3>
                <Select
                  className="Select_Box"
                  value={selectedCielingMaterial}
                  onChange={(option) => setSelectedCielingMaterial(option)}
                  options={cielingMaterial}
                  placeholder="Select cieling Material"
                  isClearable
                />
              </div>
              {/*  */}
              <div className="Form_Box">
                <h3>Cieling Addon 1</h3>
                <Select
                  className="Select_Box"
                  value={selectedCielingMaterialAddon1}
                  onChange={(option) => setSelectedCielingMaterialAddon1(option)}
                  options={cielingMaterialAddon1}
                  placeholder="Select cieling Material"
                  isClearable
                />
              </div>
              {/*  */}
            </div>
            {/* Line 7 */}
            <div className="Form2_Contain_L1_SecondPage">
              {/* {" "} */}
              <div className="Form_Box">
                <h3>Cieling Addon 2</h3>
                <Select
                  className="Select_Box"
                  value={selectedCielingMaterialAddon2}
                  onChange={(option) => setSelectedCielingMaterialAddon2(option)}
                  options={cielingMaterialAddon2}
                  placeholder="Select cieling Material"
                  isClearable
                />
              </div>
              {/*  */}
              <div className="Form_Box">
                <h3>Floor Material</h3>
                <Select
                  className="Select_Box"
                  value={selectedFloorMaterial}
                  onChange={(option) => setSelectedFloorMaterial(option)}
                  options={floorMaterial}
                  placeholder="Select Floor Material"
                  isClearable
                />
              </div>
              {/*  */}
            </div>
            {/* Line 8 */}
            <div className="Form2_Contain_L1_SecondPage">
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
              <div className="Form_Box">
                {isAirConditioning && (
                  <div className="Form_Box">
                    <h3>AC Type</h3>
                    <h4>{selectedAirConditioning ? selectedAirConditioning.label : "Not specified Please Update the Room First"}</h4>
                  </div>
                )}
              </div>
            </div>
            <div className="Form2_Contain_L1_SecondPage">{renderUtilityFactors()}</div>
            <div className="Form2_Contain_L1_SecondPage">
              {/* English Description */}
              <div className="Form_Box_SecondPage_TextArea">
                <h3>English Description</h3>
                <ReactQuill
                  value={englishDescription}
                  onChange={setEnglishDescription}
                  placeholder="Enter English description..."
                  modules={modules}
                  theme="snow"
                />
              </div>

              {/* Arabic Description */}
              <div className="Form_Box_SecondPage_TextArea">
                <h3>Arabic Description</h3>
                <ReactQuill
                  value={arabicDescription}
                  onChange={setArabicDescription}
                  placeholder="أدخل الوصف باللغة العربية..."
                  modules={modules}
                  theme="snow"
                />
              </div>
            </div>
          </form>
        )}
      </>
    );
  };

  const Doors = () => {
    const updateDoorField = (index, field, value) => {
      const updatedDoors = [...doors];
      updatedDoors[index] = { ...updatedDoors[index], [field]: value };
      setDoors(updatedDoors);
    };

    const updateDoorData = async (doorId, updatedData) => {
      try {
        const response = await axios.patch(`${MainUrl}home/doors/${doorId}/`, updatedData, {
          headers: {
            accept: "application/json",
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
            "X-CSRFTOKEN": "qEEPcQodDylJmHh4Qz7OlCScpnMXiF49gHqcL7U158FVkaHBD9UWJBtg6nJ5bzrV",
          },
        });
        console.log(response.data.message);
      } catch (error) {
        console.error("Error updating door:", error);
      }
    };

    const handleDoorMaterialChange = (selectedOption, index) => {
      const updatedDoors = [...doors];
      updatedDoors[index] = {
        ...updatedDoors[index],
        doorMaterialID: selectedOption ? selectedOption.value : null,
      };
      setDoors(updatedDoors);
    };

    const addDoor = () => {
      if (doors.length >= 2) {
        setPopupMessage("You can't add more than 2 doors");
      } else {
        setDoors([...doors, { doorMaterialID: null, doorWidth: "", doorHeight: "" }]);
      }
    };

    const markDoorForDeletion = (index, doorId) => {
      setDoors(doors.filter((_, i) => i !== index));
      setPendingDoorDeletions([...pendingDoorDeletions, doorId]);
    };

    //
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
                  value={doorMaterialIDOptions.find((option) => option.value === door.doorMaterialID)}
                  onChange={(option) => handleDoorMaterialChange(option, index)}
                  options={doorMaterialIDOptions}
                  placeholder="Select...."
                  isClearable
                />
              </div>
              <div className="Form_Box_Doors">
                <input type="number" value={door.width} onChange={(e) => updateDoorField(index, "width", e.target.value)} className="InputForm2_SecondPage" />
              </div>
              <div className="Form_Box_Doors">
                <input type="number" value={door.height} onChange={(e) => updateDoorField(index, "height", e.target.value)} className="InputForm2_SecondPage" />
              </div>
              <div className="Form_Button_Doors">
                <button type="button" className="Door_Button_Remove" onClick={() => markDoorForDeletion(index, door.id)}>
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

  const Windows = () => {
    const updateWindowField = (index, field, value) => {
      const updatedWindows = [...windows];
      updatedWindows[index] = { ...updatedWindows[index], [field]: value };
      setWindows(updatedWindows);
    };

    const handleWindowMaterialChange = (selectedOption, index) => {
      updateWindowField(index, "windowMaterialID", selectedOption ? selectedOption.value : null);
    };
    const handleWindowMaterialAddonChange = (selectedOption, index) => {
      updateWindowField(index, "windowAddonMaterialID", selectedOption ? selectedOption.value : null);
    };

    const addWindow = () => {
      if (windows.length >= 2) {
        setPopupMessage("You can't add more than 2 windows");
      } else {
        setWindows([
          ...windows,
          {
            windowMaterialID: null,
            windowAddonMaterialID: null,
            windowWidth: "",
            windowHeight: "",
          },
        ]);
      }
    };

    const markWindowForDeletion = (index, windowId) => {
      setWindows(windows.filter((_, i) => i !== index));
      setPendingWindowDeletions([...pendingWindowDeletions, windowId]);
    };

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
                  value={windowsMaterialIDOptions.find((option) => option.value === window.windowMaterialID)}
                  onChange={(selectedOption) => handleWindowMaterialChange(selectedOption, indexWindow)}
                  options={windowsMaterialIDOptions}
                  placeholder="Select...."
                  isClearable
                />
              </div>
              <div className="Form_Box_Doors">
                <Select
                  className="Select_Box_Doors"
                  value={windowsMaterialAddonIDOptions.find((option) => option.value === window.windowAddonMaterialID)}
                  onChange={(selectedOption) => handleWindowMaterialAddonChange(selectedOption, indexWindow)}
                  options={windowsMaterialAddonIDOptions}
                  placeholder="Select...."
                  isClearable
                />
              </div>
              <div className="Form_Box_Doors">
                <input
                  type="number"
                  value={window.width}
                  onChange={(e) => updateWindowField(indexWindow, "width", e.target.value)}
                  className="InputForm2_SecondPage"
                />
              </div>
              <div className="Form_Box_Doors">
                <input
                  type="number"
                  value={window.height}
                  onChange={(e) => updateWindowField(indexWindow, "height", e.target.value)}
                  className="InputForm2_SecondPage"
                />
              </div>
              <div className="Form_Button_Doors">
                <button type="button" className="Door_Button_Remove" onClick={() => markWindowForDeletion(indexWindow, window.id)}>
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

  const Images = () => {
    const handleRoomImageChange = async (e, index) => {
      const file = e.target.files[0];
      if (!file) return;

      const options = {
        maxSizeMB: 1, // (1 MB)
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      };

      try {
        // to Check if the file size exceeds 1MB
        const compressedFile = file.size > 1024 * 1024 ? await imageCompression(file, options) : file;
        console.log(`Compressed from ${file.size / 1024 / 1024} MB to ${compressedFile.size / 1024 / 1024} MB`);

        const imageUrl = URL.createObjectURL(compressedFile);
        setRoomImages((prevImages) => {
          const updatedImages = [...prevImages];
          updatedImages[index] = {
            ...updatedImages[index],
            imageFile: compressedFile,
            imageUrl,
            isNew: true,
          };
          return updatedImages;
        });
      } catch (error) {
        console.error("Compression error:", error);
      }
    };

    const addRoomImage = () => {
      if (roomImages.length >= 6) {
        setPopupMessage("You can't add more than 6 images");
      } else {
        setRoomImages([...roomImages, { imageFile: null, imageUrl: "", isNew: true }]);
      }
    };

    const markImageForDeletion = (index, imageId) => {
      setRoomImages(roomImages.filter((_, i) => i !== index));
      setPendingImageDeletions([...pendingImageDeletions, imageId]);
    };

    const getShortenedImageUrl = (url) => {
      const parts = url.split("/");
      return parts.slice(-2).join("/");
    };

    return (
      <>
        <form className="Doors_Container">
          <div className="Images_Head_Container_Edit">
            <div className="Images_Head">Image</div>
            <div className="Images_Head">Preview/Link</div>
            <div className="Images_Head">Delete?</div>
          </div>
          {roomImages.map((image, index) => (
            <div className="Images_Buttons_Container" key={`roomImage-${index}`}>
              {image.isNew ? (
                <div className="Form_Images_Box">
                  <input className="Input_Images" type="file" onChange={(e) => handleRoomImageChange(e, index)} accept="image/*" />
                </div>
              ) : (
                <div className="Form_Images_Box_Edit">
                  Currently:{" "}
                  <a href={image.imageUrl} target="_blank" rel="noopener noreferrer" className="Form_Images_Box">
                    {getShortenedImageUrl(image.imageUrl)}
                  </a>
                </div>
              )}

              <div className="Form_Images_Box_Preivew_Edit">
                {image.imageUrl && <img src={image.imageUrl} alt="Room Preview" style={{ width: "150px", height: "150px" }} />}
              </div>

              <div className="Form_Images_Box_Edit">
                <button type="button" className="Images_Button_Remove" onClick={() => markImageForDeletion(index, image.id)}>
                  Remove
                </button>
              </div>
            </div>
          ))}
          <div className="Images_End_Container">
            <button type="button" className="Images_Button_Add" onClick={addRoomImage}>
              Add Image
            </button>
          </div>
        </form>
      </>
    );
  };

  // Form for editing room
  return (
    <>
      <div className="Container_SecondPage">
        <div className="Add_UserLogged">
          <UserLogged />
        </div>
        <form onSubmit={handleSubmit}>
          <div className="Details_Head_Container EditRoomS">
            <div className="Add_Room_SecondPage">Add Room</div>
            <div className="Details_Path_Container">
              <a href={`${MainUrl}admin/`}>Home</a>
              <h4>&gt;</h4>
              <a href="/Rooms">Rooms</a>
              <h4>&gt;</h4>

              <h4>Edit Room</h4>
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
          <button type="submit" className="Update_Room_Button" disabled={isUploading}>
            {isUploading ? "Updating ..." : "Update Room"}
          </button>
          <button type="submit" className="Update_Room_Button2" disabled={isUploading}>
            {isUploading ? "Updating ..." : "Update Room"}
          </button>
        </form>
      </div>
      {popupMessage && <Popup message={popupMessage} onClose={() => setPopupMessage("")} />}
    </>
  );
}

export default EditRoomContent;
