import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
pdfMake.vfs = pdfFonts.pdfMake.vfs;

export default function generatePDF(excelData) {
  const data1 = excelData
    .slice(1, 7)
    .map((row) => [row["#VALUE!"], row["__EMPTY_2"]]);

  const firstTableHeader = excelData[0]["#VALUE!"];
  const thirdTableValues = excelData[19];
  const thirdtblFirstColVal = thirdTableValues["#VALUE!"];
  const thirdtblSecColVal = thirdTableValues["__EMPTY_3"];
  const data2 = excelData.slice(7, 19);
  const lastTableData = excelData.slice(21, 31);
  const lastTableDataHeader = excelData[20];
  const signaturesName = excelData[31]["__EMPTY_26"];
  const columnIndexToChangeColor = 34; // Change this index as needed
  const rowIndexToChangeColor = 10; // Change this index as needed
  const columnIndexToChangeFontColor = 1; // Index of the first column

  const tableBody = lastTableData?.map((data) => [
    { text: data["#VALUE!"], style: "tableCell" },
    { text: data["__EMPTY_1"], style: "redText" },
    { text: data["__EMPTY_2"], style: "tableCell" },
    { text: data["__EMPTY_3"], style: "tableCell" },
  ]);

  const allHeaders = Object.keys(data2[0]).filter(
    (header) => header !== "__EMPTY"
  );

  var docDefinition = {
    pageOrientation: "landscape",
    pageSize: { width: 900, height: 580.68 }, // Set custom page size (14.67 × 11.33 in)
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

            ...data1.map((row) => [
              { text: row[0], style: "tableCell" },
              { text: row[1], style: "tableCell" },
            ]),
          ],
        },
      },
      { text: "\n", fontSize: 10 },
      {
        table: {
          headerRows: 1,
          widths: [
            20,
            130, // Increased width for the second column
            ...Array.from({ length: allHeaders.length - 2 }, () => "auto"),
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
                text: data2[0][header],
                style: "tableCellBold",
              })),
            ],
            ...data2.slice(1).map((row, rowIdx) =>
              allHeaders.map((header, colIdx) => ({
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
              }))
            ),
          ],
        },
      },
      {
        table: {
          headerRows: 1,
          widths: [200, "*"],
          body: [
            [
              {
                border: [true, false, true, true],
                text: thirdtblFirstColVal,
                style: "tableCellmiddle",
              },
              {
                border: [true, false, true, true],
                text: thirdtblSecColVal,
                style: "tableCellmiddle",
              },
            ],
          ],
        },
      },
      {
        table: {
          headerRows: 1,
          widths: ["auto", 130, 80, 500],
          heights: 40,
          body: [
            [
              { text: lastTableDataHeader["#VALUE!"], style: "tableCellBold" },
              {
                text: lastTableDataHeader["__EMPTY_1"],
                style: "tableCellBold",
              },
              {
                text: lastTableDataHeader["__EMPTY_2"],
                style: "tableCellBold",
              },
              {
                text: lastTableDataHeader["__EMPTY_3"],
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
          type: "rect",
          x: 620,
          y: 50,
          w: 150,
          h: 1,
          lineWidth: 1,
          alignment: "right",
        },
      ],
    },
    {
      text: signaturesName,
      fontSize: 10,
      bold: true,
      color: "black",
      alignment: "right", // Aligns the text to the right
      absolutePosition: { x: 660, y: 350 },
    },
  ];

  // Adding the signature content to the existing content
  docDefinition.content.push(...signatureContent);

  pdfMake.createPdf(docDefinition).download("report.pdf");
}
