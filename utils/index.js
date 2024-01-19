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
  const headers = data2[0];

  const numericHeaders = Object.keys(headers)
    .filter((key) => {
      const numericValue = parseInt(headers[key]);
      return !isNaN(numericValue) && numericValue <= 34;
    })
    .map((key) => headers[key]);

  var docDefinition = {
    pageOrientation: "landscape",
    content: [
      {
        text: firstTableHeader,
        style: "tableHeader",
        alignment: "center",
        margin: [0, 10],
      },
      {
        table: {
          headerRows: 1,
          widths: ["auto", "*"],
          body: data1.map((row) => [
            { text: row[0], style: "tableCell" },
            { text: row[1], style: "tableCell" },
          ]),
        },
      },
      { text: "\n", fontSize: 10 },
      {
        table: {
          headerRows: 1,
          widths: [
            "auto",
            130,
            80,
            ...Array.from({ length: numericHeaders.length }, () => "auto"),
          ],
          heights: 10,
          body: [
            [
              { text: "Redni broj", style: "tableCellBold" },
              {
                text: "Ime i prezime krajnjeg korisnika",
                style: "tableCellBold",
              },
              { text: "OIB krajnjeg korisnika", style: "tableCellBold" },
              ...numericHeaders.map((header) => ({
                text: header,
                style: "tableCellBold",
              })),
            ],
            ...data2.slice(1).map((row) => [
              { text: row["#VALUE!"], style: "tableCell" },
              { text: row["__EMPTY_1"], style: "tableCell" },
              { text: row["__EMPTY_2"], style: "tableCell" },
              ...numericHeaders.map((header) => ({
                text: row[header],
                style: "tableCell",
              })),
            ]),
          ],
        },
      },
      {
        table: {
          headerRows: 1,
          widths: ["auto", "*"],
          body: [
            [{ text: thirdtblFirstColVal, style: "tableCell" },
            { text: thirdtblSecColVal, style: "tableCell" },]
          ],
        },
      },
    ],
    styles: {
      tableCell: {
        fontSize: 8,
        margin: [0, 3, 0, 3],
      },
      tableCellBold: {
        fontSize: 8,
        margin: [0, 3, 0, 3],
        bold: true,
      },
    },
  };

  pdfMake.createPdf(docDefinition).download("report.pdf");
}
