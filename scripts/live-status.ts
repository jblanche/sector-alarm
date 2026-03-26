/**
 * Live status check — read-only, no state changes.
 * Usage: SECTOR_EMAIL=... SECTOR_PASSWORD=... SECTOR_PANEL_ID=... tsx scripts/live-status.ts
 */
import { SectorAlarm } from "../src/index.js";

const email = process.env["SECTOR_EMAIL"];
const password = process.env["SECTOR_PASSWORD"];
const panelId = process.env["SECTOR_PANEL_ID"];

if (!email || !password || !panelId) {
  console.error("Missing env vars: SECTOR_EMAIL, SECTOR_PASSWORD, SECTOR_PANEL_ID");
  process.exit(1);
}

const client = new SectorAlarm({ email, password, panelId });

console.log("🔌 Connecting to Sector Alarm API...\n");

// Panel status
const status = await client.getPanelStatus();
const armed = status.Status === 3 ? "🔴 Armed" : status.Status === 1 ? "🟢 Disarmed" : `⚪ Status ${status.Status}`;
console.log(`🏠 Panel: ${armed} | Online: ${status.IsOnline ? "✅" : "❌"} | Ready: ${status.ReadyToArm ? "✅" : "❌"}`);
console.log(`   Last update: ${status.StatusTime} (${status.TimeZoneName})\n`);

// Doors & windows
const dw = await client.getDoorsAndWindows();
console.log("🚪 Doors & Windows:");
for (const floor of dw.Floors) {
  for (const room of floor.Rooms) {
    for (const device of room.Devices) {
      const icon = device.Closed ? "🔒" : "🔓";
      const battery = device.LowBattery ? " ⚠️ Low battery" : "";
      const alarm = device.Alarm ? " 🚨 ALARM" : "";
      console.log(`   ${icon} ${room.Name} — ${device.Name}${battery}${alarm}`);
    }
  }
}

// Locks
const locks = await client.getLocks();
if (locks.length > 0) {
  console.log("\n🔑 Smart Locks:");
  for (const lock of locks) {
    console.log(`   ${lock.Status === "locked" ? "🔒" : "🔓"} ${lock.Label} (${lock.Serial})`);
  }
} else {
  console.log("\n🔑 Smart Locks: none");
}

// Temperatures
try {
  const temps = await client.getTemperatures();
  if (temps.length > 0) {
    console.log("\n🌡️  Temperatures:");
    for (const t of temps) {
      console.log(`   ${t.Label}: ${t.Temprature}°C`);
    }
  }
} catch {
  console.log("\n🌡️  Temperatures: unavailable");
}

console.log("\n✅ Done.");
