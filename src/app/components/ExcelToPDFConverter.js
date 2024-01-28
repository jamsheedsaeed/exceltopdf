"use client";
import React, { useEffect, useState } from "react";
import generatePDF from "../../../utils";

const ExcelToPDFConverter = () => {
  const [jsonData, setJsonData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch("/dataset.json");
      const data = await response.json();
      setJsonData(data);
    };
    fetchData();
  }, []);

  const handleConvertClick = async () => {
    try {
      generatePDF(jsonData);
    } catch (error) {
      console.error("Error converting Excel to PDF:", error);
    }
  };

  return (
    <div className="flex items-center justify-center mt-8">
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
