import React, { useEffect, useState } from "react";
import "./HomePage.css";
import { useAuth } from "../../Assets/components/Auth/AuthContext";
import { useNavigate } from "react-router-dom";
import UserLogged from "../../Assets/components/Menu/userLogged/userLogged";
import { Link } from "react-router-dom";
import { MainUrl } from "../../config";

const fetchData = async (url, token) => {
  try {
    const response = await fetch(url, {
      headers: {
        accept: "application/json",
        Authorization: `Token ${token}`,
      },
    });
    if (response.ok) {
      return response.json();
    } else {
      throw new Error("Failed to fetch data");
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    return null;
  }
};

const animateCount = (start, end, duration, callback) => {
  let startTime;
  const step = (timestamp) => {
    if (!startTime) startTime = timestamp;
    const progress = Math.min((timestamp - startTime) / duration, 1);
    const value = Math.floor(progress * (end - start) + start);
    callback(value);
    if (progress < 1) {
      requestAnimationFrame(step);
    }
  };
  requestAnimationFrame(step);
};

export default function HomePageContent() {
  const { token } = useAuth();
  const history = useNavigate();
  const [carouselImages, setCarouselImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [totalUnits, setTotalUnits] = useState(0);
  const [galleryRooms, setGalleryRooms] = useState(0);
  const [overallRooms, setOverallRooms] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const initialFetchRooms = async () => {
    setIsLoading(true); // Fetch data in parallel
    const [unitsData, roomsData, roomsGalleryData] = await Promise.all([
      fetchData(`${MainUrl}home/units/`, token),
      fetchData(`${MainUrl}home/rooms/`, token),
      fetchData(`${MainUrl}home/rooms/gallery-rooms/`, token),
    ]);
    setIsLoading(false);

    if (unitsData) {
      animateCount(0, unitsData.length, 2000, setTotalUnits);
      sessionStorage.setItem("unitsData", JSON.stringify(unitsData.length));
    }
    if (roomsData) {
      animateCount(0, roomsData.length, 2000, setOverallRooms);
      sessionStorage.setItem("roomsData", JSON.stringify(roomsData.length));
    }
    if (roomsGalleryData) {
      animateCount(0, roomsGalleryData.count, 2000, setGalleryRooms);
      sessionStorage.setItem("roomsGalleryData", JSON.stringify(roomsGalleryData.count));
    }
  };

  useEffect(() => {
    if (!token) {
      history("/login");
      console.log("No token found");
    }
  }, [token, history]);

  useEffect(() => {
    const fetchCarouselImages = async () => {
      try {
        const data = await fetchData(`${MainUrl}ads/carousel-images/`, token);
        if (data) {
          setCarouselImages(data);
          setCurrentImageIndex(0);
          sessionStorage.setItem("carouselImages", JSON.stringify(data));
        }
      } catch (error) {
        console.error("Error fetching carousel images:", error);
      }
    };

    const cachedCarouselImages = sessionStorage.getItem("carouselImages");
    if (cachedCarouselImages) {
      setCarouselImages(JSON.parse(cachedCarouselImages));
    } else {
      fetchCarouselImages();
    }
  }, [token]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % carouselImages.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [carouselImages]);

  useEffect(() => {
    initialFetchRooms();
  }, []);

  if (!token) {
    history("/login");
    return null;
  }

  return (
    <div className="home-container">
      <>
        <div className="Rooms_Header Rooms_Header_Home">
          <UserLogged />
        </div>
        <section className="hero-section">
          <h1>Welcome to Ogee Decor Dashboard</h1>
          <p>Manage and analyze your decorative finishes for apartments and rooms efficiently.</p>
        </section>

        <section className="data-analysis-section">
          <h2>Data Analysis</h2>
          <div className="data-cards">
            <div className="data-card">
              <h3>Total Unit Created</h3>
              <p>{isLoading ? <HandleLoading /> : totalUnits}</p>
            </div>
            <div className="data-card">
              <h3>Number Of Gallery Rooms</h3>
              <p>{isLoading ? <HandleLoading /> : galleryRooms}</p>
            </div>
            <div className="data-card">
              <h3>Number Of Rooms Overall</h3>
              <p>{isLoading ? <HandleLoading /> : overallRooms}</p>
            </div>
          </div>
        </section>

        <section className="overview-section">
          <h2>Overview</h2>
          <div className="overview-content">
            <div className="slider-container">{carouselImages.length > 0 && <img src={carouselImages[currentImageIndex]} alt="" className="slide_img" />}</div>
            <div className="overview-text">
              <p>
                Our dashboard provides a comprehensive overview of all your decorative finishes projects. Track progress, manage resources, and get insights
                into your projects with ease.
              </p>
            </div>
          </div>
        </section>

        <section className="features-section">
          <h2>Key Features</h2>
          <div className="features-content">
            <Link to="/Rooms" className="feature-box">
              <h3>Manage Rooms</h3>
              <p>Efficiently manage your rooms and decorative finishes projects.</p>
            </Link>
            <Link to="/EditRooms" className="feature-box">
              <h3>Edit Rooms</h3>
              <p>Make quick edits to your rooms and keep track of all changes.</p>
            </Link>
            <Link to="/Addrooms" className="feature-box">
              <h3>Add Rooms</h3>
              <p>Add new rooms easily with our intuitive interface.</p>
            </Link>
            <Link to="/ImportDecorations" className="feature-box">
              <h3>Import Decorations</h3>
              <p>Import your Decorations data seamlessly.</p>
            </Link>
            <Link to="/ExportDecorations" className="feature-box">
              <h3>Export Decorations</h3>
              <p>Export your Decorations data seamlessly.</p>
            </Link>
          </div>
        </section>
      </>
    </div>
  );
}
function HandleLoading() {
  return (
    <>
      <div className="Main_loader">
        <div class="loader2">
          <span>L</span>
          <span>O</span>
          <span>A</span>
          <span>D</span>
          <span>I</span>
          <span>N</span>
          <span>G</span>
        </div>
      </div>
    </>
  );
}
