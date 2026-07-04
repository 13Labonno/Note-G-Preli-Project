// Shared In-Memory State
const rooms = ['drawing', 'work1', 'work2'];
const roomDisplayNames = {
    drawing: 'Drawing Room',
    work1: 'Work Room 1',
    work2: 'Work Room 2'
};

let devices = [];

// Initialize 15 devices (2 fans, 3 lights per room)
rooms.forEach(room => {
    for (let i = 1; i <= 2; i++) {
        devices.push({
            room: room,
            room_display: roomDisplayNames[room],
            device_id: `${room}_fan_${i}`,
            name: `Fan ${i}`,
            type: 'fan',
            status: 'off',
            power_draw_w: 60,
            last_changed: new Date().toISOString()
        });
    }
    for (let i = 1; i <= 3; i++) {
        devices.push({
            room: room,
            room_display: roomDisplayNames[room],
            device_id: `${room}_light_${i}`,
            name: `Light ${i}`,
            type: 'light',
            status: 'off',
            power_draw_w: 15,
            last_changed: new Date().toISOString()
        });
    }
});

// Mandatory Dummy User Data
const users = [
    { name: "Nafisa Rahman", email: "nafisa.rahman@yahoo.com", phone: "+8801812345678" },
    { name: "Tanvir Hossain", email: "tanvir.hossain@yahoo.com", phone: "+8801912345678" }
];

// Active Alerts Storage
let alerts = [];

function updateSimulation() {
    // Randomly toggle a device state to make it look alive
    const randomIndex = Math.floor(Math.random() * devices.length);
    const device = devices[randomIndex];
    device.status = device.status === 'on' ? 'off' : 'on';
    device.last_changed = new Date().toISOString();

    // Check for anomalous situations (Alerts)
    const currentHour = new Date().getHours();
    const isAfterHours = currentHour < 9 || currentHour >= 17; // Outside 9 AM - 5 PM

    alerts = []; // Reset and re-evaluate

    if (isAfterHours) {
        const activeDevices = devices.filter(d => d.status === 'on');
        if (activeDevices.length > 0) {
            alerts.push({
                id: Date.now().toString(),
                type: 'AFTER_HOURS',
                message: `Alert: ${activeDevices.length} devices are left ON after office hours!`,
                timestamp: new Date().toISOString(),
                assigned_to: users[Math.floor(Math.random() * users.length)] // Assigning to dummy user
            });
        }
    }
}

// Start simulation ticker
setInterval(updateSimulation, 5000);

function getSystemState() {
    const totalPower = devices.reduce((sum, d) => sum + (d.status === 'on' ? d.power_draw_w : 0), 0);
    
    const roomBreakdown = {};
    rooms.forEach(r => {
        roomBreakdown[r] = devices
            .filter(d => d.room === r && d.status === 'on')
            .reduce((sum, d) => sum + d.power_draw_w, 0);
    });

    return {
        devices,
        alerts,
        metrics: {
            total_power_w: totalPower,
            room_breakdown_w: roomBreakdown,
            estimated_daily_kwh: parseFloat(((totalPower * 8) / 1000).toFixed(2)) // Assumed 8 hours average
        }
    };
}

module.exports = { getSystemState };