import React, { useState, useEffect } from "react";
import "./ExportDecorations.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../Assets/components/Auth/AuthContext";
import axios from "axios";
import AddRoomIcon from "../../Assets/images/AddRoomsIcon.svg";
import Import from "../../Assets/images/import.png";
import Export from "../../Assets/images/export.png";
import UserLogged from "../../Assets/components/Menu/userLogged/userLogged";
import Select from "react-select";
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

export default function ExportDecorationsContent() {
  const [selectedDecorationId, setSelectedDecorationId] = useState(null);

  const [decorations, setDecorations] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageRange, setPageRange] = useState({ start: 1, end: 7 });
  const itemsPerPage = 15;
  const maxPageButtons = 7;

  const [selectedFilter, setSelectedFilter] = useState(null);
  const [searchValue, setSearchValue] = useState("");
  const [filteredDecorations, setFilteredDecorations] = useState([]);
  const [lastFetchedData, setLastFetchedData] = useState([]);
  const [selectedDecorations, setSelectedDecorations] = useState(new Set());
  const [selectAll, setSelectAll] = useState(false);

  const { token } = useAuth();
  const history = useNavigate();

  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");

  const fetchDecorations = async () => {
    try {
      if (!token) {
        history("/login");
        console.log("No token found");
        return;
      }

      const response = await axios.get(`${MainUrl}home/uploaded-files/`, {
        headers: {
          accept: "application/json",
          Authorization: `Token ${token}`,
        },
      });

      const decorationsData = response.data.reverse(); // Here i Reverse the array to display the last object first

      if (JSON.stringify(decorationsData) !== JSON.stringify(lastFetchedData)) {
        setDecorations(decorationsData);
        setLastFetchedData(decorationsData);
      }
    } catch (error) {
      console.error("Error fetching decorations data:", error);
    }
  };

  useEffect(() => {
    fetchDecorations();
  }, []);

  useEffect(() => {
    const totalPages = Math.ceil(decorations.length / itemsPerPage);
    if (currentPage < pageRange.start || currentPage > pageRange.end) {
      let newStart = Math.max(currentPage - 3, 1);
      let newEnd = Math.min(newStart + maxPageButtons - 1, totalPages);
      setPageRange({ start: newStart, end: newEnd });
    }
  }, [currentPage, decorations.length]);

  useEffect(() => {
    setSearchValue("");
  }, [selectedFilter]);

  useEffect(() => {
    const filterDecorations = () => {
      if (!selectedFilter) {
        setFilteredDecorations(decorations);
        return;
      }

      const filteredDecorations = decorations.filter((decoration) => {
        const filterValue = searchValue.toLowerCase();
        const decorationValue = decoration[selectedFilter.value];

        if (typeof decorationValue === "string") {
          return decorationValue.toLowerCase().includes(filterValue);
        } else if (typeof decorationValue === "number") {
          return decorationValue.toString().includes(filterValue);
        }

        return false;
      });

      setFilteredDecorations(filteredDecorations);
    };

    filterDecorations();
  }, [decorations, selectedFilter, searchValue]);

  const goToPage = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const renderPageButtons = () => {
    const totalPages = Math.ceil(filteredDecorations.length / itemsPerPage);
    const buttons = [];

    let startRange = Math.max(currentPage - Math.floor(maxPageButtons / 2), 1);
    let endRange = startRange + maxPageButtons - 1;
    if (endRange > totalPages) {
      endRange = totalPages;
      startRange = Math.max(endRange - maxPageButtons + 1, 1);
    }

    buttons.push(
      <button
        key="<<"
        onClick={() => currentPage > 1 && goToPage(Math.min(currentPage - 1, totalPages))}
        className={currentPage > 1 ? "Button_Page Button_Active_Pages" : "Button_Page Button_NotActive_Pages"}
      >
        «
      </button>
    );

    for (let i = startRange; i <= endRange; i++) {
      buttons.push(
        <button key={i} onClick={() => goToPage(i)} className={currentPage === i ? "Button_Page Button_Active" : "Button_Page Button_NotActive"}>
          {i}
        </button>
      );
    }

    buttons.push(
      <button
        key=">>"
        onClick={() => goToPage(Math.min(currentPage + 1, totalPages))}
        className={currentPage < totalPages ? "Button_Page Button_Active_Pages" : "Button_Page Button_NotActive_Pages"}
      >
        »
      </button>
    );

    return buttons;
  };

  const handleExportAllDecorations = async () => {
    try {
      setPopupMessage("Waiting for download...");
      setShowPopup(true); // Show popup before starting the download

      const response = await axios.get(`${MainUrl}home/api/export/`, {
        headers: {
          accept: "*/*",
          Authorization: `Token ${token}`,
        },
        responseType: "blob",
      });

      // Extract filename from the content-disposition header
      const contentDisposition = response.headers["content-disposition"];
      let filename = "all_Decorations_Data"; // Default filename

      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1];
        }
      }

      const url = window.URL.createObjectURL(new Blob([response.data], { type: response.headers["content-type"] }));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();

      setPopupMessage("Thanks for downloading!");
    } catch (error) {
      console.error("Error exporting decorations:", error);
      setPopupMessage("Error exporting decorations. Please try again later.");
    } finally {
      setTimeout(() => {
        setShowPopup(false);
      }, 30000);
    }
  };

  const renderDecoration = (decoration, index) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    if (index >= startIndex && index < startIndex + itemsPerPage) {
      return (
        <div className="Decorations_Form_Head2" key={decoration.file_url}>
          <div className="Decorations_Head_Box2"></div>
          <div className="Decorations_Head_Box Blue_Color">{decoration.filename ? decoration.filename : <span>-</span>}</div>
          <div className="Decorations_Head_Box">
            <p>{decoration.upload_date ? decoration.upload_date : <span>-</span>}</p>
          </div>
          <div className="Decorations_Head_Box">{decoration.timestamp ? decoration.timestamp : <span>-</span>}</div>
          <div className="Decorations_Head_Box">
            <a href={`${MainUrl}${decoration.file_url}`} className="Decorations_Add_Decorations_Button_DownLoad" target="blank">
              Download
            </a>
          </div>
        </div>
      );
    }
    return null;
  };

  const renderDecorationsForm = () => {
    return (
      <>
        <div className="">
          <div className="Decorations_Form_Main">
            <div className="Decorations_Form_Head">
              <div className="Decorations_Head_Box Blue_Color">
                <div className="Decorations_Head_Box Blue_Color Selected"></div>
              </div>
              <div className="Decorations_Head_Box Blue_Color">File Name</div>
              <div className="Decorations_Head_Box Blue_Color">Upload Date</div>
              <div className="Decorations_Head_Box Blue_Color">Timestamp</div>
              <div className="Decorations_Head_Box Blue_Color">Download</div>
            </div>
            {filteredDecorations.map(renderDecoration)}
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="Decorations_Container">
      <div className="Decorations_Header">
        <div className="Add_UserLogged">
          <UserLogged />
        </div>
      </div>
      <>
        {showPopup && <Popup message={popupMessage} onClose={() => setShowPopup(false)} />}
        <div className="Decorations_Head_Container">
          <div className="Decorations_Left">
            <div className="Add_Decoration">Decorations</div>
            <div className="Details_Path_Container">
              <a href="/">Home</a>
              <h4>&gt;</h4>
              <h4>Decorations</h4>
            </div>
          </div>
          <div className="Decorations_Right">
            <a href="/ImportDecorations" target="_blank" className="Decorations_Add_Decorations_Button">
              <img src={Import} alt="AddDecorationIcon" className="IE_Icon" />
              Import
            </a>
            <button onClick={handleExportAllDecorations} className="Decorations_Add_Decorations_Button">
              <img src={Export} alt="AddDecorationIcon" className="IE_Icon" />
              Export All Decorations
            </button>
          </div>
        </div>
        <div className="Decorations_Form_Container">
          <div className="">Search By Filter</div>
          <div className="Decorations_Filter_Container">
            <Select
              value={selectedFilter}
              className="Decorations_Filter_Select"
              onChange={(value) => setSelectedFilter(value)}
              options={[
                { value: "filename", label: "File Name" },
                { value: "upload_date", label: "Date" },
              ]}
              placeholder="Select Filter"
            />
            {selectedFilter && (
              <input
                type="text"
                value={searchValue}
                className="Decorations_Filter_Input"
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder={`Search by ${selectedFilter.label}`}
              />
            )}
          </div>
          {renderDecorationsForm()}
          <div className="pagination">
            <div></div>
            <div>{renderPageButtons()}</div>
          </div>
        </div>
      </>
    </div>
  );
}
