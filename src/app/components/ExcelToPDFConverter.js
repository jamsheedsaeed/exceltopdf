"use client";
import React, { useState } from "react";
import * as XLSX from "xlsx";
import generatePDF from "../../../utils";

const ExcelToPDFConverter = () => {
  const [excelFile, setExcelFile] = useState(null);
  const [selectedFileName, setSelectedFileName] = useState("");

  const readExcelFile = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
  
      reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const excelData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName],{ defval: null });
        resolve(excelData);
      };
  
      reader.onerror = (error) => {
        reject(error);
      };
  
      reader.readAsArrayBuffer(file);
    });
  };

  const handleFileChange = (e) => {
    const fileName = e.target.files[0]?.name || "";
    setSelectedFileName(fileName);
    setExcelFile(e.target.files[0]);
  };

  const handleConvertClick = async () => {
    try {
      const excelData = await readExcelFile(excelFile);
      generatePDF(excelData);
    } catch (error) {
      console.error("Error converting Excel to PDF:", error);
    }
  };

  return (
    <div className="flex items-center justify-center mt-8">
      <label
        htmlFor="fileInput"
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded cursor-pointer transition duration-300 ease-in-out"
      >
        Choose File
      </label>
      <input
        type="file"
        id="fileInput"
        className="hidden"
        onChange={handleFileChange}
      />
      <span className="ml-4 text-gray-700" id="fileName">
        {selectedFileName && `Selected File: ${selectedFileName}`}
      </span>
      <button
        onClick={handleConvertClick}
        className="ml-4 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out"
      >
        Convert to PDF
      </button>

    </div>
  );
  
};

export default ExcelToPDFConverter;
