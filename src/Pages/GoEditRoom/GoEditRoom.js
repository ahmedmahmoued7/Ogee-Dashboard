import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./GoEditRoom.css";
import { useAuth } from "../../Assets/components/Auth/AuthContext";
import axios from "axios";
import Select from "react-select";
import { MainUrl } from "../../config";
import UserLogged from "../../Assets/components/Menu/userLogged/userLogged";

export default function GoEditRoomContent() {
  const [selectedDesignCode, setSelectedDesignCode] = useState("");
  const history = useNavigate();
  const [rooms, setRooms] = useState([]);
  const { token } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const handleInputChange = (e) => {
    setSelectedDesignCode(e.target.value);
  };

  const handleSelectChange = (selectedOption) => {
    if (selectedOption === null) {
      setSelectedDesignCode("");
    } else if (selectedOption.value === "next") {
      handleNextPage();
    } else if (selectedOption.value === "back") {
      handlePreviousPage();
    } else {
      setSelectedDesignCode(selectedOption.value);
    }
  };

  const handleGoEditRoom = async () => {
    if (selectedDesignCode.trim()) {
      const selectedRoom = rooms.find((room) => room.design_code === selectedDesignCode);

      if (selectedRoom) {
        history(`/Room/${selectedRoom.id}/edit`);
      } else {
        try {
          setIsLoading(true);
          let page = 1;
          let foundRoom = null;
          let totalPages = 1;

          while (page <= totalPages && !foundRoom) {
            console.log(`Searching page ${page} for design code: ${selectedDesignCode}`);

            const response = await axios.get(`${MainUrl}home/rooms/gallery-rooms/?page=${page}`, {
              headers: {
                accept: "application/json",
                Authorization: `Token ${token}`,
              },
            });

            const { results: fetchedRooms, count } = response.data;
            const pageSize = fetchedRooms.length;
            totalPages = Math.ceil(count / pageSize);
            foundRoom = fetchedRooms.find((room) => room.design_code === selectedDesignCode);
            if (foundRoom) {
              history(`/Room/${foundRoom.id}/edit`);
              break;
            }
            page++;
          }

          if (!foundRoom) {
            alert("Design code not found.");
          }
        } catch (error) {
          console.error("Error while searching for design code:", error);
          alert("Error occurred while searching for the design code.");
        } finally {
          setIsLoading(false);
        }
      }
    } else {
      alert("Please enter or select a valid Design Code");
    }
  };

  const fetchRooms = async (page) => {
    try {
      if (!token) {
        history("/login");
        console.log("No token found");
        return;
      }

      const response = await axios.get(`${MainUrl}home/rooms/gallery-rooms/?page=${page}`, {
        headers: {
          accept: "application/json",
          Authorization: `Token ${token}`,
        },
      });

      const { results: fetchedRooms, count } = response.data;

      const checkRoomsId = Array.from(new Set(fetchedRooms.map((room) => room.id))).map((id) => fetchedRooms.find((room) => room.id === id));

      setRooms(checkRoomsId);
      setTotalPages(Math.ceil(count / checkRoomsId.length));
    } catch (error) {
      console.error("Error fetching rooms data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    fetchRooms(currentPage);
  }, [currentPage]);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setIsLoading(true);
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setIsLoading(true);
      setCurrentPage(currentPage - 1);
    }
  };

  const designCodeOptions = rooms.map((room) => ({
    value: room.design_code,
    label: room.design_code,
  }));

  if (currentPage > 1) {
    designCodeOptions.unshift({
      value: "back",
      label: "<< Back",
      isDisabled: false,
    });
  }

  if (currentPage < totalPages) {
    designCodeOptions.push({
      value: "next",
      label: "Next >>",
      isDisabled: false,
    });
  }

  const LoadingPopup = () => (
    <div className="loading-popup">
      <div className="loading-circle">
        <div className="loading-semicircle"></div>
      </div>
      <div className="loading-text">
        Loading<span className="loading-dots"></span>
      </div>
    </div>
  );

  return (
    <>
      {isLoading ? (
        <LoadingPopup />
      ) : (
        <>
          <div>
            <div className="GoEdit_UserLogged">
              <UserLogged />
            </div>
            <div className="GoEdit_Container">
              <div className="GoEdit_Main">
                <div>Welcome! Please enter the design code for the room you want to edit</div>
                <div className="input-container">
                  <div className="GoEdit_Box">
                    <h3>Choose Design code</h3>
                    <Select
                      className="GoEdit_Select_Box"
                      value={designCodeOptions.find((option) => option.value === selectedDesignCode) || null}
                      onChange={handleSelectChange}
                      options={designCodeOptions}
                      placeholder="Select a design code..."
                      isClearable
                    />
                  </div>
                  <div>or</div>
                  <div className="GoEdit_Box">
                    <h3>Enter Design code</h3>
                    <input type="text" className="styled-input" placeholder="Design code" value={selectedDesignCode} onChange={handleInputChange} />
                  </div>
                </div>
                <div>
                  <button className="GoEdit_Room_Button" onClick={handleGoEditRoom}>
                    Go Edit Room
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
