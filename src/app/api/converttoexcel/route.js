import path from 'path';
import libreofficeConvert from 'libreoffice-convert';
import fs from 'fs/promises'; // Using fs.promises for asynchronous file operations
import util from 'util';

libreofficeConvert.convertAsync = util.promisify(libreofficeConvert.convert);

export async function POST(req, res) {
  try {
    const ext = '.pdf'
    const inputPath = 'report.xlsx';
    const outputPath = path.join(__dirname, `/resources/example${ext}`);

    // Read file
    const docxBuf = await fs.readFile(inputPath);

    // Convert it to pdf format with undefined filter (see Libreoffice docs about filter)
    let pdfBuf = await libreofficeConvert.convertAsync(docxBuf, ext, undefined);
    
    // Here in done you have pdf file which you can save or transfer in another stream
    await fs.writeFile(outputPath, pdfBuf);
  } catch (err) {
    console.error(`Unexpected error: ${err}`);
    res.status(500).json({ error: 'Unexpected error' });
  }
}

