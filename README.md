# sector-alarm

TypeScript client for the Sector Alarm API.

## Install

```bash
npm install sector-alarm
```

## Usage

```ts
import { SectorAlarm } from "sector-alarm";

const client = new SectorAlarm({
  email: "user@example.com",
  password: "secret",
  panelId: "12345678",
  panelCode: "1234",
});

const status = await client.getPanelStatus();
const temps = await client.getTemperatures();
const humidity = await client.getHumidity();
const doors = await client.getDoorsAndWindows();
const locks = await client.getLocks();
const plugs = await client.getSmartPlugs();

await client.arm();
await client.partialArm();
await client.disarm();
await client.lock("LOCK_SERIAL");
await client.unlock("LOCK_SERIAL");
```

## Error Handling

```ts
import { SectorAlarmAuthError, SectorAlarmApiError } from "sector-alarm";

try {
  await client.getPanelStatus();
} catch (err) {
  if (err instanceof SectorAlarmAuthError) {
    // 401 — bad credentials or expired token
  } else if (err instanceof SectorAlarmApiError) {
    // other API error
  }
}
```

## License

MIT
