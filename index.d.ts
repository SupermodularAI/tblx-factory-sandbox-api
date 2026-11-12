// The public contract of fleet-api. Keep it in step with src/index.js: fleet-insights imports these names.

export interface Vehicle {
  id: string;
  model: string;
  /** Odometer reading at the last service, in km. */
  lastServiceKm: number;
  /** Service interval for this model, in km. */
  serviceIntervalKm: number;
}

export interface Trip {
  vehicleId: string;
  /** ISO 8601 start time, UTC. */
  startedAt: string;
  /** ISO 8601 end time, UTC. */
  endedAt: string;
  distanceKm: number;
  fuelLitres: number;
  /** Odometer reading at the end of the trip, in km. */
  odometerKm: number;
  /** Who drove the trip. Absent when the driver is not recorded. */
  driverId?: string;
}

/** Thrown by the parsers; `path` names the offending field, e.g. `trips[2].distanceKm`. */
export class FleetDataError extends Error {
  readonly path: string;
  constructor(path: string, message: string);
}

/** Parses and validates a JSON array of trips (a string or an already-parsed value). */
export function parseTrips(input: string | unknown): Trip[];

/** Parses and validates a JSON array of vehicles (a string or an already-parsed value). */
export function parseVehicles(input: string | unknown): Vehicle[];
