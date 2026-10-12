async function loadReadings() {
    const status = document.getElementById("status");

    try {
        const response = await fetch(
            "http://127.0.0.1:5000/api/readings"
        );

        if (!response.ok) {
            throw new Error("Could not fetch readings");
        }

        const data = await response.json();

        document.getElementById("temperature").textContent =
            data.temperature + " °C";

        document.getElementById("humidity").textContent =
            data.humidity + " %";

        document.getElementById("air").textContent =
            data.air_quality;

        status.textContent = data.status;
    } catch (error) {
        status.textContent =
            "Backend is not running. Please start Python backend.";
    }
}

loadReadings();

async function loadHistory() {
    const table = document.getElementById("historyTable");

    try {
        table.innerHTML =
            '<tr><td colspan="5">Loading history...</td></tr>';

        const response = await fetch(
            "http://127.0.0.1:5000/api/history"
        );

        if (!response.ok) {
            throw new Error("Could not load history");
        }

        const readings = await response.json();

        if (readings.length === 0) {
            table.innerHTML =
                '<tr><td colspan="5">No readings available</td></tr>';
            return;
        }

        table.innerHTML = "";

        readings.forEach(reading => {
            const row = document.createElement("tr");

            [
                reading.timestamp,
                reading.temperature + " °C",
                reading.humidity + " %",
                reading.air_quality,
                reading.status
            ].forEach(value => {
                const cell = document.createElement("td");
                cell.textContent = value;
                row.appendChild(cell);
            });

            table.appendChild(row);
        });

    } catch (error) {
        console.error("History error:", error);

        table.innerHTML =
            '<tr><td colspan="5">Unable to load history. Check backend.</td></tr>';
    }
}

loadHistory();

async function collectNewReading() {
    try {
        // Generate and save a new reading in the database
        const response = await fetch(
            "http://127.0.0.1:5000/api/readings"
        );

        if (!response.ok) {
            throw new Error("Could not collect new reading");
        }

        const data = await response.json();

        // Update the dashboard cards
        document.getElementById("temperature").textContent =
            data.temperature + " °C";

        document.getElementById("humidity").textContent =
            data.humidity + " %";

        document.getElementById("air").textContent =
            data.air_quality;

        document.getElementById("status").textContent =
            data.status;

        // Refresh graphs and history table
        if (typeof loadCharts === "function") {
            await loadCharts();
        }

        if (typeof loadHistory === "function") {
            await loadHistory();
        }

    } catch (error) {
        console.error("Automatic collection error:", error);
    }
}

// Collect a new reading every 10 seconds
setInterval(collectNewReading, 10000);
