const Data = require("../models/data")
const fs = require("fs")
const path = require("path")
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');


const dataSaver = async (req, res) => {
    const { partyName, vehicleNo, material, grossWt, tareWt, time1, date1, time2, date2 } = req.body;
    try {
        if (!partyName || !vehicleNo || !material || !grossWt || !tareWt) return res.status(400).json({ error: "Please fill the complete fields" })

        const newData = new Data({
            partyName,
            vehicleNo,
            material,
            grossWt,
            tareWt,
            time1,
            date1,
            time2,
            date2,
        })

        if (req.files && req.files.image1 && req.files.image1[0]) {
            newData.image1 = {
                data: req.files.image1[0].buffer,
                contentType: req.files.image1[0].mimetype
            };
        }

        if (req.files && req.files.image2 && req.files.image2[0]) {
            newData.image2 = {
                data: req.files.image2[0].buffer,
                contentType: req.files.image2[0].mimetype
            };
        }

        await newData.save();
        res.status(201).json({ message: "Data added successfully" });
    } catch (error) {
        console.error("Error saving data:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const pdfConverter = async (req, res) => {
    try {
        const { partyName, vehicleNo, material, grossWt, tareWt, date1, time1, date2, time2, customSerial } = req.body;
        const image1Buffer = req.files?.image1?.[0]?.buffer;
        const image2Buffer = req.files?.image2?.[0]?.buffer;

        // Convert weights to numbers
        const gross = Number(grossWt);
        const tare = Number(tareWt);

        // Validation: Gross must be greater than Tare
        if (isNaN(gross) || isNaN(tare)) {
            return res.status(400).json({ error: "Gross and Tare weights must be numbers" });
        }
        if (gross <= tare) {
            return res.status(400).json({ error: "Gross Weight must be greater than Tare Weight" });
        }

        const netWt = gross - tare;

        // Serial logic (auto-increment only)
        const serialPath = path.resolve(__dirname, "./Files/serial.json");
        let serialData = JSON.parse(fs.readFileSync(serialPath, "utf-8"));
        let serial = serialData.latest + 1;
        fs.writeFileSync(serialPath, JSON.stringify({ latest: serial }));

        const filename = `file_${serial}`;
        const inputPath = path.resolve(__dirname, "./Files/blank.pdf");
        const outputPath = path.resolve(__dirname, `./Files/${filename}.pdf`);

        // Load the existing PDF
        const existingPdfBytes = fs.readFileSync(inputPath);
        const pdfDoc = await PDFDocument.load(existingPdfBytes);

        const page = pdfDoc.getPages()[0];
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

        

        // Only raw data, no labels, spaced to avoid overlap
        let y = 700;
        const lineGap = 24;

        page.drawText(String(serial), { x: 50, y: y, size: 14, font, color: rgb(0,0,0) }); y -= lineGap; // Serial No.
        page.drawText(partyName || '', { x: 50, y: y, size: 14, font, color: rgb(0,0,0) }); y -= lineGap;
        page.drawText(vehicleNo || '', { x: 50, y: y, size: 14, font, color: rgb(0,0,0) }); y -= lineGap;
        page.drawText(material || '', { x: 50, y: y, size: 14, font, color: rgb(0,0,0) }); y -= lineGap;
        page.drawText(String(gross), { x: 50, y: y, size: 14, font, color: rgb(0,0,0) }); y -= lineGap;
        page.drawText(String(tare), { x: 50, y: y, size: 14, font, color: rgb(0,0,0) }); y -= lineGap;
        page.drawText(String(netWt), { x: 50, y: y, size: 14, font, color: rgb(0,0,0) }); y -= lineGap;
        page.drawText(date1 || '', { x: 50, y: y, size: 14, font, color: rgb(0,0,0) }); y -= lineGap;
        page.drawText(time1 || '', { x: 50, y: y, size: 14, font, color: rgb(0,0,0) }); y -= lineGap;
        page.drawText(date2 || '', { x: 50, y: y, size: 14, font, color: rgb(0,0,0) }); y -= lineGap;
        page.drawText(time2 || '', { x: 50, y: y, size: 14, font, color: rgb(0,0,0) });


        // Add images if provided
        if (image1Buffer) {
            const img1 = await pdfDoc.embedPng(image1Buffer).catch(() => pdfDoc.embedJpg(image1Buffer));
            page.drawImage(img1, { x: 350, y: 600, width: 100, height: 100 });
        }
        if (image2Buffer) {
            const img2 = await pdfDoc.embedPng(image2Buffer).catch(() => pdfDoc.embedJpg(image2Buffer));
            page.drawImage(img2, { x: 350, y: 480, width: 100, height: 100 });
        }

        // Save the PDF
        const pdfBytes = await pdfDoc.save();
        fs.writeFileSync(outputPath, pdfBytes);

        // Save to MongoDB (add netWt and both dates/times)
        const newData = new Data({
            partyName,
            vehicleNo,
            material,
            grossWt: gross,
            tareWt: tare,
            netWt,
            date1, // Gross Date
            time1, // Gross Time
            date2, // Tare Date
            time2, // Tare Time
            image1: image1Buffer ? { data: image1Buffer, contentType: req.files?.image1?.[0]?.mimetype } : undefined,
            image2: image2Buffer ? { data: image2Buffer, contentType: req.files?.image2?.[0]?.mimetype } : undefined,
        });
        await newData.save();

        // Send PDF to client
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename=${filename}.pdf`);
        res.end(pdfBytes);

    } catch (error) {
        console.error("Error generating PDF:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

const getSerial = (req, res) => {
    const serialPath = path.resolve(__dirname, "./Files/serial.json");
    let serialData = JSON.parse(fs.readFileSync(serialPath, "utf-8"));
    res.json({ serial: serialData.latest + 1 });
};

module.exports = { dataSaver, pdfConverter, getSerial };

