import { test } from "node:test";
import assert from "node:assert/strict";
import { FleetDataError, parseTrips, parseVehicles } from "../src/index.js";

const trip = { vehicleId: "V1", startedAt: "2026-10-01T08:00:00Z", endedAt: "2026-10-01T10:00:00Z", distanceKm: 100, fuelLitres: 30, odometerKm: 1000 };
const vehicle = { id: "V1", model: "Actros", lastServiceKm: 0, serviceIntervalKm: 1500 };

test("parses trips from a JSON string", () => {
  assert.deepEqual(parseTrips(JSON.stringify([trip])), [trip]);
});

test("parses an already-parsed value and drops unknown fields", () => {
  assert.deepEqual(parseTrips([{ ...trip, extra: true }]), [trip]);
});

test("rejects invalid JSON and non-arrays", () => {
  assert.throws(() => parseTrips("{"), FleetDataError);
  assert.throws(() => parseTrips({}), /trips: must be an array/);
});

test("names the offending field", () => {
  assert.throws(() => parseTrips([trip, { ...trip, distanceKm: -1 }]), (err) => err instanceof FleetDataError && err.path === "trips[1].distanceKm");
  assert.throws(() => parseTrips([{ ...trip, vehicleId: "" }]), /trips\[0\]\.vehicleId/);
  assert.throws(() => parseTrips([{ ...trip, startedAt: "yesterday" }]), /ISO 8601/);
});

test("rejects a trip that ends before it starts", () => {
  assert.throws(() => parseTrips([{ ...trip, endedAt: "2026-10-01T07:00:00Z" }]), /trips\[0\]\.endedAt: is before startedAt/);
});

test("accepts an optional driverId and validates it when present", () => {
  assert.deepEqual(parseTrips([trip]), [trip]);
  assert.equal("driverId" in parseTrips([trip])[0], false);
  assert.deepEqual(parseTrips([{ ...trip, driverId: "D1" }]), [{ ...trip, driverId: "D1" }]);
  assert.throws(() => parseTrips([{ ...trip, driverId: "" }]), (err) => err instanceof FleetDataError && err.path === "trips[0].driverId");
  assert.throws(() => parseTrips([trip, { ...trip, driverId: 42 }]), (err) => err instanceof FleetDataError && err.path === "trips[1].driverId");
  assert.throws(() => parseTrips([{ ...trip, driverId: null }]), /trips\[0\]\.driverId: must be a non-empty string/);
});

test("parses vehicles and requires a positive service interval", () => {
  assert.deepEqual(parseVehicles([vehicle]), [vehicle]);
  assert.throws(() => parseVehicles([{ ...vehicle, serviceIntervalKm: 0 }]), /vehicles\[0\]\.serviceIntervalKm: must be greater than 0/);
});
