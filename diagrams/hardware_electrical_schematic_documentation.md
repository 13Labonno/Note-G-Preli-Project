# Hardware & Electrical System Documentation
## Project: Smart Office Automation — Representative Room (Work Room 1)
**System Architecture:** ESP32 Microcontroller + 5-Channel Relay Module + ACS712 Current Sensor
**Loads Controlled:** 2x Fans (60W each), 3x Lights (15W each)
**Simulation/Prototyping Environment:** Concept designed for Wokwi / Tinkercad

---

## 1. Executive Summary
This document provides a technical specification and operational manual for the **Smart Office Automation System** implemented in *Work Room 1*. The system uses an **ESP32 Dev Board** to independently control five electrical loads (three lights and two fans) via a **5-Channel Relay Module**, while simultaneously measuring the entire room's power consumption using an **ACS712 (30A) Current Sensor**. 

The design is engineered to scale across an entire office workspace, with the pattern repeating across multiple rooms (e.g., 3× instances of this circuit resulting in 15 relay channels and 3 ACS712 sensors monitored across the office).

---

## 2. System Architecture & Components

### 2.1 Microcontroller: ESP32 Dev Board
The ESP32 serves as the central processing unit and communication gateway. 
* **Logic Voltage:** 3.3V native, with a 5V (VIN) rail available when powered via USB.
* **Connectivity:** Integrated Wi-Fi connects to a backend API to send real-time consumption data and receive remote control commands.
* **ADC Capabilities:** Uses `ADC1_CH6` (GPIO34) to sample the analog waveform from the current sensor. Crucially, `ADC1` is selected because it remains operational when the Wi-Fi stack is active (unlike `ADC2`).

### 2.2 Actuation: 5-Channel Relay Module
An opto-isolated, **Active-LOW** relay module isolates the low-voltage logic side from the high-voltage AC mains.
* **Active-LOW Logic:** A logic `LOW` (0V) signal from the ESP32 pin energizes the relay coil, closing the contact to turn the load **ON**. A logic `HIGH` (3.3V/5V) de-energizes the coil, turning the load **OFF**.
* **Load Specifics:** * Channels 1–3 control resistive/lighting loads (15W Lights).
  * Channels 4–5 control inductive loads (60W Fans). Relays are rated appropriately to handle the inductive inrush current of the fan motors.

### 2.3 Monitoring: ACS712 (30A) Current Sensor
The ACS712 is a Hall-effect-based linear current sensor that provides an analog voltage output proportional to the AC/DC current passing through its terminal blocks.
* **Placement:** Connected in **series** with the room's main AC LIVE feed *before* it splits into individual relay common (COM) terminals. This allows the sensor to capture the **total aggregate current draw** of Work Room 1.
* **Output:** Produces an analog voltage that centers at $V_{CC}/2$ (approx. 2.5V) at 0 Amps, fluctuating up and down matching the AC sine wave.

---

## 3. Wiring & Pin-Mapping Specification

### 3.1 Low-Voltage / Logic Side (Pin-Mapping Table)

| ESP32 Pin | Connected To | Signal Type | Target Device | Rated Power | Technical Notes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **GPIO23** | Relay Module `IN1` | Digital OUT | Light 1 | 15W | Active-LOW relay: `LOW` = ON |
| **GPIO22** | Relay Module `IN2` | Digital OUT | Light 2 | 15W | Active-LOW relay: `LOW` = ON |
| **GPIO21** | Relay Module `IN3` | Digital OUT | Light 3 | 15W | Active-LOW relay: `LOW` = ON |
| **GPIO19** | Relay Module `IN4` | Digital OUT | Fan 1 | 60W | Inductive load; relay contacts rated for high inrush |
| **GPIO18** | Relay Module `IN5` | Digital OUT | Fan 2 | 60W | Inductive load; relay contacts rated for high inrush |
| **GPIO34** | ACS712 `OUT` pin | Analog IN | Total Room Current | N/A (Sensor) | Input-only pin (`ADC1_CH6`). Safe to sample while Wi-Fi is on |

### 3.2 Power & Ground Distribution
* **5V VCC Rail:** The ESP32 `5V (VIN)` pin distributes power to both the `VCC` of the Relay Module and the `VCC` of the ACS712 current sensor.
* **Common Ground:** The ESP32 `GND` pin is tied to the `GND` of the Relay Module and the `GND` of the ACS712. A solid, shared ground is mandatory to eliminate noise and guarantee clean analog readings on GPIO34.

---

## 4. High-Voltage AC Electrical Topology

> ⚠️ **SAFETY WARNING:** High-voltage AC mains wiring (110V/220V) poses a severe risk of electric shock, fire, and death. Physical implementation must be completed exclusively by a licensed electrician. This document covers a conceptual or simulated layout (Wokwi/Tinkercad).

### 4.1 Live (Phase) Distribution Sequence
1. **Mains Entry:** The AC Mains LIVE wire enters the room circuit.
2. **Current Sensing:** The LIVE wire is routed directly through the **ACS712 Current Sensor inline (in series)** first. All current consumed by the room must flow through this point.
3. **Relay Distribution:** From the output terminal of the ACS712, the live feed splits into **five parallel branches**, each connecting to the **Common (COM)** terminal of one of the 5 relays.
4. **Switched Feeds:** The **Normally Open (NO)** terminal of each relay is connected to the live terminal of its designated load (Light 1, Light 2, Light 3, Fan 1, Fan 2).

### 4.2 Neutral Routing
* **Common Neutral Bar:** Neutral wires are entirely **unswitched and common**. 
* Every load's Neutral terminal connects back directly to the mains neutral distribution block/bar.

```
AC Mains LIVE ──► [ACS712 Sensor] ──► Split to COM (Relays 1-5)
                                          │
                                     [Relay NO] (When closed)
                                          │
                                          ▼
                                     [Load (Light/Fan)]
                                          │
AC Mains NEUTRAL ─────────────────────────┴──► Common Return Bar
```

---

## 5. Sequence of Operations & Data Flow

```
   ┌────────────────┐             ┌─────────────────────┐             ┌─────────────────┐
   │ Cloud/API Cmd  │ ──(Wi-Fi)──►│    ESP32 Logic      │ ──(Digital)──►│ 5-Ch Relay Mod  │
   └────────────────┘             └──────────┬──────────┘             └────────┬────────┘
                                             ▲                                 │ (AC Close)
                                             │ (Analog Input)                  ▼
                                  ┌──────────┴──────────┐             ┌─────────────────┐
                                  │ ACS712 Current Sens │ ◄──(Series)─┤ AC Mains Loads  │
                                  └─────────────────────┘             └─────────────────┘
```

1. **Initialization:** On boot, the ESP32 configures GPIO23, 22, 21, 19, and 18 as `OUTPUT` and immediately pulls them `HIGH` to ensure all relays default to **OFF** (preventing un-intended load startup during boot). GPIO34 is configured as an analog input.
2. **Command Handling:** The ESP32 listens over Wi-Fi for state adjustments. When a command to turn "Light 1" ON arrives, the ESP32 writes a `LOW` signal to **GPIO23**.
3. **Actuation:** Relay channel 1 closes its circuit loop (`COM` connects to `NO`), allowing the AC Mains Live current to flow through **Light 1 (15W)** to the Neutral bar.
4. **Telemetry Sampling:** * The ACS712 constantly registers the changing magnetic field produced by the alternating current flowing through the main line.
   * The ESP32 continuously samples the analog voltage on **GPIO34 (ADC1_CH6)**.
   * *Formula Application:* The firmware takes multiple samples over a full AC cycle (e.g., 50Hz/60Hz), calculates the Root Mean Square (RMS) voltage deviation from the 2.5V zero-current offset, converts it to RMS Current ($I_{RMS}$), and multiplies by mains voltage ($V$) to compute real-time power ($P = V 	imes I$).
5. **Data Reporting:** The calculated total room power draw is periodically bundled and sent back to the Backend API over Wi-Fi for monitoring, billing, or load-shedding algorithms.

---

## 6. Multi-Room Scaling Strategy
To implement this architecture across a broader commercial facility, a modular building-block approach is used:
* **The Module:** The exact circuit shown above represents a single "Smart Node" for one room.
* **Office Scale:** For an area requiring 3 rooms, 3 independent ESP32 nodes are deployed.
* **Totals:** This results in a grand total of **15 relay channels** and **3 ACS712 sensors** operating in parallel, communicating over the building's local Wi-Fi infrastructure to a centralized monitoring server.
