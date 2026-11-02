import { expect } from "chai";
import hre from "hardhat";
const { ethers } = hre;
import { time } from "@nomicfoundation/hardhat-network-helpers";
import { Parkly } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("Parkly Smart Contract", function () {
  let parkly: Parkly;
  let owner: HardhatEthersSigner;
  let driver1: HardhatEthersSigner;
  let driver2: HardhatEthersSigner;
  let otherUser: HardhatEthersSigner;

  const spaceNumber = "A-101";
  const location = "Downtown Central Parking, 4th Avenue";
  const hourlyRate = ethers.parseEther("0.05"); // 0.05 BOHR/ETH per hour

  beforeEach(async function () {
    [owner, driver1, driver2, otherUser] = await ethers.getSigners();

    const ParklyFactory = await ethers.getContractFactory("Parkly");
    parkly = (await ParklyFactory.deploy()) as Parkly;
    await parkly.waitForDeployment();
  });

  describe("1. Adding Parking Spaces", function () {
    it("Should allow an owner to add a valid parking space", async function () {
      const tx = await parkly.connect(owner).addParkingSpace(spaceNumber, location, hourlyRate);
      await expect(tx)
        .to.emit(parkly, "ParkingSpaceAdded")
        .withArgs(1, owner.address, spaceNumber, location, hourlyRate);

      expect(await parkly.spaceCount()).to.equal(1);

      const space = await parkly.getParkingSpace(1);
      expect(space.id).to.equal(1);
      expect(space.owner).to.equal(owner.address);
      expect(space.spaceNumber).to.equal(spaceNumber);
      expect(space.location).to.equal(location);
      expect(space.hourlyRate).to.equal(hourlyRate);
      expect(space.status).to.equal(0); // SpaceStatus.Available
    });

    it("Should reject adding spaces with empty space number", async function () {
      await expect(
        parkly.connect(owner).addParkingSpace("", location, hourlyRate)
      ).to.be.revertedWithCustomError(parkly, "InvalidSpaceDetails");
    });

    it("Should reject adding spaces with empty location", async function () {
      await expect(
        parkly.connect(owner).addParkingSpace(spaceNumber, "", hourlyRate)
      ).to.be.revertedWithCustomError(parkly, "InvalidSpaceDetails");
    });

    it("Should reject adding spaces with 0 hourly rate", async function () {
      await expect(
        parkly.connect(owner).addParkingSpace(spaceNumber, location, 0)
      ).to.be.revertedWithCustomError(parkly, "InvalidSpaceDetails");
    });
  });

  describe("2. Updating Parking Spaces", function () {
    beforeEach(async function () {
      await parkly.connect(owner).addParkingSpace(spaceNumber, location, hourlyRate);
    });

    it("Should allow the owner to update their parking space details", async function () {
      const updatedNumber = "A-102-VIP";
      const updatedLocation = "Downtown Central Parking, 5th Floor";
      const updatedRate = ethers.parseEther("0.08");

      const tx = await parkly
        .connect(owner)
        .updateParkingSpace(1, updatedNumber, updatedLocation, updatedRate);

      await expect(tx)
        .to.emit(parkly, "ParkingSpaceUpdated")
        .withArgs(1, updatedNumber, updatedLocation, updatedRate);

      const space = await parkly.getParkingSpace(1);
      expect(space.spaceNumber).to.equal(updatedNumber);
      expect(space.location).to.equal(updatedLocation);
      expect(space.hourlyRate).to.equal(updatedRate);
    });

    it("Should reject update from a non-owner", async function () {
      await expect(
        parkly
          .connect(otherUser)
          .updateParkingSpace(1, "Hack-99", "Unknown", hourlyRate)
      ).to.be.revertedWithCustomError(parkly, "NotSpaceOwner");
    });

    it("Should reject invalid update details (empty values or 0 rate)", async function () {
      await expect(
        parkly.connect(owner).updateParkingSpace(1, "", location, hourlyRate)
      ).to.be.revertedWithCustomError(parkly, "InvalidSpaceDetails");

      await expect(
        parkly.connect(owner).updateParkingSpace(1, spaceNumber, "", hourlyRate)
      ).to.be.revertedWithCustomError(parkly, "InvalidSpaceDetails");

      await expect(
        parkly.connect(owner).updateParkingSpace(1, spaceNumber, location, 0)
      ).to.be.revertedWithCustomError(parkly, "InvalidSpaceDetails");
    });
  });

  describe("3. Reserving Parking Spaces", function () {
    beforeEach(async function () {
      await parkly.connect(owner).addParkingSpace(spaceNumber, location, hourlyRate);
    });

    it("Should allow a driver to reserve an available space", async function () {
      const now = await time.latest();
      const startTime = now + 3600; // 1 hr in future
      const endTime = startTime + 7200; // 2 hrs duration

      const tx = await parkly.connect(driver1).reserveSpace(1, startTime, endTime);
      await expect(tx)
        .to.emit(parkly, "SpaceReserved")
        .withArgs(1, 1, driver1.address, startTime, endTime);

      const res = await parkly.reservations(1);
      expect(res.id).to.equal(1);
      expect(res.spaceId).to.equal(1);
      expect(res.driver).to.equal(driver1.address);
      expect(res.startTime).to.equal(startTime);
      expect(res.endTime).to.equal(endTime);
      expect(res.status).to.equal(0); // Active
    });

    it("Should prevent owner from reserving their own space", async function () {
      const now = await time.latest();
      const startTime = now + 3600;
      const endTime = startTime + 3600;

      await expect(
        parkly.connect(owner).reserveSpace(1, startTime, endTime)
      ).to.be.revertedWithCustomError(parkly, "CannotReserveOwnSpace");
    });

    it("Should reject reservation with start time in the past", async function () {
      const now = await time.latest();
      const startTime = now - 100;
      const endTime = now + 3600;

      await expect(
        parkly.connect(driver1).reserveSpace(1, startTime, endTime)
      ).to.be.revertedWithCustomError(parkly, "InvalidTimeRange");
    });

    it("Should reject reservation where end time <= start time", async function () {
      const now = await time.latest();
      const startTime = now + 3600;
      const endTime = startTime;

      await expect(
        parkly.connect(driver1).reserveSpace(1, startTime, endTime)
      ).to.be.revertedWithCustomError(parkly, "InvalidTimeRange");
    });

    it("Should reject reservation if space is marked Unavailable", async function () {
      await parkly.connect(owner).updateSpaceAvailability(1, 2); // Unavailable

      const now = await time.latest();
      const startTime = now + 3600;
      const endTime = startTime + 3600;

      await expect(
        parkly.connect(driver1).reserveSpace(1, startTime, endTime)
      ).to.be.revertedWithCustomError(parkly, "SpaceUnavailable");
    });

    it("Should prevent overlapping and duplicate reservations for the same space", async function () {
      const now = await time.latest();
      const startTime = now + 3600;
      const endTime = startTime + 7200; // 3600 -> 10800

      // Driver 1 books 3600 -> 10800
      await parkly.connect(driver1).reserveSpace(1, startTime, endTime);

      // 1. Exact duplicate reservation
      await expect(
        parkly.connect(driver2).reserveSpace(1, startTime, endTime)
      ).to.be.revertedWithCustomError(parkly, "ReservationOverlap");

      // 2. Starts inside existing window
      await expect(
        parkly.connect(driver2).reserveSpace(1, startTime + 1800, endTime + 1800)
      ).to.be.revertedWithCustomError(parkly, "ReservationOverlap");

      // 3. Ends inside existing window
      await expect(
        parkly.connect(driver2).reserveSpace(1, startTime - 1800, startTime + 1800)
      ).to.be.revertedWithCustomError(parkly, "ReservationOverlap");

      // 4. Completely covers existing window
      await expect(
        parkly.connect(driver2).reserveSpace(1, startTime - 500, endTime + 500)
      ).to.be.revertedWithCustomError(parkly, "ReservationOverlap");

      // 5. Contiguous non-overlapping window should succeed: right before
      const txBefore = await parkly
        .connect(driver2)
        .reserveSpace(1, startTime - 1800, startTime);
      await expect(txBefore).to.emit(parkly, "SpaceReserved");

      // 6. Contiguous non-overlapping window should succeed: right after
      const txAfter = await parkly
        .connect(driver2)
        .reserveSpace(1, endTime, endTime + 3600);
      await expect(txAfter).to.emit(parkly, "SpaceReserved");
    });
  });

  describe("4. Cancelling Reservations", function () {
    let startTime: number;
    let endTime: number;

    beforeEach(async function () {
      await parkly.connect(owner).addParkingSpace(spaceNumber, location, hourlyRate);
      const now = await time.latest();
      startTime = now + 3600;
      endTime = startTime + 3600;
      await parkly.connect(driver1).reserveSpace(1, startTime, endTime);
    });

    it("Should allow the driver to cancel their reservation", async function () {
      const tx = await parkly.connect(driver1).cancelReservation(1);
      await expect(tx)
        .to.emit(parkly, "ReservationCancelled")
        .withArgs(1, 1, driver1.address);

      const res = await parkly.reservations(1);
      expect(res.status).to.equal(1); // Cancelled

      // Once cancelled, another driver can book the exact same slot
      const tx2 = await parkly.connect(driver2).reserveSpace(1, startTime, endTime);
      await expect(tx2).to.emit(parkly, "SpaceReserved");
    });

    it("Should allow the space owner to cancel a reservation", async function () {
      const tx = await parkly.connect(owner).cancelReservation(1);
      await expect(tx)
        .to.emit(parkly, "ReservationCancelled")
        .withArgs(1, 1, owner.address);

      const res = await parkly.reservations(1);
      expect(res.status).to.equal(1);
    });

    it("Should reject cancellation by an unauthorized third party", async function () {
      await expect(
        parkly.connect(otherUser).cancelReservation(1)
      ).to.be.revertedWithCustomError(parkly, "NotAuthorized");
    });

    it("Should reject cancellation of already cancelled reservation", async function () {
      await parkly.connect(driver1).cancelReservation(1);
      await expect(
        parkly.connect(driver1).cancelReservation(1)
      ).to.be.revertedWithCustomError(parkly, "ReservationNotActive");
    });
  });

  describe("5. Completing Reservations", function () {
    beforeEach(async function () {
      await parkly.connect(owner).addParkingSpace(spaceNumber, location, hourlyRate);
      const now = await time.latest();
      await parkly.connect(driver1).reserveSpace(1, now + 3600, now + 7200);
    });

    it("Should allow the space owner to mark reservation as completed", async function () {
      const tx = await parkly.connect(owner).completeReservation(1);
      await expect(tx)
        .to.emit(parkly, "ReservationCompleted")
        .withArgs(1, 1);

      const res = await parkly.reservations(1);
      expect(res.status).to.equal(2); // Completed
    });

    it("Should reject completion by driver or unauthorized user", async function () {
      await expect(
        parkly.connect(driver1).completeReservation(1)
      ).to.be.revertedWithCustomError(parkly, "NotSpaceOwner");

      await expect(
        parkly.connect(otherUser).completeReservation(1)
      ).to.be.revertedWithCustomError(parkly, "NotSpaceOwner");
    });

    it("Should reject completing an already completed or cancelled reservation", async function () {
      await parkly.connect(owner).completeReservation(1);
      await expect(
        parkly.connect(owner).completeReservation(1)
      ).to.be.revertedWithCustomError(parkly, "ReservationNotActive");
    });
  });

  describe("6. Updating Parking Availability", function () {
    beforeEach(async function () {
      await parkly.connect(owner).addParkingSpace(spaceNumber, location, hourlyRate);
    });

    it("Should allow owner to set space to Unavailable and back to Available when no active reservation is ongoing", async function () {
      // Set to Unavailable (2)
      let tx = await parkly.connect(owner).updateSpaceAvailability(1, 2);
      await expect(tx)
        .to.emit(parkly, "SpaceAvailabilityUpdated")
        .withArgs(1, 2);

      let space = await parkly.getParkingSpace(1);
      expect(space.status).to.equal(2);

      // Set back to Available (0)
      tx = await parkly.connect(owner).updateSpaceAvailability(1, 0);
      await expect(tx)
        .to.emit(parkly, "SpaceAvailabilityUpdated")
        .withArgs(1, 0);

      space = await parkly.getParkingSpace(1);
      expect(space.status).to.equal(0);
    });

    it("Should reject non-owner updating space availability", async function () {
      await expect(
        parkly.connect(otherUser).updateSpaceAvailability(1, 2)
      ).to.be.revertedWithCustomError(parkly, "NotSpaceOwner");
    });

    it("Should reject invalid availability status (e.g. Occupied is not directly settable via this function)", async function () {
      await expect(
        parkly.connect(owner).updateSpaceAvailability(1, 1)
      ).to.be.revertedWithCustomError(parkly, "InvalidAvailabilityStatus");
    });

    it("Should reject setting to Available if an active reservation is currently in progress", async function () {
      const now = await time.latest();
      // Book for now to now + 3600
      await parkly.connect(driver1).reserveSpace(1, now + 10, now + 3600);

      // Set to Unavailable before it starts
      await parkly.connect(owner).updateSpaceAvailability(1, 2);

      // Fast forward time to inside the reservation window
      await time.increase(100);

      // Attempt to make Available while active reservation is ongoing
      await expect(
        parkly.connect(owner).updateSpaceAvailability(1, 0)
      ).to.be.revertedWithCustomError(parkly, "ReservationInProgress");
    });
  });

  describe("7. View and Query Functions", function () {
    beforeEach(async function () {
      await parkly.connect(owner).addParkingSpace("A-1", "Loc 1", hourlyRate);
      await parkly.connect(owner).addParkingSpace("A-2", "Loc 2", hourlyRate);
      await parkly.connect(otherUser).addParkingSpace("B-1", "Loc 3", hourlyRate);

      const now = await time.latest();
      await parkly.connect(driver1).reserveSpace(1, now + 1000, now + 2000);
      await parkly.connect(driver1).reserveSpace(2, now + 3000, now + 4000);
      await parkly.connect(driver2).reserveSpace(3, now + 5000, now + 6000);
    });

    it("getAllParkingSpaces should return all spaces", async function () {
      const allSpaces = await parkly.getAllParkingSpaces();
      expect(allSpaces.length).to.equal(3);
      expect(allSpaces[0].spaceNumber).to.equal("A-1");
      expect(allSpaces[1].spaceNumber).to.equal("A-2");
      expect(allSpaces[2].spaceNumber).to.equal("B-1");
    });

    it("getUserSpaces should return spaces belonging to specified user", async function () {
      const ownerSpaces = await parkly.getUserSpaces(owner.address);
      expect(ownerSpaces.length).to.equal(2);

      const otherSpaces = await parkly.getUserSpaces(otherUser.address);
      expect(otherSpaces.length).to.equal(1);
      expect(otherSpaces[0].spaceNumber).to.equal("B-1");
    });

    it("getUserReservations should return reservations made by specified user", async function () {
      const driver1Res = await parkly.getUserReservations(driver1.address);
      expect(driver1Res.length).to.equal(2);

      const driver2Res = await parkly.getUserReservations(driver2.address);
      expect(driver2Res.length).to.equal(1);
    });

    it("getSpaceReservations should return reservations for a specific space", async function () {
      const space1Res = await parkly.getSpaceReservations(1);
      expect(space1Res.length).to.equal(1);
      expect(space1Res[0].driver).to.equal(driver1.address);
    });
  });
});
