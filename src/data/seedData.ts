import { type FleetData } from "../types/maintenance";

export const seedFleet: FleetData = {
  reports: [],
  vessels: [
    {
      id: "vessel-001",
      name: "MSC Aurora",
      imoNumber: "9876543",
      description: "Main service vessel",
      machines: [
        {
          machine: {
            id: "machine-001",
            location: "Cargo Machinery Room",
            tag: "CH-01",
            model: "VSM89",
            serialNumber: "SN-TO-BE-FILLED",
            type: "Chiller",
          },
          tasks: [
            {
              id: "daily-001",
              category: "Daily",
              task: "Check oil level in oil receiver",
              tool: "Visual",
              checked: false,
              status: "pending",
              notes: "",
              measuredValue: "",
            },
            {
              id: "daily-002",
              category: "Daily",
              task: "Verify refrigerant level in condenser (≥150 mm)",
              tool: "Visual",
              checked: false,
              status: "pending",
              notes: "",
              measuredValue: "",
              unit: "mm",
            },
            {
              id: "weekly-001",
              category: "Weekly",
              task: "Test emergency stop and interlocks",
              tool: "Op",
              checked: false,
              status: "pending",
              notes: "",
              measuredValue: "",
            },
            {
              id: "annual-001",
              category: "Annual",
              task: "Replace oil filter",
              tool: "Mechanic Tools",
              checked: false,
              status: "pending",
              notes: "",
              measuredValue: "",
            },
          ],
        },
        {
          machine: {
            id: "machine-002",
            location: "Provision Room",
            tag: "REF-02",
            model: "SPARE-MODEL",
            serialNumber: "SN-SECOND-MACHINE",
            type: "Provision Plant",
          },
          tasks: [
            {
              id: "daily-101",
              category: "Daily",
              task: "Check compressor running condition",
              tool: "Visual",
              checked: false,
              status: "pending",
              notes: "",
              measuredValue: "",
            },
          ],
        },
      ],
    },
  ],
};