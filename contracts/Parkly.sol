// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title Parkly
 * @notice On-chain parking space management and reservation smart contract.
 */
contract Parkly {
    // --- Enums ---
    enum SpaceStatus {
        Available,   // 0
        Occupied,    // 1
        Unavailable  // 2
    }

    enum ReservationStatus {
        Active,      // 0
        Cancelled,   // 1
        Completed    // 2
    }

    // --- Structs ---
    struct ParkingSpace {
        uint256 id;
        address owner;
        string spaceNumber;
        string location;
        uint256 hourlyRate;
        SpaceStatus status;
        uint256 createdAt;
    }

    struct Reservation {
        uint256 id;
        uint256 spaceId;
        address driver;
        uint256 startTime;
        uint256 endTime;
        ReservationStatus status;
    }

    // --- State Variables ---
    uint256 public spaceCount;
    uint256 public reservationCount;

    mapping(uint256 => ParkingSpace) public spaces;
    mapping(uint256 => Reservation) public reservations;

    // Indexes for efficient querying
    mapping(address => uint256[]) private _ownerSpaces;
    mapping(address => uint256[]) private _driverReservations;
    mapping(uint256 => uint256[]) private _spaceReservations;

    // --- Custom Errors ---
    error InvalidSpaceDetails();
    error SpaceNotFound();
    error NotSpaceOwner();
    error NotAuthorized();
    error CannotReserveOwnSpace();
    error SpaceUnavailable();
    error InvalidTimeRange();
    error ReservationOverlap(uint256 existingReservationId, uint256 startTime, uint256 endTime);
    error ReservationNotFound();
    error ReservationNotActive();
    error ReservationInProgress(uint256 reservationId);
    error InvalidAvailabilityStatus();

    // --- Events ---
    event ParkingSpaceAdded(
        uint256 indexed spaceId,
        address indexed owner,
        string spaceNumber,
        string location,
        uint256 hourlyRate
    );

    event ParkingSpaceUpdated(
        uint256 indexed spaceId,
        string spaceNumber,
        string location,
        uint256 hourlyRate
    );

    event SpaceReserved(
        uint256 indexed reservationId,
        uint256 indexed spaceId,
        address indexed driver,
        uint256 startTime,
        uint256 endTime
    );

    event ReservationCancelled(
        uint256 indexed reservationId,
        uint256 indexed spaceId,
        address indexed cancelledBy
    );

    event ReservationCompleted(
        uint256 indexed reservationId,
        uint256 indexed spaceId
    );

    event SpaceAvailabilityUpdated(
        uint256 indexed spaceId,
        SpaceStatus newStatus
    );

    // --- Modifiers ---
    modifier spaceExists(uint256 spaceId) {
        if (spaceId == 0 || spaceId > spaceCount) revert SpaceNotFound();
        _;
    }

    modifier onlySpaceOwner(uint256 spaceId) {
        if (spaces[spaceId].owner != msg.sender) revert NotSpaceOwner();
        _;
    }

    // --- Parking Space Management ---

    /**
     * @notice Allows parking owners to list a new space.
     * @param spaceNumber The identification number or name of the space.
     * @param location The physical address or designated area of the space.
     * @param hourlyRate The hourly fee in wei (or base native currency).
     * @return spaceId The newly assigned unique space ID.
     */
    function addParkingSpace(
        string calldata spaceNumber,
        string calldata location,
        uint256 hourlyRate
    ) external returns (uint256) {
        if (bytes(spaceNumber).length == 0 || bytes(location).length == 0 || hourlyRate == 0) {
            revert InvalidSpaceDetails();
        }

        spaceCount++;
        uint256 newSpaceId = spaceCount;

        spaces[newSpaceId] = ParkingSpace({
            id: newSpaceId,
            owner: msg.sender,
            spaceNumber: spaceNumber,
            location: location,
            hourlyRate: hourlyRate,
            status: SpaceStatus.Available,
            createdAt: block.timestamp
        });

        _ownerSpaces[msg.sender].push(newSpaceId);

        emit ParkingSpaceAdded(newSpaceId, msg.sender, spaceNumber, location, hourlyRate);

        return newSpaceId;
    }

    /**
     * @notice Allows original owner to update space details.
     */
    function updateParkingSpace(
        uint256 spaceId,
        string calldata spaceNumber,
        string calldata location,
        uint256 hourlyRate
    ) external spaceExists(spaceId) onlySpaceOwner(spaceId) {
        if (bytes(spaceNumber).length == 0 || bytes(location).length == 0 || hourlyRate == 0) {
            revert InvalidSpaceDetails();
        }

        ParkingSpace storage space = spaces[spaceId];
        space.spaceNumber = spaceNumber;
        space.location = location;
        space.hourlyRate = hourlyRate;

        emit ParkingSpaceUpdated(spaceId, spaceNumber, location, hourlyRate);
    }

    /**
     * @notice Allows space owner to update status between Available and Unavailable.
     * Cannot make Available if an active reservation is currently in progress.
     */
    function updateSpaceAvailability(
        uint256 spaceId,
        SpaceStatus newStatus
    ) external spaceExists(spaceId) onlySpaceOwner(spaceId) {
        if (newStatus != SpaceStatus.Available && newStatus != SpaceStatus.Unavailable) {
            revert InvalidAvailabilityStatus();
        }

        if (newStatus == SpaceStatus.Available) {
            // Check if any active reservation is in progress right now
            uint256[] storage resIds = _spaceReservations[spaceId];
            uint256 len = resIds.length;
            for (uint256 i = 0; i < len; i++) {
                Reservation storage r = reservations[resIds[i]];
                if (
                    r.status == ReservationStatus.Active &&
                    block.timestamp >= r.startTime &&
                    block.timestamp < r.endTime
                ) {
                    revert ReservationInProgress(r.id);
                }
            }
        }

        spaces[spaceId].status = newStatus;

        emit SpaceAvailabilityUpdated(spaceId, newStatus);
    }

    // --- Reservation Management ---

    /**
     * @notice Reserves an available parking space for a given time window.
     */
    function reserveSpace(
        uint256 spaceId,
        uint256 startTime,
        uint256 endTime
    ) external spaceExists(spaceId) returns (uint256) {
        ParkingSpace storage space = spaces[spaceId];

        if (msg.sender == space.owner) revert CannotReserveOwnSpace();
        if (space.status == SpaceStatus.Unavailable) revert SpaceUnavailable();
        if (startTime < block.timestamp || endTime <= startTime) revert InvalidTimeRange();

        // Check for overlapping active reservations
        uint256[] storage resIds = _spaceReservations[spaceId];
        uint256 len = resIds.length;
        for (uint256 i = 0; i < len; i++) {
            Reservation storage r = reservations[resIds[i]];
            if (r.status == ReservationStatus.Active) {
                // Overlap exists if reservation intervals intersect
                if (startTime < r.endTime && endTime > r.startTime) {
                    revert ReservationOverlap(r.id, r.startTime, r.endTime);
                }
            }
        }

        reservationCount++;
        uint256 newResId = reservationCount;

        reservations[newResId] = Reservation({
            id: newResId,
            spaceId: spaceId,
            driver: msg.sender,
            startTime: startTime,
            endTime: endTime,
            status: ReservationStatus.Active
        });

        _driverReservations[msg.sender].push(newResId);
        _spaceReservations[spaceId].push(newResId);

        emit SpaceReserved(newResId, spaceId, msg.sender, startTime, endTime);

        return newResId;
    }

    /**
     * @notice Cancels an active reservation. Callable by driver or space owner.
     */
    function cancelReservation(uint256 reservationId) external {
        if (reservationId == 0 || reservationId > reservationCount) revert ReservationNotFound();

        Reservation storage r = reservations[reservationId];
        if (r.status != ReservationStatus.Active) revert ReservationNotActive();

        ParkingSpace storage space = spaces[r.spaceId];
        if (msg.sender != r.driver && msg.sender != space.owner) revert NotAuthorized();

        r.status = ReservationStatus.Cancelled;

        emit ReservationCancelled(reservationId, r.spaceId, msg.sender);
    }

    /**
     * @notice Marks a reservation as completed. Callable by space owner.
     */
    function completeReservation(uint256 reservationId) external {
        if (reservationId == 0 || reservationId > reservationCount) revert ReservationNotFound();

        Reservation storage r = reservations[reservationId];
        if (r.status != ReservationStatus.Active) revert ReservationNotActive();

        ParkingSpace storage space = spaces[r.spaceId];
        if (msg.sender != space.owner) revert NotSpaceOwner();

        r.status = ReservationStatus.Completed;

        emit ReservationCompleted(reservationId, r.spaceId);
    }

    // --- View Functions ---

    /**
     * @notice Retrieves single parking space details.
     */
    function getParkingSpace(uint256 spaceId) external view spaceExists(spaceId) returns (ParkingSpace memory) {
        return spaces[spaceId];
    }

    /**
     * @notice Retrieves all listed parking spaces.
     */
    function getAllParkingSpaces() external view returns (ParkingSpace[] memory) {
        ParkingSpace[] memory allSpaces = new ParkingSpace[](spaceCount);
        for (uint256 i = 1; i <= spaceCount; i++) {
            allSpaces[i - 1] = spaces[i];
        }
        return allSpaces;
    }

    /**
     * @notice Retrieves all parking spaces owned by the caller.
     */
    function getMySpaces() external view returns (ParkingSpace[] memory) {
        return getUserSpaces(msg.sender);
    }

    /**
     * @notice Retrieves all parking spaces owned by a specific address.
     */
    function getUserSpaces(address user) public view returns (ParkingSpace[] memory) {
        uint256[] storage spaceIds = _ownerSpaces[user];
        uint256 len = spaceIds.length;
        ParkingSpace[] memory userSpaces = new ParkingSpace[](len);
        for (uint256 i = 0; i < len; i++) {
            userSpaces[i] = spaces[spaceIds[i]];
        }
        return userSpaces;
    }

    /**
     * @notice Retrieves all reservations made by caller.
     */
    function getMyReservations() external view returns (Reservation[] memory) {
        return getUserReservations(msg.sender);
    }

    /**
     * @notice Retrieves all reservations made by a specific driver.
     */
    function getUserReservations(address user) public view returns (Reservation[] memory) {
        uint256[] storage resIds = _driverReservations[user];
        uint256 len = resIds.length;
        Reservation[] memory userRes = new Reservation[](len);
        for (uint256 i = 0; i < len; i++) {
            userRes[i] = reservations[resIds[i]];
        }
        return userRes;
    }

    /**
     * @notice Retrieves all reservations for a specific parking space.
     */
    function getSpaceReservations(uint256 spaceId) external view spaceExists(spaceId) returns (Reservation[] memory) {
        uint256[] storage resIds = _spaceReservations[spaceId];
        uint256 len = resIds.length;
        Reservation[] memory list = new Reservation[](len);
        for (uint256 i = 0; i < len; i++) {
            list[i] = reservations[resIds[i]];
        }
        return list;
    }
}

