import React, { useState } from "react";
import axios from "axios";
import UserLogged from "../../Assets/components/Menu/userLogged/userLogged";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./ImportDecorations.css";
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

export default function ImportDecorationsContent() {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    const validTypes = ["text/csv", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"];

    if (selectedFile && validTypes.includes(selectedFile.type) && selectedFile.size <= 10 * 1024 * 1024) {
      setFile(selectedFile);
    } else {
      toast.error("Please select a CSV or XLSX file");
      event.target.value = "";
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!file) {
      toast.error("Please select a file to upload.");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(`${MainUrl}home/api/upload/`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          "X-CSRFTOKEN": "CNsDX2gsbzhC9cOx93j6NmxkCmHztnqb2uJOMK4T5znnRnrTgljAIXG4NMHybGMR",
        },
      });

      if (response.status === 200) {
        setPopupMessage("Thank you, file is uploaded.");
        setTimeout(() => {
          window.location.href = "/ExportDecorations";
        }, 3000);
      } else {
        throw new Error("File upload failed.");
      }
    } catch (error) {
      setPopupMessage(`An error occurred while uploading the file - Error : ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      <div className="ImDec_Container">
        <div className="Decorations_Header">
          <div className="Add_UserLogged">
            <UserLogged />
          </div>
        </div>
        <div className="ImDec_Main">
          <div className="Dec_Head_Container">
            <div className="Dec_Left">
              <div className="Dec_Room">Decorations Data</div>
              <div className="Dec_Path_Container">
                <a href="/">Home</a>
                <h4>&gt;</h4>
                <a href="/ExportDecorations">Decorations</a>
                <h4>&gt;</h4>
                <h4>Import decorations data</h4>
              </div>
            </div>
          </div>
          <div className="Import_Upload">
            <form onSubmit={handleSubmit} encType="multipart/form-data">
              <div className="Form_Upload">
                <div className="Form_Upload_File">
                  <div className="Form_Upload_Text">Upload New Decorations Data :</div>
                  <label htmlFor="file" className="custom-file-upload">
                    Select a file to upload
                  </label>
                  <input type="file" id="file" name="file" onChange={handleFileChange} />
                  {file && (
                    <div className="file-info">
                      <span>Selected file : "{file.name}"</span>
                    </div>
                  )}
                </div>
                <div className="upload-notes">
                  <p>
                    <span>*</span>Allowed file types:
                    <span> Excel ( .csv - .xlsx ) </span>
                  </p>
                  <p>
                    <span>*</span>Maximum file size: <span>10MB .</span>
                  </p>
                </div>
                <button type="submit" className="Imp_Add_Dec_Button" disabled={isUploading}>
                  {isUploading ? "Uploading..." : "Upload"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <ToastContainer />
      {popupMessage && <Popup message={popupMessage} onClose={() => setPopupMessage("")} />}
    </>
  );
}
