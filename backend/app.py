from flask import Flask, jsonify
from flask_cors import CORS
import sqlite3
import random
from datetime import datetime

app = Flask(__name__)
CORS(app)

DB_PATH = "database/environmental.db"

def init_db():
    conn = sqlite3.connect(DB_PATH)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS readings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            temperature REAL,
            humidity REAL,
            air_quality INTEGER,
            status TEXT,
            timestamp TEXT
        )
    """)
    conn.commit()
    conn.close()

@app.route("/")
def home():
    return "Environmental Monitoring Backend is Running!"

@app.route("/api/readings")
def readings():
    temperature = round(random.uniform(25, 35), 1)
    humidity = round(random.uniform(40, 80), 1)
    air_quality = random.randint(30, 150)
    status = "Warning" if temperature > 33 else "Normal"
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    conn = sqlite3.connect(DB_PATH)
    conn.execute("""
        INSERT INTO readings
        (temperature, humidity, air_quality, status, timestamp)
        VALUES (?, ?, ?, ?, ?)
    """, (temperature, humidity, air_quality, status, timestamp))
    conn.commit()
    conn.close()

    return jsonify({
        "temperature": temperature,
        "humidity": humidity,
        "air_quality": air_quality,
        "status": status,
        "timestamp": timestamp
    })

@app.route("/api/history")
def history():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    rows = conn.execute(
        "SELECT * FROM readings ORDER BY id DESC LIMIT 20"
    ).fetchall()
    conn.close()
    return jsonify([dict(row) for row in rows])

if __name__ == "__main__":
    init_db()
    app.run(debug=True, port=5000)