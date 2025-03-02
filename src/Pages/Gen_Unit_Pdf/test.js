// here for generate the pdf then upload it to api , then download pdf

// const handleGenerateAndUploadPdf = async () => {
//   try {
//     console.log("Starting PDF generation...");

//     const pdfBlob = await generatePdf();

//     if (!pdfBlob) {
//       console.error("Failed to generate PDF Blob.");
//       return;
//     }

//     console.log("PDF generated successfully, proceeding to upload...");

//     await uploadPdf(pdfBlob);

//     console.log("PDF uploaded successfully, now downloading...");

//     downloadPdf(pdfBlob); // Automatically download the PDF
//   } catch (error) {
//     console.error("Error generating or uploading PDF:", error);
//   }
// };
