import { useRef, useEffect, useState } from "react";
import "./App.css";

function App() {
  const formRef = useRef();
  const [serial, setSerial] = useState(null);

  useEffect(() => {
    fetch("https://krishnaenterprisereceiptmaker-backend.onrender.com/data/serial")
      .then((res) => res.json())
      .then((data) => setSerial(data.serial));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = formRef.current;
    const formData = new FormData(form);

    const response = await fetch("https://krishnaenterprisereceiptmaker-backend.onrender.com/data/pdfConverter", {
      method: "POST",
      body: formData,
    });

    if (response.ok) {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "receipt.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } else {
      alert("Failed to generate PDF");
    }
  };

  return (
    <>
      <div className="header">KRISHNA ENTERPRISE</div>
      <div className="form-container">
        <h2
          style={{
            textAlign: "center",
            marginBottom: "24px",
            color: "#0070c0",
            fontWeight: 600,
            letterSpacing: "1px",
          }}
        >
          Generate Receipt PDF
        </h2>
        {serial && (
          <div
            style={{
              textAlign: "center",
              marginBottom: "18px",
              color: "#4fc3f7",
              fontWeight: 600,
              fontSize: "1.1rem",
            }}
          >
            Serial No: {serial}
          </div>
        )}
        <form ref={formRef} onSubmit={handleSubmit}>
          <label>
            Party Name:
            <input name="partyName" type="text" required />
          </label>
          <label>
            Vehicle No:
            <input name="vehicleNo" type="text" required />
          </label>
          <label>
            Material:
            <input name="material" type="text" required />
          </label>
          <label>
            Gross Weight:
            <input name="grossWt" type="number" required />
          </label>
          <label>
            Tare Weight:
            <input name="tareWt" type="number" required />
          </label>
          <label>
            Gross Date:
            <input name="date1" type="date" />
          </label>
          <label>
            Gross Time:
            <input name="time1" type="time" />
          </label>
          <label>
            Tare Date:
            <input name="date2" type="date" />
          </label>
          <label>
            Tare Time:
            <input name="time2" type="time" />
          </label>
          <label>
            Image 1:
            <input name="image1" type="file" accept="image/*" />
          </label>
          <label>
            Image 2:
            <input name="image2" type="file" accept="image/*" />
          </label>
          <button type="submit">Generate PDF</button>
        </form>
      </div>
      <div className="bottom-line"></div>
      <div
        style={{
          width: "100%",
          textAlign: "center",
          marginTop: "32px",
          marginBottom: "12px",
          fontSize: "1.05rem",
          color: "#e0e6ed",
          fontWeight: 500,
          letterSpacing: "0.5px",
        }}
      >
        <div style={{ marginBottom: "6px" }}>
          Near Saiwan Petrol Pump, Survey no 87/1/1,
          <br />
          Vajreshwari Road, At Post Saiwan, Palipada
        </div>
        <div style={{ color: "#4fc3f7", fontWeight: 600 }}>
          Mobile No: 7798888999 / 7020677311
        </div>
      </div>
    </>
  );
}

export default App;
