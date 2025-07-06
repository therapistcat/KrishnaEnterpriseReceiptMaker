import { useRef, useEffect, useState } from "react";
import "./App.css";
import { API_BASE_URL } from "./config";

function App() {
  const formRef = useRef();
  const [serial, setSerial] = useState(null);

  useEffect(() => {
    console.log('Environment mode:', import.meta.env.MODE);
    console.log('API_BASE_URL:', API_BASE_URL);
    console.log('Fetching serial from:', `${API_BASE_URL}/data/serial`);
    fetch(`${API_BASE_URL}/data/serial`)
      .then((res) => {
        console.log('Serial response status:', res.status);
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        console.log('Serial data received:', data);
        setSerial(data.serial);
      })
      .catch((error) => {
        console.error('Error fetching serial:', error);
        alert(`Error connecting to backend: ${error.message}`);
      });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = formRef.current;
    const formData = new FormData(form);

    try {
      console.log('Submitting to:', `${API_BASE_URL}/data/pdfConverter`);
      const response = await fetch(`${API_BASE_URL}/data/pdfConverter`, {
        method: "POST",
        body: formData,
      });

      console.log('PDF response status:', response.status);

      if (response.ok) {
        const blob = await response.blob();

        // Force download instead of opening in new tab
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.style.display = "none";
        a.href = url;
        a.download = `receipt_${Date.now()}.pdf`; // Unique filename
        a.setAttribute('download', `receipt_${Date.now()}.pdf`); // Force download

        document.body.appendChild(a);
        a.click();

        // Cleanup
        setTimeout(() => {
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
        }, 100);

        console.log('PDF downloaded successfully');
        alert('PDF downloaded successfully!');
      } else {
        const errorText = await response.text();
        console.error('PDF generation failed:', errorText);
        alert(`Failed to generate PDF: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert(`Error: ${error.message}`);
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
