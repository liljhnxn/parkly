export const PARKLY_ABI = [
  {
    "type": "error",
    "name": "CannotReserveOwnSpace",
    "inputs": []
  },
  {
    "type": "error",
    "name": "InvalidAvailabilityStatus",
    "inputs": []
  },
  {
    "type": "error",
    "name": "InvalidSpaceDetails",
    "inputs": []
  },
  {
    "type": "error",
    "name": "InvalidTimeRange",
    "inputs": []
  },
  {
    "type": "error",
    "name": "NotAuthorized",
    "inputs": []
  },
  {
    "type": "error",
    "name": "NotSpaceOwner",
    "inputs": []
  },
  {
    "type": "error",
    "name": "ReservationInProgress",
    "inputs": [
      {
        "name": "reservationId",
        "type": "uint256",
        "internalType": "uint256"
      }
    ]
  },
  {
    "type": "error",
    "name": "ReservationNotActive",
    "inputs": []
  },
  {
    "type": "error",
    "name": "ReservationNotFound",
    "inputs": []
  },
  {
    "type": "error",
    "name": "ReservationOverlap",
    "inputs": [
      {
        "name": "existingReservationId",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "startTime",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "endTime",
        "type": "uint256",
        "internalType": "uint256"
      }
    ]
  },
  {
    "type": "error",
    "name": "SpaceNotFound",
    "inputs": []
  },
  {
    "type": "error",
    "name": "SpaceUnavailable",
    "inputs": []
  },
  {
    "type": "event",
    "name": "ParkingSpaceAdded",
    "inputs": [
      {
        "name": "spaceId",
        "type": "uint256",
        "indexed": true,
        "internalType": "uint256"
      },
      {
        "name": "owner",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "spaceNumber",
        "type": "string",
        "indexed": false,
        "internalType": "string"
      },
      {
        "name": "location",
        "type": "string",
        "indexed": false,
        "internalType": "string"
      },
      {
        "name": "hourlyRate",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "ParkingSpaceUpdated",
    "inputs": [
      {
        "name": "spaceId",
        "type": "uint256",
        "indexed": true,
        "internalType": "uint256"
      },
      {
        "name": "spaceNumber",
        "type": "string",
        "indexed": false,
        "internalType": "string"
      },
      {
        "name": "location",
        "type": "string",
        "indexed": false,
        "internalType": "string"
      },
      {
        "name": "hourlyRate",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "ReservationCancelled",
    "inputs": [
      {
        "name": "reservationId",
        "type": "uint256",
        "indexed": true,
        "internalType": "uint256"
      },
      {
        "name": "spaceId",
        "type": "uint256",
        "indexed": true,
        "internalType": "uint256"
      },
      {
        "name": "cancelledBy",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "ReservationCompleted",
    "inputs": [
      {
        "name": "reservationId",
        "type": "uint256",
        "indexed": true,
        "internalType": "uint256"
      },
      {
        "name": "spaceId",
        "type": "uint256",
        "indexed": true,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "SpaceAvailabilityUpdated",
    "inputs": [
      {
        "name": "spaceId",
        "type": "uint256",
        "indexed": true,
        "internalType": "uint256"
      },
      {
        "name": "newStatus",
        "type": "uint8",
        "indexed": false,
        "internalType": "enum Parkly.SpaceStatus"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "SpaceReserved",
    "inputs": [
      {
        "name": "reservationId",
        "type": "uint256",
        "indexed": true,
        "internalType": "uint256"
      },
      {
        "name": "spaceId",
        "type": "uint256",
        "indexed": true,
        "internalType": "uint256"
      },
      {
        "name": "driver",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "startTime",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "endTime",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "function",
    "name": "addParkingSpace",
    "inputs": [
      {
        "name": "spaceNumber",
        "type": "string",
        "internalType": "string"
      },
      {
        "name": "location",
        "type": "string",
        "internalType": "string"
      },
      {
        "name": "hourlyRate",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "cancelReservation",
    "inputs": [
      {
        "name": "reservationId",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "completeReservation",
    "inputs": [
      {
        "name": "reservationId",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "getAllParkingSpaces",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "tuple[]",
        "internalType": "struct Parkly.ParkingSpace[]",
        "components": [
          {
            "name": "id",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "owner",
            "type": "address",
            "internalType": "address"
          },
          {
            "name": "spaceNumber",
            "type": "string",
            "internalType": "string"
          },
          {
            "name": "location",
            "type": "string",
            "internalType": "string"
          },
          {
            "name": "hourlyRate",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "status",
            "type": "uint8",
            "internalType": "enum Parkly.SpaceStatus"
          },
          {
            "name": "createdAt",
            "type": "uint256",
            "internalType": "uint256"
          }
        ]
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getMyReservations",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "tuple[]",
        "internalType": "struct Parkly.Reservation[]",
        "components": [
          {
            "name": "id",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "spaceId",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "driver",
            "type": "address",
            "internalType": "address"
          },
          {
            "name": "startTime",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "endTime",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "status",
            "type": "uint8",
            "internalType": "enum Parkly.ReservationStatus"
          }
        ]
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getMySpaces",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "tuple[]",
        "internalType": "struct Parkly.ParkingSpace[]",
        "components": [
          {
            "name": "id",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "owner",
            "type": "address",
            "internalType": "address"
          },
          {
            "name": "spaceNumber",
            "type": "string",
            "internalType": "string"
          },
          {
            "name": "location",
            "type": "string",
            "internalType": "string"
          },
          {
            "name": "hourlyRate",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "status",
            "type": "uint8",
            "internalType": "enum Parkly.SpaceStatus"
          },
          {
            "name": "createdAt",
            "type": "uint256",
            "internalType": "uint256"
          }
        ]
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getParkingSpace",
    "inputs": [
      {
        "name": "spaceId",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "tuple",
        "internalType": "struct Parkly.ParkingSpace",
        "components": [
          {
            "name": "id",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "owner",
            "type": "address",
            "internalType": "address"
          },
          {
            "name": "spaceNumber",
            "type": "string",
            "internalType": "string"
          },
          {
            "name": "location",
            "type": "string",
            "internalType": "string"
          },
          {
            "name": "hourlyRate",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "status",
            "type": "uint8",
            "internalType": "enum Parkly.SpaceStatus"
          },
          {
            "name": "createdAt",
            "type": "uint256",
            "internalType": "uint256"
          }
        ]
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getSpaceReservations",
    "inputs": [
      {
        "name": "spaceId",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "tuple[]",
        "internalType": "struct Parkly.Reservation[]",
        "components": [
          {
            "name": "id",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "spaceId",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "driver",
            "type": "address",
            "internalType": "address"
          },
          {
            "name": "startTime",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "endTime",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "status",
            "type": "uint8",
            "internalType": "enum Parkly.ReservationStatus"
          }
        ]
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getUserReservations",
    "inputs": [
      {
        "name": "user",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "tuple[]",
        "internalType": "struct Parkly.Reservation[]",
        "components": [
          {
            "name": "id",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "spaceId",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "driver",
            "type": "address",
            "internalType": "address"
          },
          {
            "name": "startTime",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "endTime",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "status",
            "type": "uint8",
            "internalType": "enum Parkly.ReservationStatus"
          }
        ]
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getUserSpaces",
    "inputs": [
      {
        "name": "user",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "tuple[]",
        "internalType": "struct Parkly.ParkingSpace[]",
        "components": [
          {
            "name": "id",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "owner",
            "type": "address",
            "internalType": "address"
          },
          {
            "name": "spaceNumber",
            "type": "string",
            "internalType": "string"
          },
          {
            "name": "location",
            "type": "string",
            "internalType": "string"
          },
          {
            "name": "hourlyRate",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "status",
            "type": "uint8",
            "internalType": "enum Parkly.SpaceStatus"
          },
          {
            "name": "createdAt",
            "type": "uint256",
            "internalType": "uint256"
          }
        ]
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "reservationCount",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "reservations",
    "inputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "id",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "spaceId",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "driver",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "startTime",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "endTime",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "status",
        "type": "uint8",
        "internalType": "enum Parkly.ReservationStatus"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "reserveSpace",
    "inputs": [
      {
        "name": "spaceId",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "startTime",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "endTime",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "spaceCount",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "spaces",
    "inputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "id",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "owner",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "spaceNumber",
        "type": "string",
        "internalType": "string"
      },
      {
        "name": "location",
        "type": "string",
        "internalType": "string"
      },
      {
        "name": "hourlyRate",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "status",
        "type": "uint8",
        "internalType": "enum Parkly.SpaceStatus"
      },
      {
        "name": "createdAt",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "updateParkingSpace",
    "inputs": [
      {
        "name": "spaceId",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "spaceNumber",
        "type": "string",
        "internalType": "string"
      },
      {
        "name": "location",
        "type": "string",
        "internalType": "string"
      },
      {
        "name": "hourlyRate",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "updateSpaceAvailability",
    "inputs": [
      {
        "name": "spaceId",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "newStatus",
        "type": "uint8",
        "internalType": "enum Parkly.SpaceStatus"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  }
] as const;

