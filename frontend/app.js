const ws = new WebSocket('ws://localhost:5000');

ws.onmessage = (event) => {
    const state = JSON.parse(event.data);
    updateDashboard(state);
};

function updateDashboard(state) {
    // 1. Update Core Metrics
    document.getElementById('total-power').innerText = `${state.metrics.total_power_w} W`;
    document.getElementById('daily-kwh').innerText = `${state.metrics.estimated_daily_kwh} kWh`;

    // 2. Update Room Power Headers
    document.getElementById('pow-drawing').innerText = state.metrics.room_breakdown_w.drawing;
    document.getElementById('pow-work1').innerText = state.metrics.room_breakdown_w.work1;
    document.getElementById('pow-work2').innerText = state.metrics.room_breakdown_w.work2;

    // 3. Clear and Render Devices by Room
    const rooms = ['drawing', 'work1', 'work2'];
    rooms.forEach(roomKey => {
        const container = document.getElementById(`devices-${roomKey}`);
        container.innerHTML = ''; // Clear previous

        const roomDevices = state.devices.filter(d => d.room === roomKey);
        roomDevices.forEach(device => {
            const div = document.createElement('div');
            div.className = `device-item ${device.type} ${device.status}`;
            div.innerText = `${device.name}: ${device.status.toUpperCase()}`;
            container.appendChild(div);
        });
    });

    // 4. Update Alerts Panel
    const alertsList = document.getElementById('alerts-list');
    if (state.alerts.length === 0) {
        alertsList.innerHTML = '<p class="no-alerts">No anomalies detected. System normal.</p>';
    } else {
        alertsList.innerHTML = '';
        state.alerts.forEach(alert => {
            const alertDiv = document.createElement('div');
            alertDiv.className = 'alert-item';
            alertDiv.innerHTML = `<strong>${alert.message}</strong> <br> 
                <small>Time: ${new Date(alert.timestamp).toLocaleTimeString()} | 
                Responsible: ${alert.assigned_to.name} (${alert.assigned_to.phone})</small>`;
            alertsList.appendChild(alertDiv);
        });
    }
}

ws.onerror = (error) => console.error('WebSocket Error: ', error);