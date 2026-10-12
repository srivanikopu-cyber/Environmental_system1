
let temperatureChart = null;
let humidityChart = null;
let airQualityChart = null;

async function loadCharts() {
    try {
        const response = await fetch(
            "http://127.0.0.1:5000/api/history"
        );

        if (!response.ok) {
            throw new Error("Failed to fetch readings");
        }

        const readings = await response.json();
        readings.reverse();

        const labels = readings.map(r => r.timestamp);
        const temperatures = readings.map(r => r.temperature);
        const humidities = readings.map(r => r.humidity);
        const airQualities = readings.map(r => r.air_quality);

        // Temperature chart
        if (temperatureChart) temperatureChart.destroy();

        temperatureChart = new Chart(
            document.getElementById("temperatureChart"),
            {
                type: "line",
                data: {
                    labels: labels,
                    datasets: [{
                        label: "Temperature (°C)",
                        data: temperatures,
                        borderColor: "red",
                        backgroundColor: "rgba(255,0,0,0.1)",
                        fill: true,
                        tension: 0.3
                    }]
                },
                options: { responsive: true }
            }
        );

        // Humidity chart
        if (humidityChart) humidityChart.destroy();

        humidityChart = new Chart(
            document.getElementById("humidityChart"),
            {
                type: "line",
                data: {
                    labels: labels,
                    datasets: [{
                        label: "Humidity (%)",
                        data: humidities,
                        borderColor: "blue",
                        backgroundColor: "rgba(0,0,255,0.1)",
                        fill: true,
                        tension: 0.3
                    }]
                },
                options: { responsive: true }
            }
        );

        // Air quality chart
        const airCanvas = document.getElementById("airQualityChart");

        if (airCanvas) {
            if (airQualityChart) airQualityChart.destroy();

            airQualityChart = new Chart(airCanvas, {
                type: "line",
                data: {
                    labels: labels,
                    datasets: [{
                        label: "Air Quality Reading",
                        data: airQualities,
                        borderColor: "orange",
                        backgroundColor: "rgba(255,165,0,0.15)",
                        fill: true,
                        tension: 0.3
                    }]
                },
                options: { responsive: true }
            });
        }

        // Anomaly warning
        const warning = document.getElementById("anomalyWarning");

        if (warning && readings.length > 0) {
            const latest = readings[readings.length - 1];
            const alerts = [];

            if (latest.temperature > 33) {
                alerts.push("High temperature detected");
            }

            // Demo threshold only; actual AQI interpretation
            // depends on the sensor and measurement scale.
            if (latest.air_quality > 100) {
                alerts.push("High air-quality reading detected");
            }

            warning.textContent = alerts.length
                ? "Warning: " + alerts.join(" | ")
                : "All readings are within demo thresholds.";

            warning.style.color = alerts.length ? "red" : "green";
        }

    } catch (error) {
        console.error("Chart error:", error);
    }
}

loadCharts();
setInterval(loadCharts, 10000);
