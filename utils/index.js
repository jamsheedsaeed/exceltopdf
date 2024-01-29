import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import html2canvas from "html2canvas";
pdfMake.vfs = pdfFonts.pdfMake.vfs;

export default function generatePDF(jsData) {
  try {
    // Create the Header for first Table
    const firstTableHeader = "MJESEČNI SAŽETAK ZA PRAĆENJE (DNEVNIK OBILASKA)";
    // Create Headers for the second Table
    const headerdata = {
      __EMPTY: null,
      "#VALUE!": "Redni broj",
      __EMPTY_1: "Ime i prezime krajnjeg korisnika",
      __EMPTY_2: "OIB krajnjeg korisnika",
    };
    // Add numbers from 3 to 34
    for (let i = 3; i <= 34; i++) {
      headerdata[`__EMPTY_${i}`] = i - 2;
    }
    // Add "Ukupno" at the end
    headerdata["__EMPTY_34"] = "Ukupno";
    //---------------------------------------------------------------
    const thirdTableValues = jsData.thirdTable;
    const thirdtblFirstColVal = thirdTableValues.name;
    const thirdtblSecColVal = thirdTableValues.value;

    const lastTableData = jsData.fourthTable;
    const lastTableDataHeader = {
      countColumn: "Redni broj",
      nameColumn: "Ime i prezime krajnjeg korisnika",
      oibColumn: "OIB krajnjeg korisnika",
      workdoneColumn:
        "Navesti opis usluga izvršenih od strane pružatelja usluge za svakog krajnjeg korisnika",
    };
    const signaturesName = jsData.signature.name;
    const columnIndexToChangeColor = 34; // Change this index as needed
    const rowIndexToChangeColor = 10; // Change this index as needed
    const columnIndexToChangeFontColor = 1; // Index of the first column

    // Ensure tableBody is not undefined before using it
    const tableBody =
      lastTableData?.map((data, index) => {
        // Set a default height for all rows except the first one
        const rowHeight = index === 0 ? null : 60; // Adjust the height as per your requirement
        return [
          {
            text: index + 1,
            style: "tableCellLastTable",
            rowSpan: 1,
            height: rowHeight,
            alignment: "center",
          }, // Increase the height for all rows except the first one
          {
            text: data.name,
            style: "redTextLastTable",
            rowSpan: 1,
            height: rowHeight,
            alignment: "center",
          },
          {
            text: data.oib,
            style: "tableCellLastTable",
            rowSpan: 1,
            height: rowHeight,
          },
          {
            text: data.workDone,
            style: "tableCellLastTable",
            rowSpan: 1,
            height: rowHeight,
          },
        ];
      }) || [];

    let transformedArray = [];

    // Loop through each object in the original array
    jsData.secondTable.forEach((item, index) => {
      // Transform each object
      let transformedObject = {
        __EMPTY: null,
        "#VALUE!": index + 1,
        __EMPTY_1: item.name,
        __EMPTY_2: item.oib,
      };

      // Map days to respective slots
      for (let i = 1; i <= 31; i++) {
        transformedObject[`__EMPTY_${i + 2}`] = item.days.includes(i)
          ? "x"
          : null;
      }
      transformedObject[`__EMPTY_34`] = item.days.length;

      // Add the transformed object to the result array
      transformedArray.push(transformedObject);
    });
    // Add the additional row to the result array
    //transformedArray.push(additionalRow);
    let columnCounts = Array(35).fill(0); // Assuming there are 35 columns including "__EMPTY" and "#VALUE!"
    let totalValuesRowCount = 0;
    // Iterate over each transformed object in the transformedArray
    transformedArray.forEach((transformedObject, index) => {
      if (index < transformedArray.length) {
        totalValuesRowCount =
          totalValuesRowCount + transformedObject[`__EMPTY_34`];
      }
      // Iterate over each column and count non-null values
      for (let i = 3; i <= 34; i++) {
        // Starting from column "__EMPTY_3" to "__EMPTY_34"
        if (transformedObject[`__EMPTY_${i}`] !== null) {
          columnCounts[i]++;
        }
      }
    });

    // Create the additional row for showing the count of values in each column
    let totalCountRow = {
      __EMPTY: null,
      "#VALUE!": {
        text: "",
        alignment: "center",
        border: [false, false, false, false],
      }, // Colspan 3 and centered
      __EMPTY_1: {
        text: "UKupno",
        alignment: "center",
        border: [true, true, false, true],
      }, // Colspan 3 and centered
      __EMPTY_2: {
        text: "",
        alignment: "center",
        border: [false, true, true, true],
      }, // Colspan 3 and centered
    };

    // Iterate over each column count and assign it to the corresponding column in the total count row
    for (let i = 3; i <= 34; i++) {
      // Starting from column "__EMPTY_3" to "__EMPTY_34"
      if (i == 34) {
        totalCountRow[`__EMPTY_34`] = totalValuesRowCount;
      } else {
        totalCountRow[`__EMPTY_${i}`] = columnCounts[i];
      }
    }

    // Add the total count row to the result array
    transformedArray.push(totalCountRow);

    const allHeaders = Object.keys(headerdata || {}).filter(
      (header) => header !== "__EMPTY"
    );
    const mappedData = Object.entries(jsData.firstTable).map(([key, value]) => [
      key,
      value,
    ]);

    pdfMake.tableLayouts = {
      exampleLayout: {
        hLineWidth: function (i, node) {
          // Set thicker horizontal lines for the first row, last row, and header row
          return i === 0 ||
            i === node.table.body.length ||
            i === node.table.headerRows
            ? 0.5
            : 0.3;
        },
        vLineWidth: function (i) {
          // Set thicker vertical lines
          return 0.5;
        },
        hLineColor: function (i) {
          // Set black color for horizontal lines
          return "black";
        },
        paddingLeft: function (i) {
          // Set padding for left side of cells
          return i === 0 ? 2 : 2;
        },
        paddingRight: function (i, node) {
          // Set padding for right side of cells
          return i === node.table.widths.length - 1 ? 0 : 8;
        },
      },
      secondTableLayout: {
        hLineWidth: function (i, node) {
          // Set thicker horizontal lines for the first row, last row, and header row
          return i === 0 ||
            i === node.table.body.length ||
            i === node.table.headerRows
            ? 0.5
            : 0.3;
        },
        vLineWidth: function (i) {
          // Set thicker vertical lines
          return 0.5;
        },
        hLineColor: function (i) {
          // Set black color for horizontal lines
          return "black";
        },
        paddingLeft: function (i) {
          // Set padding for left side of cells
          return i === 0 ? 2 : 2;
        },
        paddingRight: function (i, node) {
          // Set padding for right side of cells
          return i === node.table.widths.length - 1 ? 0 : 8;
        },
      },
      fourthTableLayout: {
        hLineWidth: function (i, node) {
          // Set thicker horizontal lines for the first row, last row, and header row
          return i === 0 ||
            i === node.table.body.length ||
            i === node.table.headerRows
            ? 0.5
            : 0.3;
        },
        vLineWidth: function (i) {
          // Set thicker vertical lines
          return 0.5;
        },
        hLineColor: function (i) {
          // Set black color for horizontal lines
          return "black";
        },
        paddingLeft: function (i) {
          // Set padding for left side of cells
          return i === 0 ? 2 : 2;
        },
        paddingRight: function (i, node) {
          // Set padding for right side of cells
          return i === node.table.widths.length - 1 ? 0 : 8;
        },
      },
      thirdTableLayout: {
        hLineWidth: function (i, node) {
          // Set thicker horizontal lines for the first row, last row, and header row
          return i === 0 ||
            i === node.table.body.length ||
            i === node.table.headerRows
            ? 0.5
            : 0.3;
        },
        vLineWidth: function (i) {
          // Set thicker vertical lines
          return 0.5;
        },
        hLineColor: function (i) {
          // Set black color for horizontal lines
          return "black";
        },
        paddingLeft: function (i) {
          // Set padding for left side of cells
          return i === 0 ? 2 : 2;
        },
        paddingRight: function (i, node) {
          // Set padding for right side of cells
          return i === node.table.widths.length - 1 ? 0 : 8;
        },
      },
    };

    var docDefinition = {
      pageOrientation: "landscape",
      pageSize: { width: 940, height: 580.68 }, // Set custom page size (14.67 × 11.33 in)
      pageMargins: [70, 90, 70, 50],
      // Add event handler to remove header on page breaks

      content: [
        {
          layout: "exampleLayout",
          table: {
            headerRows: 1,
            widths: [100, "*"],
            body: [
              [
                {
                  text: "",
                  style: "tableHeaderFirst",
                  border: [true, true, false, true],
                },
                {
                  text: firstTableHeader,
                  style: "tableHeaderFirst",
                  border: [false, true, true, true],
                },
              ],
              ...mappedData.map((row, index) => [
                { text: row[0], style: "tableCellB" },
                {
                  text: row[1],
                  style:
                    index !== mappedData.length - 1
                      ? "tableCellRed"
                      : "tableCell",
                },
              ]),
            ],
          },
        },
        { text: "\n", fontSize: 10 },
        {
          layout: "secondTableLayout",
          table: {
            headerRows: 1,
            widths: [
              40,
              "*", // Increased width for the second column
              83,
              "auto",
              "auto",
              "auto",
              "auto",
              "auto",
              "auto",
              "auto",
              ...Array.from({ length: allHeaders.length - 10 }, () => "auto"),
            ],
            heights: 8,
            body: [
              [
                ...allHeaders.map((header) => ({
                  text: headerdata[header],
                  style: "tableCellBold",
                  alignment: "center",
                })),
              ],
              ...transformedArray.map((row, rowIdx) => {
                // Check if it's the last row
                const isLastRow = rowIdx === transformedArray.length - 1;

                return allHeaders.map((header, colIdx) => {
                  // Check if it's the first cell
                  const isFirstCell = colIdx === 0;

                  // Check if it's the first three cells of the last row
                  const isFirstThreeCells = isLastRow && colIdx < 3;

                  return {
                    text: row[header],
                    style:
                      colIdx === columnIndexToChangeFontColor
                        ? "redText"
                        : "tableCell", // Apply specific style for the first column
                    fillColor:
                      rowIdx === rowIndexToChangeColor ||
                      colIdx === columnIndexToChangeColor
                        ? "#d0cece"
                        : undefined, // Set the background color for the specific row and column
                    alignment: "center", // Align content centered within the column
                    border: (() => {
                      if (isFirstCell) {
                        // For the first cell, set left and bottom border
                        return [true, false, false, true];
                      } else if (isFirstThreeCells) {
                        // For the first three cells of the last row, remove all borders except the bottom
                        return [false, false, false, true];
                      } else {
                        // For other cells, leave the border undefined
                        return undefined;
                      }
                    })(),
                  };
                });
              }),
            ],
          },
        },
        { text: "\n", fontSize: 10 },
        { text: "", pageBreak: "before" }, // Add a page break before the table

        {
          layout: "thirdTableLayout",
          table: {
            headerRows: 1,
            widths: [283, "*"],
            heights: 30,
            body: [
              [
                {
                  border: [true, true, true, true],
                  text: thirdtblFirstColVal,
                  style: "tableCellmiddlebold",
                },
                {
                  border: [true, true, true, true],
                  text: thirdtblSecColVal,
                  style: "tableCellmiddle",
                },
              ],
            ],
          },
        },
        { text: "\n", fontSize: 10 },
        {
          layout: "fourthTableLayout",
          table: {
            heights: function (row) {
              if (row === 0) {
                return null;
              } else {
                return 60;
              }
            },
            pageBreak: "avoid", // Add this line to prevent page breaks within the table
            dontBreakRows: true, // Add this line to prevent rows from breaking across pages
            widths: ["auto", "auto", 80, "*"],
            body: [
              [
                {
                  text: lastTableDataHeader.countColumn,
                  style: "tableCellBoldBody",
                },
                {
                  text: lastTableDataHeader.nameColumn,
                  style: "tableCellBoldBody",
                },
                {
                  text: lastTableDataHeader.oibColumn,
                  style: "tableCellBoldBody",
                },
                {
                  text: lastTableDataHeader.workdoneColumn,
                  style: "tableCellBoldBody",
                },
              ],
              ...tableBody,
            ],
          },
        },
      ],
      styles: {
        tableExample: {
          margin: [30, 15, 0, 15],
        },
        tableCell: {
          fontSize: 6,
          margin: [0, 3, 0, 3],
        },
        tableCellLastTable: {
          fontSize: 6,
          margin: [0, 30, 0, 0],
        },
        tableCellB: {
          bold: true,
          fontSize: 6,
          margin: [0, 3, 0, 3],
        },
        tableCellRed: {
          bold: true,
          fontSize: 6,
          color: "red", // Red font color for cells
        },
        tableCellmiddlebold: {
          bold: true,
          fontSize: 6,
          fillColor: "#fce4d6", // Set the cell color
          margin: [0, 10, 0, 0], // Adjust top and bottom margins for vertical centering
        },
        tableCellmiddle: {
          fontSize: 6,
          fillColor: "#fce4d6", // Set the cell color
        },
        tableHeader: {
          fontSize: 12,
          bold: true,
          color: "black", // Text color
        },
        tableHeaderFirst: {
          bold: true,
          fontSize: 10,
          fillColor: "#b4c6e7", // Set the header color,.
          color: "black", // Header text color
          alignment: "center", // Header text alignment
        },
        tableCellBold: {
          fillColor: "#b4c6e7", // Set the header color
          fontSize: 6,
          bold: true,
        },
        tableCellBoldBody: {
          fillColor: "#b4c6e7", // Set the header color
          fontSize: 6,
          bold: true,
          alignment: "center",
        },
        tableCellBoldlast: {
          fillColor: "#b4c6e7", // Set the header color
          fontSize: 8,
          margin: [0, 3, 0, 3],
          bold: true,
        },
        redText: {
          color: "red", // Set the text color for the first column data
          fontSize: 6,
          bold: true,
          margin: [0, 3, 0, 3],
        },
        redTextLastTable: {
          color: "red", // Set the text color for the first column data
          fontSize: 6,
          bold: true,
          margin: [0, 30, 0, 0],
        },
      },
    };

    const signatureContent = [
      {
        canvas: [
          {
            type: "line",
            x1: 650,
            y1: 70,
            x2: 770, // Adjusted the end point of the line
            y2: 70,
            lineWidth: 0.3,
          },
        ],
      },
      {
        text: signaturesName,
        fontSize: 8,
        color: "black",
        alignment: "right",
        margin: [0, 5, 48, 50], // Add top margin to position it below the line
      },
    ];

    docDefinition.content.push(...signatureContent);

    // pdfMake.createPdf(docDefinition).download("report.pdf");
    pdfMake.createPdf(docDefinition).open();
  } catch (error) {
    console.error("Error generating PDF:", error.message);
    alert(
      "Oops! Something went wrong while generating the PDF. Please try again."
    );
  }
}
