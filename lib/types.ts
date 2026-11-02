export enum SpaceStatus {
  Available = 0,
  Occupied = 1,
  Unavailable = 2,
}

export enum ReservationStatus {
  Active = 0,
  Cancelled = 1,
  Completed = 2,
}

export interface ParkingSpace {
  id: bigint;
  owner: `0x${string}`;
  spaceNumber: string;
  location: string;
  hourlyRate: bigint;
  status: number; // 0: Available, 1: Occupied, 2: Unavailable
  createdAt: bigint;
}

export interface Reservation {
  id: bigint;
  spaceId: bigint;
  driver: `0x${string}`;
  startTime: bigint;
  endTime: bigint;
  status: number; // 0: Active, 1: Cancelled, 2: Completed
}

