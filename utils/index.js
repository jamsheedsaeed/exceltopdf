import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
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
            style: "tableCell",
            rowSpan: 1,
            height: rowHeight,
            alignment: "center",
          }, // Increase the height for all rows except the first one
          { text: data.name, style: "redText", rowSpan: 1, height: rowHeight, alignment: "center" },
          { text: data.oib, style: "tableCell", rowSpan: 1, height: rowHeight },
          {
            text: data.workDone,
            style: "tableCell",
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

    var docDefinition = {
      pageOrientation: "landscape",
      pageSize: { width: 940, height: 580.68 }, // Set custom page size (14.67 × 11.33 in)
      // Add event handler to remove header on page breaks
      pageBreakBefore: function (
        currentNode,
        followingNodesOnPage,
        nodesOnNextPage,
        previousNodesOnPage
      ) {
        // Check if there are following nodes on the next page
        if (nodesOnNextPage.length > 0) {
          // Iterate through the following nodes on the next page
          for (const node of nodesOnNextPage) {
            // Check if the node has a style property
            if (node.hasOwnProperty("style")) {
              // Check if the node style has a property indicating a header
              if (node.style.includes("header")) {
                // Remove the header by returning true to indicate a page break before the node
                return true;
              }
            }
          }
        }
        // Return false to maintain normal page flow
        return false;
      },
      content: [
        {
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
          table: {
            headerRows: 1,
            widths: [
              40,
              127, // Increased width for the second column
              100,
              ...Array.from({ length: allHeaders.length - 3 }, () => "auto"),
            ],
            heights: 8,
            layout: {
              hLineWidth: (i) => (i === 0 ? 2 : 1),
              vLineWidth: () => 1,
              hLineColor: (i) => (i === 0 ? "#000" : "#aaa"),
              paddingTop: (i) => (i === 0 ? 2 : 1),
              paddingBottom: (i) => (i === table.body.length - 1 ? 2 : 1),
              cellPadding: { top: 2, bottom: 2, left: 2, right: 2 }, // Adjust padding
              fontSize: 8, // Adjust font size
              lineHeight: 1, // Adjust line height
            },
            body: [
              [
                ...allHeaders.map((header) => ({
                  text: headerdata[header],
                  style: "tableCellBold",
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

        {
          table: {
            headerRows: 1,
            widths: [283, "*"],
            heights: 50,
            body: [
              [
                {
                  border: [true, true, true, true],
                  text: thirdtblFirstColVal,
                  style: "tableCellmiddle",
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
        { text: "", pageBreak: "before" }, // Add a page break before the table
        {
          table: {
            headerRows: 1,
            heights: function (row) {
              if (row === 0) {
                return null;
              } else {
                return 60;
              }
            },
            widths: ["auto", 130, 80, "*"],
            body: [
              [
                {
                  text: lastTableDataHeader.countColumn,
                  style: "tableCellBold",
                },
                {
                  text: lastTableDataHeader.nameColumn,
                  style: "tableCellBold",
                },
                {
                  text: lastTableDataHeader.oibColumn,
                  style: "tableCellBold",
                },
                {
                  text: lastTableDataHeader.workdoneColumn,
                  style: "tableCellBold",
                },
              ],
              ...tableBody,
            ],
          },
        },
      ],
      styles: {
        tableCell: {
          fontSize: 8,
          margin: [0, 3, 0, 3],
        },
        tableCellB: {
          bold: true,
          fontSize: 8,
          margin: [0, 3, 0, 3],
        },
        tableCellRed: {
          fontSize: 8,
          color: "red", // Red font color for cells
        },
        tableCellmiddle: {
          fontSize: 8,
          margin: [0, 3, 0, 3],
          fillColor: "#fce4d6", // Set the cell color
        },
        tableHeader: {
          fontSize: 12,
          bold: true,
          color: "black", // Text color
        },
        tableHeaderFirst: {
          bold: true,
          fontSize: 12,
          fillColor: "#b4c6e7", // Set the header color
          color: "black", // Header text color
          alignment: "center", // Header text alignment
        },
        tableCellBold: {
          fillColor: "#b4c6e7", // Set the header color
          fontSize: 8,
          margin: [0, 3, 0, 3],
          bold: true,
        },
        tableCellBoldlast: {
          fillColor: "#b4c6e7", // Set the header color
          fontSize: 8,
          margin: [0, 3, 0, 3],
          bold: true,
        },
        redText: {
          color: "red", // Set the text color for the first column data
          fontSize: 8,
          bold: true,
          margin: [0, 3, 0, 3],
        },
      },
    };

    const signatureContent = [
      {
        canvas: [
          {
            type: "line",
            x1: 670,
            y1: 40,
            x2: 820, // Adjusted the end point of the line
            y2: 40,
            lineWidth: 1,
          },
        ],
      },
      {
        text: signaturesName,
        fontSize: 10,
        bold: true,
        color: "black",
        alignment: "right",
        margin: [0, 5, 0, 5], // Add top margin to position it below the line
      },
    ];

    docDefinition.content.push(...signatureContent);

    pdfMake.createPdf(docDefinition).download("report.pdf");
  } catch (error) {
    console.error("Error generating PDF:", error.message);
    alert(
      "Oops! Something went wrong while generating the PDF. Please try again."
    );
  }
}
