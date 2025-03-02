import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import html2pdf from "html2pdf.js";
import "./UnitPdf.css";
import Logo from "../../Assets/images/Logo.svg";
import LogoLoading from "../../Assets/images/Logo_Loading.png";

export default function UnitPdf() {
  const [unitData, setUnitData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();
  const timeoutFired = useRef(false);
  const hiddenDivRef = useRef(null);
  const [pdfProcessing, setPdfProcessing] = useState(false);
  const [pdfGenerated, setPdfGenerated] = useState(false);

  useEffect(() => {
    // Timer for Fetching unit Data
    const timer = setTimeout(() => {
      if (loading) {
        timeoutFired.current = true;
        setError("The process is taking too long for fetching data. Please reload the page.");
        setLoading(false);
      }
    }, 30000);

    const fetchUnitData = async () => {
      try {
        const response = await axios.post(
          "https://dash.ogeedecor.com/home/unit-price/",
          { unit_id: id },
          {
            headers: {
              Accept: "*/*",
              "Content-Type": "application/json",
            },
          }
        );

        if (!timeoutFired.current) {
          setUnitData(response.data);
          setLoading(false);
        }
      } catch (err) {
        if (!timeoutFired.current) {
          console.error("Error fetching unit data:", err);
          setError("Failed to load data. Please try again.");
          setLoading(false);
        }
      } finally {
        clearTimeout(timer);
      }
    };

    fetchUnitData();

    return () => clearTimeout(timer);
  }, [id, loading]);

  useEffect(() => {
    // Timer For Generate and upload pdf
    const timer = setTimeout(() => {
      if (loading) {
        timeoutFired.current = true;
        setError("The process is taking too long For generating pdf. Please reload the page.");
        setLoading(false);
      }
    }, 60000);

    if (!loading && unitData && !pdfGenerated) {
      setPdfProcessing(true);
      handleGenerateAndUploadPdf();
      setPdfGenerated(true);
      clearTimeout(timer);
    }
  }, [loading, unitData, pdfGenerated]);

  const calculatePdfHeight = (numberOfRooms) => {
    const baseHeight = 28;
    const heightPerRoom = 4;
    return baseHeight + (numberOfRooms - 1) * heightPerRoom;
  };

  const convertImageToBase64 = (url) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.src = url;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        const dataURL = canvas.toDataURL("image/jpeg");
        resolve(dataURL);
      };
      img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
    });
  };

  const generatePdf = async () => {
    if (!unitData || !unitData.rooms || unitData.rooms.length === 0) {
      console.error("No unit data available for PDF generation.");
      return;
    }

    const element = document.getElementById("pdf-content");
    const images = element.querySelectorAll("img");

    const imagePromises = Array.from(images).map((img) =>
      convertImageToBase64(img.src)
        .then((base64Image) => (img.src = base64Image))
        .catch((error) => console.error("Error converting image to Base64:", error))
    );

    await Promise.all(imagePromises);

    const numberOfRooms = unitData.rooms.length;
    const dynamicHeight = calculatePdfHeight(numberOfRooms);

    const options = {
      margin: 0,
      filename: `Unit_${id}_Details.pdf`,
      image: { type: "jpeg", quality: 1.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: [15, dynamicHeight], orientation: "portrait" },
    };

    return new Promise((resolve, reject) => {
      html2pdf()
        .set(options)
        .from(element)
        .outputPdf("blob")
        .then(resolve)
        .catch((error) => {
          console.error("Error generating PDF:", error);
          reject(error);
        });
    });
  };

  const uploadPdf = async (pdfBlob) => {
    const formData = new FormData();
    formData.append("file", pdfBlob, `Unit_${id}_Details.pdf`);

    try {
      const response = await axios.post(`https://dash.ogeedecor.com/home/upload-pdf/${id}/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      console.log("PDF uploaded successfully", response.data);
    } catch (error) {
      console.error("Error uploading PDF:", error);
    }
  };

  const handleGenerateAndUploadPdf = async () => {
    try {
      const pdfBlob = await generatePdf();
      if (!pdfBlob) return;

      await uploadPdf(pdfBlob);
      const dynamicUrl = `https://dash.ogeedecor.com/pdf/${id}.pdf`;
      window.location.href = dynamicUrl;
    } catch (error) {
      console.error("Error generating or uploading PDF:", error);
    } finally {
      setPdfProcessing(false);
    }
  };

  const reloadPage = () => {
    window.location.reload();
  };

  if (loading || pdfProcessing) {
    return (
      <>
        <div className="ring">
          <img src={LogoLoading} alt="Loading" className="LogoLoading" />
          <span></span>
        </div>
        <div className="WaitLoad">
          Please wait until the PDF file is ready <div className="loader"></div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-ops">Opps</div>
        <p>{error}</p>
        <button onClick={reloadPage} className="reload-button">
          Reload Page
        </button>
      </div>
    );
  }
  return (
    <>
      <div style={{ display: "none" }} ref={hiddenDivRef}>
        <div id="pdf-content" class="Pdf_Container">
          <header class="Pdf_Header">
            <div class="Header_P1">
              <div>
                <img src={Logo} alt="" class="Logo" />
                <h2 class="Header_H2 F1">Units budgeting details</h2>
              </div>
              <div>
                <h1 class="Header_H1">Home {unitData.Unit_Name}</h1>
                <h2 class="Header_H2 F2">
                  Created by <strong>{unitData.Created_By}</strong>
                </h2>
              </div>
            </div>
            <div class="Header_P2">
              <div class="Header_P2_S">
                <h2 class="Header_H2">total Apartment finishing budget</h2>
                <h2 class="Header_H2 Price">{unitData.Total_Unit_Price.toLocaleString()} EGP</h2>
              </div>
              <div class="Header_P2_S">
                <h2 class="Header_H2">total Apartment Area</h2>
                <h2 class="Header_H2">
                  {unitData.rooms.reduce((total, room) => total + room.Floor_Area, 0)} <strong class="Price">m2</strong>
                </h2>
              </div>
            </div>
          </header>
          <article>
            <table class="Table">
              {/* this is Thead for Architect , Budget */}
              <thead>
                <tr class="Table_T1">
                  <th class="Table_T1_B">Architect</th>
                  <th class="Table_T1_B">Budget</th>
                  <th class="Table_T1_B">Units</th>
                  <th class="Table_T1_B">Description of item</th>
                  <th class="Table_T1_B">Design</th>
                  <th>Description of Design</th>
                </tr>
              </thead>
              {/* Rooms Data */}
              <tbody>
                {unitData.rooms.map((room) => (
                  <React.Fragment key={room.Room_ID}>
                    <tr class="Spacer_Row"></tr>
                    {/* next one for room name with the id of room exmaple : - room name : Reception - room id : 3740 */}
                    <tr class="Table_T3">
                      <td colspan="1" class="Table_Td">
                        {room.Room_Name} {room.Room_ID}
                      </td>
                    </tr>
                    {/* Reception First Line include Image */}
                    <tr>
                      <td>Walls</td>
                      <td class="Td_Price">{room.Wall_Material_Price.toFixed(1)}</td>
                      <td class="Td_Currency">EGP</td>
                      <td>{room.Wall_Material_Name}</td>
                      {/* here will be Img for Design */}
                      <td rowspan="7" class="Td_Img_Main">
                        <img
                          src={`https://dash.ogeedecor.com${room.Images?.[room.Images.length - 1]}`}
                          alt={`${room.Room_Name} Design`}
                          className="Td_Img"
                          onError={(e) => {
                            console.error("Error loading image", e);
                          }}
                        />
                      </td>
                      <td rowspan="7" class="Td_Last">
                        <div
                          dangerouslySetInnerHTML={{
                            __html: room.Description_Of_Design_Arabic || room.Description_Of_Design_English || "No description provided",
                          }}
                        />
                      </td>
                    </tr>
                    {/* Reception Walls decorations -1 */}
                    <tr>
                      <td>Walls decorations -1</td>
                      <td class="Td_Price">{room.Wall_Material_Addon1_Price.toFixed(1)}</td>
                      <td class="Td_Currency">EGP</td>
                      <td>{room.Wall_Material_Addon1_Name}</td>
                    </tr>
                    {/* Reception Walls decorations -2 */}
                    <tr>
                      <td>Walls decorations -2</td>
                      <td class="Td_Price">{room.Wall_Material_Addon2_Price.toFixed(1)}</td>
                      <td class="Td_Currency">EGP</td>
                      <td>{room.Wall_Material_Addon2_Name}</td>
                    </tr>
                    {/* Reception Ceiling Painting */}
                    <tr>
                      <td>Ceiling</td>
                      <td class="Td_Price">{room.Ceiling_Material_Price.toFixed(1)}</td>
                      <td class="Td_Currency">EGP</td>
                      <td>{room.Ceiling_Material_Name}</td>
                    </tr>
                    {/* Reception Ceiling decoration - 1 */}
                    <tr>
                      <td>Ceiling decoration - 1</td>
                      <td class="Td_Price">{room.Ceiling_Material_Addon1_Price.toFixed(1)}</td>
                      <td class="Td_Currency">EGP</td>
                      <td>{room.Ceiling_Material_Addon1_Name}</td>
                    </tr>
                    {/* Reception Ceiling decoration - 2 */}
                    <tr>
                      <td>Ceiling decoration - 2</td>
                      <td class="Td_Price">{room.Ceiling_Material_Addon1_Price.toFixed(1)}</td>
                      <td class="Td_Currency">EGP</td>
                      <td>{room.Ceiling_Material_Addon2_Name}</td>
                    </tr>
                    <tr>
                      <td>Flooring</td>
                      <td class="Td_Price">{room.Floor_Material_Price.toFixed(1)}</td>
                      <td class="Td_Currency">EGP</td>
                      <td>{room.Floor_Material_Name}</td>
                    </tr>
                  </React.Fragment>
                ))}
              </tbody>
              {/*  */}

              {/*  */}
              {/* Spaces */}
              <tr class="Spacer_Row"></tr>
              <tr class="Spacer_Row"></tr>
              {/* Total of architectural works */}
              <thead>
                <tr class="Table_T2">
                  <th class="Table_T1_N">Total of architectural works</th>
                  <th class="Table_T1_N">{unitData.Total_Architectural_Works.toFixed(1)}</th>
                  <th class="Table_T1_N">EGP</th>
                  <th class="Table_T1_C"></th>
                  <th class="Table_T1_C"></th>
                  <th class="Table_T1_F"></th>
                </tr>
              </thead>
              <tr class="Spacer_Row"></tr>
              <tr class="Spacer_Row"></tr>
              {/* this to display Svg Plus we made it as thead th to continue in same design */}
              <thead>
                <tr class="Table_Svg">
                  <th class=""></th>
                  <th class=""></th>
                  <th class=""></th>
                  <th class=""></th>
                  <th class=""></th>
                  <th class="">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
                      <rect y="13" width="32" height="6" fill="#777A70" />
                      <rect x="19" width="32" height="6" transform="rotate(90 19 0)" fill="#777A70" />
                    </svg>
                  </th>
                </tr>
              </thead>
              {/* this is Thead for Openings , Budget , Units , ..... */}
              <thead>
                <tr class="Spacer_Row"></tr>
                <tr class="Table_T1">
                  <th class="Table_T1_B">Openings</th>
                  <th class="Table_T1_B">Budget</th>
                  <th class="Table_T1_B">Units</th>
                  <th class="Table_T1_B">Quantity</th>
                  <th class="Table_T1_B">Type</th>
                  <th class="Table_T1_B"></th>
                </tr>
              </thead>
              {/* for window */}
              <tbody>
                <tr class="Spacer_Row"></tr>
                {/* next one for windows and/balcony Area for unit */}
                <tr class="Table_T3">
                  <td colspan="1" class="Table_Td">
                    windows and/balcony Area
                  </td>
                </tr>
                {/* windows and/balcony Windows Budget */}
                <tr class="Table2_Tr">
                  <td>Windows Budget</td>
                  <td class="Td_Price">{unitData.Window_Budget.toFixed(1)}</td>
                  <td class="Td_Currency">EGP</td>
                  <td>{unitData.window_quantity.toLocaleString()}</td>
                  {/* here will be Img for Design */}
                  <td rowspan="1" class="">
                    no.
                  </td>
                  <td rowspan="1" class="Td_Last">
                    <p></p>
                  </td>
                </tr>
              </tbody>
              {/* for doors */}
              <tbody>
                <tr class="Spacer_Row"></tr>
                {/* next one for Doors Area for unit */}
                <tr class="Table_T3">
                  <td colspan="1" class="Table_Td">
                    Doors
                  </td>
                </tr>
                {/* Doors Budget */}
                <tr class="Table2_Tr">
                  <td>Doors Budget</td>
                  <td class="Td_Price">{unitData.Door_Budget.toFixed(1)}</td>
                  <td class="Td_Currency">EGP</td>
                  <td>{unitData.door_quantity.toLocaleString()}</td>
                  {/* here will be Img for Design */}
                  <td rowspan="1" class="">
                    no.
                  </td>
                  <td rowspan="1" class="Td_Last">
                    <p></p>
                  </td>
                </tr>
              </tbody>
              {/*  */}
              <tr class="Spacer_Row"></tr>
              {/* next thead for display Total of Openings works */}
              <thead>
                <tr class="Table_T2">
                  <th class="Table_T1_N">Total of Openings works</th>
                  <th class="Table_T1_N">{unitData.Total_Of_Opening_Works.toFixed(1)}</th>
                  <th class="Table_T1_N">EGP</th>
                  <th class="Table_T1_C"></th>
                  <th class="Table_T1_C"></th>
                  <th class="Table_T1_F"></th>
                </tr>
              </thead>
              {/* Speaces */}
              <tr class="Spacer_Row"></tr>
              <tr class="Spacer_Row"></tr>
              {/* page pdf break down */}
              <tr class="Spacer_Row"></tr>
              <tr class="Spacer_Row"></tr>
              {/* next thead for display MEP-Electrical & plumping */}
              <thead>
                <tr class="Table_T1">
                  <th class="Table_T1_B">MEP-Electrical & plumping</th>
                  <th class="Table_T1_B">Budget</th>
                  <th class="Table_T1_B">Units</th>
                  <th class="Table_T1_B"></th>
                  <th class="Table_T1_B"></th>
                  <th class="Table_T1_B"></th>
                </tr>
              </thead>
              {/* next tbody for display  Electrical - Phase 1 */}
              <tbody>
                <tr class="Spacer_Row"></tr>
                {/* next one for Electrical - Phase 1 for unit */}
                <tr class="Table_T3">
                  <td class="Table_Td">Electrical</td>
                </tr>
                {/* next for Electrical - Finish */}
                <tr class="Table2_Tr TabNonBB">
                  {/* Electrical - Phase 1 */}
                  <td>Electrical - Phase 1</td>
                  {/* Budget */}
                  <td class="Td_Price">{unitData.Electrical_Phase_1.toFixed(1)}</td>
                  {/* Units */}
                  <td class="Td_Currency">EGP</td>
                  {/* Quantity / Space */}
                  <td></td>
                  {/* Type */}
                  <td class=""></td>
                  <td class="Td_Last">
                    <p></p>
                  </td>
                </tr>
                <tr class="Table2_Tr">
                  {/* Electrical - Phase 1 */}
                  <td>Electrical - Finish</td>
                  {/* Budget */}
                  <td class="Td_Price">{unitData.Electrical_Finish.toFixed(1)}</td>
                  {/* Units */}
                  <td class="Td_Currency">EGP</td>
                  {/* Quantity / Space */}
                  <td></td>
                  {/* Type */}
                  <td class=""></td>
                  <td class="Td_Last">
                    <p></p>
                  </td>
                </tr>
              </tbody>
              {/*  */}
              {/*  */}
              {/*  */}
              {/* next tbody for display Plumping - Phase 1 */}
              <tbody>
                <tr class="Spacer_Row"></tr>
                {/* next one for Plumping - Phase 1 for unit */}
                <tr class="Table_T3">
                  <td class="Table_Td">Plumping</td>
                </tr>
                {/* next for Plumping - Phase 1 */}
                <tr class="Table2_Tr TabNonBB">
                  {/* Plumping - Phase 1 */}
                  <td>Plumping - Phase 1</td>
                  {/* Budget */}
                  <td class="Td_Price">{unitData.Plumbing_Phase_1.toFixed(1)}</td>
                  {/* Units */}
                  <td class="Td_Currency">EGP</td>
                  {/* Quantity / Space */}
                  <td></td>
                  {/* Type */}
                  <td class=""></td>
                  <td class="Td_Last">
                    <p></p>
                  </td>
                </tr>
                <tr class="Table2_Tr">
                  {/* Plumping - Phase 1 */}
                  <td>Plumping - Finish</td>
                  {/* Budget */}
                  <td class="Td_Price">{unitData.Plumbing_Finish.toFixed(1)}</td>
                  {/* Units */}
                  <td class="Td_Currency">EGP</td>
                  {/* Quantity / Space */}
                  <td></td>
                  {/* Type */}
                  <td class=""></td>
                  <td class="Td_Last">
                    <p></p>
                  </td>
                </tr>
              </tbody>
              {/* Accessories */}
              <tbody>
                <tr class="Spacer_Row"></tr>
                {/* next one for Accessories for unit */}
                <tr class="Table_T3">
                  <td class="Table_Td">Accessories</td>
                </tr>
                {/* next for Airconditionings */}
                <tr class="Table2_Tr">
                  {/* Accessories */}
                  <td>Airconditionings</td>
                  {/* Budget */}
                  <td class="Td_Price">{unitData.Airconditioning.toFixed(1)}</td>
                  {/* Units */}
                  <td class="Td_Currency">EGP</td>
                  {/* Quantity / Space */}
                  <td></td>
                  {/* Type */}
                  <td></td>
                  <td class="Td_Last"></td>
                </tr>
              </tbody>
              <tr class="Spacer_Row"></tr>
              <tr class="Spacer_Row"></tr>
              {/* next for Total of MEP works */}
              <thead>
                <tr class="Table_T2">
                  <th class="Table_T1_N">Total of MEP works</th>
                  <th class="Table_T1_N">{unitData.Total_MEP_Work.toFixed(1)}</th>
                  <th class="Table_T1_N">EGP</th>
                  <th class="Table_T1_C"></th>
                  <th class="Table_T1_C"></th>
                  <th class="Table_T1_F"></th>
                </tr>
              </thead>
              <tr class="Spacer_Row"></tr>
              {/* this to display Svg Plus we made it as thead th to continue in same design */}
              <thead>
                <tr class="Table_Svg">
                  <th class=""></th>
                  <th class=""></th>
                  <th class=""></th>
                  <th class=""></th>
                  <th class=""></th>
                  <th class="">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
                      <rect y="13" width="32" height="6" fill="#777A70" />
                      <rect x="19" width="32" height="6" transform="rotate(90 19 0)" fill="#777A70" />
                    </svg>
                  </th>
                </tr>
              </thead>
              {/* end Svg Plus */}
              <tr class="Spacer_Row"></tr>
              {/* next for display Addetional works */}
              <thead>
                <tr class="Table_T2">
                  <th class="Table_T1_N">Addetional works تشوينات</th>
                  <th class="Table_T1_N">{unitData.Additional_Works.toFixed(1)}</th>
                  <th class="Table_T1_N">EGP</th>
                  <th class="Table_T1_C"></th>
                  <th class="Table_T1_C"></th>
                  <th class="Table_T1_F"></th>
                </tr>
              </thead>
              {/*  */}
              <tr class="Spacer_Row"></tr>
              <tr class="Spacer_Row"></tr>
            </table>
            {/* this to display Svg Equal */}
            <div class="Svg_Equal">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="20" viewBox="0 0 32 20" fill="none">
                <rect width="32" height="6" fill="#777A70" />
                <rect x="32" y="20" width="32" height="6" transform="rotate(-180 32 20)" fill="#777A70" />
              </svg>
            </div>
            {/* end Svg Equal */}
            {/* next table for display total amout of finishing budget */}
            <table class="Table_LAST">
              <thead>
                <tr class="Spacer_Row"></tr>
                <tr class="Table_T3">
                  <th class="Foot_Th1">total Apartment finishing budget</th>
                  <th class="Foot_Th2">{unitData.Total_Unit_Price.toLocaleString()}</th>
                  <th class="Foot_Th3">EGP</th>
                  <th class="Foot_Th4">total Apartment Area</th>
                  <th class="Foot_Th5">{unitData.rooms.reduce((total, room) => total + room.Floor_Area, 0)}</th>
                  <th class="Foot_Th6">m2</th>
                </tr>
              </thead>
            </table>
          </article>
          <div className="NotesMain">
            <div className="Remarks_S">
              <div>
                <div className="Remarks">* Pricing Notes:</div>
                {/*  */}
                <div className="Remarks_S">
                  <ul className="Remarks_S">
                    <li>
                      Pricing does not include any type of furnishings in all spaces. (We consider kitchen units, sanitaryunits, and sink mixers as furnishings
                      due to their varying prices.)
                    </li>
                    <li>Does not include lighting units.</li>
                    <li>Does not include electrical appliances.</li>
                    <li>
                      Includes provisions for all air conditioning units in the apartment automatically, as well as air conditioning units in rooms – only those
                      you selected from the (Advanced Settings) list.
                    </li>
                    <li>Does not cover the costs of engineering supervision or any kind of design services.</li>
                  </ul>
                </div>
              </div>
              {/*  */}
              {/*  */}
              <div>
                <div className="Remarks">
                  {" "}
                  <span className="Remarks">General Notes:</span> This pricing is based on a calculation method that relies on the selected designs, entered{" "}
                  {/* <br /> */}
                  areas, and what is commonly used in the Egyptian market to achieve an accuracy exceeding 90%. Here are some tips:
                </div>
                <div>
                  <ul className="Remarks_S">
                    <li>Choose the correct floor level for your unit so that the correct material handling percentage is applied during finishing.</li>
                    <li>Try to input room dimensions as accurately as possible.</li>
                    <li>Check other default inputs in the (Advanced Settings) list.</li>
                    <li>
                      Also, in the (Advanced Settings) list, select certain kitchen appliances and bathroom furnishings so that their installations are included
                      in the electrical and plumbing work.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
