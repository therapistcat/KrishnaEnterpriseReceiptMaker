const Data = require("../models/data")
const fs = require("fs")
const path = require("path")
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');


const dataSaver = async (req, res) => {
    const { partyName, vehicleNo, material, measurement, weight, location, time1, date1 } = req.body;
    try {
        if (!partyName || !vehicleNo || !material || !measurement || !weight || !location) return res.status(400).json({ error: "Please fill the complete fields" })

        const newData = new Data({
            partyName,
            vehicleNo,
            material,
            measurement,
            weight,
            location,
            time1,
            date1,
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
        const { partyName, vehicleNo, material, measurement, weight, location, date1, time1, customSerial } = req.body;
        const image1Buffer = req.files?.image1?.[0]?.buffer;
        const image2Buffer = req.files?.image2?.[0]?.buffer;

        // Convert weight to number
        const weightNum = Number(weight);

        // Validation: Weight must be a valid number
        if (isNaN(weightNum)) {
            return res.status(400).json({ error: "Weight must be a number" });
        }
        if (weightNum <= 0) {
            return res.status(400).json({ error: "Weight must be greater than 0" });
        }

        // Serial logic (custom or auto-increment)
        const serialPath = path.resolve(__dirname, "./Files/serial.json");
        let serialData = JSON.parse(fs.readFileSync(serialPath, "utf-8"));
        let serial;

        if (customSerial && customSerial.trim() !== '') {
            // Use custom serial number provided by user
            serial = parseInt(customSerial.trim());
            if (isNaN(serial) || serial <= 0) {
                return res.status(400).json({ error: "Custom serial number must be a positive number" });
            }
            // Update the latest serial to the custom serial
            fs.writeFileSync(serialPath, JSON.stringify({ latest: serial }));
        } else {
            // Auto-increment from current latest
            serial = serialData.latest + 1;
            fs.writeFileSync(serialPath, JSON.stringify({ latest: serial }));
        }

        const filename = `file_${serial}`;
        const inputPath = path.resolve(__dirname, "./Files/blank.pdf");
        const outputPath = path.resolve(__dirname, `./Files/${filename}.pdf`);

        // Load the existing PDF
        const existingPdfBytes = fs.readFileSync(inputPath);
        const pdfDoc = await PDFDocument.load(existingPdfBytes);

        const page = pdfDoc.getPages()[0];
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

        

        // Position text according to new blank.pdf template coordinates
        page.drawText(String(serial), { x: 110, y: 210, size: 14, font, color: rgb(0,0,0) }); // Serial No.
        page.drawText(partyName || '', { x: 150, y: 235, size: 14, font, color: rgb(0,0,0) }); // Party Name
        page.drawText(vehicleNo || '', { x: 175, y: 265, size: 14, font, color: rgb(0,0,0) }); // Vehicle No.
        page.drawText(material || '', { x: 160, y: 288, size: 14, font, color: rgb(0,0,0) }); // Material
        page.drawText(measurement || '', { x: 175, y: 312, size: 14, font, color: rgb(0,0,0) }); // Measurement
        page.drawText(`${String(weightNum)} kgs`, { x: 135, y: 338, size: 14, font, color: rgb(0,0,0) }); // Weight
        page.drawText(location || '', { x: 160, y: 360, size: 14, font, color: rgb(0,0,0) }); // Location
        page.drawText(date1 || '', { x: 500, y: 210, size: 14, font, color: rgb(0,0,0) }); // Date
        page.drawText(time1 || '', { x: 515, y: 240, size: 14, font, color: rgb(0,0,0) }); // Time


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

        // Save to MongoDB with new fields
        const newData = new Data({
            partyName,
            vehicleNo,
            material,
            measurement,
            weight: weightNum,
            location,
            date1,
            time1,
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

