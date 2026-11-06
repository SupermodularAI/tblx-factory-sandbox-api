// fleet-api: the fleet data contract and its parsers. Plain JavaScript (ESM) so it runs from node_modules,
// where Node does not strip TypeScript types. The types live in ../index.d.ts.

export class FleetDataError extends Error {
  /** @param {string} path @param {string} message */
  constructor(path, message) {
    super(`${path}: ${message}`);
    this.name = "FleetDataError";
    this.path = path;
  }
}

/** @param {string | unknown} input @returns {import("../index.d.ts").Trip[]} */
export function parseTrips(input) {
  return list(input, "trips").map((raw, i) => {
    const at = `trips[${i}]`;
    const o = object(raw, at);
    const trip = {
      vehicleId: text(o, "vehicleId", at),
      startedAt: isoTime(o, "startedAt", at),
      endedAt: isoTime(o, "endedAt", at),
      distanceKm: nonNegative(o, "distanceKm", at),
      fuelLitres: nonNegative(o, "fuelLitres", at),
      odometerKm: nonNegative(o, "odometerKm", at),
    };
    if (Date.parse(trip.endedAt) < Date.parse(trip.startedAt)) throw new FleetDataError(`${at}.endedAt`, "is before startedAt");
    return trip;
  });
}

/** @param {string | unknown} input @returns {import("../index.d.ts").Vehicle[]} */
export function parseVehicles(input) {
  return list(input, "vehicles").map((raw, i) => {
    const at = `vehicles[${i}]`;
    const o = object(raw, at);
    return {
      id: text(o, "id", at),
      model: text(o, "model", at),
      lastServiceKm: nonNegative(o, "lastServiceKm", at),
      serviceIntervalKm: positive(o, "serviceIntervalKm", at),
    };
  });
}

function list(input, path) {
  let value = input;
  if (typeof input === "string") {
    try {
      value = JSON.parse(input);
    } catch (err) {
      throw new FleetDataError(path, `is not valid JSON (${err.message})`);
    }
  }
  if (!Array.isArray(value)) throw new FleetDataError(path, "must be an array");
  return value;
}

function object(raw, at) {
  if (raw === null || typeof raw !== "object" || Array.isArray(raw)) throw new FleetDataError(at, "must be an object");
  return raw;
}

function text(o, key, at) {
  const v = o[key];
  if (typeof v !== "string" || v.trim() === "") throw new FleetDataError(`${at}.${key}`, "must be a non-empty string");
  return v;
}

function isoTime(o, key, at) {
  const v = text(o, key, at);
  if (Number.isNaN(Date.parse(v))) throw new FleetDataError(`${at}.${key}`, "must be an ISO 8601 time");
  return v;
}

function nonNegative(o, key, at) {
  const v = o[key];
  if (typeof v !== "number" || !Number.isFinite(v) || v < 0) throw new FleetDataError(`${at}.${key}`, "must be a number >= 0");
  return v;
}

function positive(o, key, at) {
  const v = nonNegative(o, key, at);
  if (v === 0) throw new FleetDataError(`${at}.${key}`, "must be greater than 0");
  return v;
}
