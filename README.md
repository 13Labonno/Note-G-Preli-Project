# Note-G-Preli-Project
# Smart Office Energy Tracker & Bot

An automated ecosystem designed to monitor and optimize office power consumption across multiple workspace rooms. The architecture bridges physical or simulated hardware layers with a centralized server, a real-time analytics web dashboard, and a conversational Discord Bot acting as an eco-friendly automated property supervisor.

---

##  System Architecture & Workflow

The entire platform functions using a single backend service acting as the unified **Single Source of Truth**.

1. **Device Layer:** 3 rooms (`Drawing Room`, `Work Room 1`, `Work Room 2`) housing a total of 15 devices (9 Lights @ 15W, 6 Fans @ 60W). A dynamic generation daemon continuously fluctuates telemetry parameters.
2. **Backend API:** An Express.js/Node.js ingestion point managing structured in-memory datasets and evaluating active threshold alert protocols.
3. **Web Interface:** A visual dashboard that renders real-time state metrics without browser page updates.
4. **Discord Bot:** A management interface providing contextual room diagnostics leveraging an automated Large Language Model (LLM) processor.

## Live demo and simulation link: https://youtu.be/lbjDgq7dtiM?si=1ZvlAmQe-taYlN91
## code demonstra. : https://youtu.be/JP75tjRp2JY?si=aD16tesf6_dOTBrt

##  Project Setup & Installation

### Prerequisite Environment Configuration
Create a `.env` file inside the root of your project directory before initializing execution modules:

```env
PORT=5000
DISCORD_BOT_TOKEN=YOUR_DISCORD_BOT_TOKEN_HERE



## 1. Launching Backend API & Telemetry Simulator

# Navigate into the backend terminal node
cd backend

# Install necessary dependency modules
npm install

# Start the active environment daemon
node server.js
# Navigate to the dashboard directory
cd ../dashboard

# Open index.html in a web browser or serve via live-server
npm install --global live-server
live-server
# Navigate to the bot subsystem deployment area
cd ../bot

# Install required discord mapping modules
npm install

# Start the client bot worker process
node bot.js
Discord Interactive Commands
Command	Action Performed	Expected Response Behavior
!status	Queries overall office device configuration	Generates an intelligent, conversational overview of all 3 workspace configurations via LLM text mapping.
!room [id]	Audits a isolated zone (drawing, work1, work2)	Outputs specific status frames displaying precisely what devices are left operating inside the targeted perimeter.
!usage	Aggregates live office system energy calculations	Evaluates current real-time Watt totals, projects daily aggregate usage, and drops custom energy-saving notifications.
⚠️ High-Voltage Circuit Electrical Topography
Safety Disclaimer: High-voltage AC mains (110V/220V) electrical wiring poses severe real-world hazards. This structural configuration layout relates solely to isolated Tinkercad or Wokwi prototyping logic simulations.

Logic Side Pin-Mapping Configuration
GPIO 13 ──► Relay 1 IN (Light 1 - 15W) [Active-LOW Logic Trigger Pattern]

GPIO 14 ──► Relay 2 IN (Light 2 - 15W) [Active-LOW Logic Trigger Pattern]

GPIO 15 ──► Relay 3 IN (Light 3 - 15W) [Active-LOW Logic Trigger Pattern]

GPIO 16 ──► Relay 4 IN (Fan Cluster 1 - 60W) [Parallel Motor Array Configuration]

GPIO 17 ──► Relay 5 IN (Fan Cluster 2 - 60W) [Parallel Motor Array Configuration]

GPIO 34 ──► ACS712 Sensor Vout (Analog ADC1) [Main Phase Inline Tracking Line]

Main Phase Electrical Flow Sequence
[ AC Mains Live Wire Input ] ──► [ ACS712 Sensor Terminal (In-Series) ]
                                             │
                                             ▼
                             [ Shared Parallel Relay COM Bus ]
                                             │ (Switch Contacts Closed)
                                             ▼
                             [ Appliance Phase Terminal Inputs ]
                                             │
[ AC Mains Neutral Return Line ] ◄───────────┴── [ Shared Neutral Bar Connection ]
 Assigned Administrative Personnel (System Log Profiles)
As per system authorization schemas, the primary emergency contacts configured within alert modules are restricted to:

JSON
[
  {
    "name": "Nafisa Rahman",
    "email": "nafisa.rahman@yahoo.com",
    "phone": "+8801812345678"
  },
  {
    "name": "Tanvir Hossain",
    "email": "tanvir.hossain@yahoo.com",
    "phone": "+8801912345678"
  }
]
