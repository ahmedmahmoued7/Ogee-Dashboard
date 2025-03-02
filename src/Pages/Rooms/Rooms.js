import React, { useState, useEffect } from "react";
import "./Rooms.css";
import AddRoomIcon from "../../Assets/images/AddRoomsIcon.svg";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import UserLogged from "../../Assets/components/Menu/userLogged/userLogged";
import { useAuth } from "../../Assets/components/Auth/AuthContext";
import { MainUrl } from "../../config";

function RoomsContent() {
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

  const [rooms, setRooms] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRooms, setSelectedRooms] = useState(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const { token } = useAuth();
  const history = useNavigate();

  const fetchRooms = async (page = 1) => {
    setIsLoading(true);
    try {
      if (!token) {
        history("/login");
        console.log("No token found");
        return;
      }

      const url = `${MainUrl}home/rooms/gallery-rooms/?page=${page}`;
      const response = await axios.get(url, {
        headers: {
          accept: "application/json",
          Authorization: `Token ${token}`,
        },
      });

      const { results: fetchedRooms, count } = response.data;
      const checkRoomsId = Array.from(new Set(fetchedRooms.map((room) => room.id))).map((id) => fetchedRooms.find((room) => room.id === id));

      setRooms(checkRoomsId);
      setFilteredRooms(checkRoomsId);
      setTotalPages(Math.ceil(count / fetchedRooms.length));
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching rooms data:", error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms(currentPage);
  }, [currentPage]);

  const handleSelectAllToggle = () => {
    if (selectAll) {
      setSelectedRooms(new Set());
    } else {
      const newSelectedRooms = new Set(filteredRooms.map((room) => room.id));
      setSelectedRooms(newSelectedRooms);
    }
    setSelectAll(!selectAll);
  };

  const handleRoomSelection = (roomId) => {
    setSelectedRooms((prevSelectedRooms) => {
      const newSelectedRooms = new Set(prevSelectedRooms);
      if (newSelectedRooms.has(roomId)) {
        newSelectedRooms.delete(roomId);
      } else {
        newSelectedRooms.add(roomId);
      }

      setSelectAll(newSelectedRooms.size === filteredRooms.length);
      return newSelectedRooms;
    });
  };

  const handleDeleteSelectedRooms = async () => {
    for (let roomId of selectedRooms) {
      await axios.delete(`${MainUrl}home/rooms/${roomId}/`, {
        headers: {
          accept: "application/json",
          Authorization: `Token ${token}`,
        },
      });
    }

    setSelectedRooms(new Set());
    setSelectAll(false);

    window.location.reload();
    await fetchRooms();
  };

  const renderRoom = (room) => {
    return (
      <div className="Rooms_Form_Head2" key={room.id}>
        <div className="Rooms_Head_Box2">
          <input type="checkbox" checked={selectedRooms.has(room.id)} onChange={() => handleRoomSelection(room.id)} className="checkboxRooms" />
        </div>
        <div className="Rooms_Head_Box Blue_Color">
          {room.design_code ? (
            <a href={`/Room/${room.id}/edit`} className="Rooms_Link">
              {room.design_code}
            </a>
          ) : (
            <span>-</span>
          )}
        </div>
        <div className="Rooms_Head_Box">
          <p>{room.english_name ? room.english_name : <span>-</span>}</p>
        </div>
        <div className="Rooms_Head_Box">
          <h4 className="Rooms_Link">
            {/* {roomPrice} */}
            {parseFloat(room.calculated_price).toFixed(1)}
          </h4>
        </div>
        <div className="Rooms_Head_Box">{room.percentage ? room.percentage : <span>-</span>}</div>
        <div className="Rooms_Head_Box">{room.floor_area ? parseFloat(room.floor_area).toFixed(2) : <span>-</span>}</div>
        <div className="Rooms_Head_Box">
          {room.images && room.images.length > 0 ? <img src={room.images[0].image} alt="Room" className="Rooms_Images_Preview" /> : <span>--</span>}
        </div>
        <div className="Rooms_Head_Box">
          <a href={`${MainUrl}pdf/${room.id}.pdf`} className="Rooms_Add_Rooms_Button_DownLoad" target="blank_">
            DownLoad
          </a>
        </div>
      </div>
    );
  };

  const renderRoomsForm = () => {
    return (
      <div className="Rooms_Form_Main">
        <div className="Rooms_Form_Head">
          <div className="Rooms_Head_Box Blue_Color">
            <input type="checkbox" checked={selectAll} onChange={handleSelectAllToggle} className="checkboxRooms" />
          </div>
          <div className="Rooms_Head_Box Blue_Color">Design code</div>
          <div className="Rooms_Head_Box Blue_Color">English name</div>
          <div className="Rooms_Head_Box Blue_Color">Calculated price</div>
          <div className="Rooms_Head_Box Blue_Color">Correction Factor</div>
          <div className="Rooms_Head_Box Blue_Color">Room Area</div>
          <div className="Rooms_Head_Box Blue_Color">Preview Image</div>
          <div className="Rooms_Head_Box Blue_Color">Download Pdf</div>
        </div>
        {filteredRooms.map(renderRoom)}
      </div>
    );
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const maxPagesToShow = 5;
    let startPage = currentPage - Math.floor(maxPagesToShow / 2);
    let endPage = currentPage + Math.floor(maxPagesToShow / 2);

    if (startPage < 1) {
      startPage = 1;
      endPage = Math.min(totalPages, maxPagesToShow);
    }

    if (endPage > totalPages) {
      endPage = totalPages;
      startPage = Math.max(1, totalPages - maxPagesToShow + 1);
    }

    const pages = [];
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          className={`Button_Page ${i === currentPage ? "Button_Page Button_Active" : "Button_Page Button_NotActive"}`}
          onClick={() => {
            setCurrentPage(i);
            fetchRooms(`${MainUrl}home/rooms/gallery-rooms/?page=${i}`);
          }}
        >
          {i}
        </button>
      );
    }

    return (
      <div className="Rooms_Pagination">
        <button
          className="Button_Page"
          onClick={() => {
            if (currentPage > 1) {
              setCurrentPage(currentPage - 1);
              fetchRooms(`${MainUrl}home/rooms/gallery-rooms/?page=${currentPage - 1}`);
            }
          }}
          disabled={currentPage === 1}
        >
          &lt;
        </button>
        {pages}
        <button
          className="Button_Page"
          onClick={() => {
            if (currentPage < totalPages) {
              setCurrentPage(currentPage + 1);
              fetchRooms(`${MainUrl}home/rooms/gallery-rooms/?page=${currentPage + 1}`);
            }
          }}
          disabled={currentPage === totalPages}
        >
          &#10155;
        </button>
      </div>
    );
  };

  return (
    <div className="Rooms_Container">
      <div className="Rooms_Header">
        <UserLogged />
      </div>
      {isLoading ? (
        <LoadingPopup />
      ) : (
        <>
          <div className="Rooms_Head_Container">
            <div className="Rooms_Left">
              <div className="Add_Room">Rooms</div>
              <div className="Details_Path_Container">
                <Link to="/">Home</Link>
                <h4>&gt;</h4>
                <h4>Rooms</h4>
              </div>
            </div>
            <div className="Rooms_Right">
              <a href="/AddRooms" target="_blank" className="Rooms_Add_Rooms_Button">
                <img src={AddRoomIcon} alt="AddRoomIcon" />
                Add Rooms
              </a>
            </div>
          </div>
          <div className="Rooms_Form_Container">
            {renderRoomsForm()}
            <div className="pagination">
              <div className="Rooms_Delete_Button_Container">
                <button onClick={handleDeleteSelectedRooms} className="Rooms_Delete_Button">
                  Delete Selected Rooms
                </button>
              </div>
              {renderPagination()}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default RoomsContent;
