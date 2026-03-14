import { type MachinePlan, type MaintenanceTask } from "../types/maintenance";

const task = (id: string, category: string, taskName: string, tool = "") => ({
  id,
  category: category as MachinePlan["tasks"][number]["category"],
  task: taskName,
  tool,
  checked: false,
  status: "pending" as const,
  notes: "",
  measuredValue: "",
});

export const maintenancePlanLibrary: Record<string, Omit<MachinePlan, "machine">> = {
  VSM89: {
    tasks: [
      task("vsm89-d-000", "Daily", "Check run hours", "Visual"),
      task("vsm89-d-001", "Daily", "Check oil level in oil receiver", "Visual"),
      task("vsm89-d-002", "Daily", "Verify refrigerant level in condenser (≥150 mm)", "Visual"),
      task("vsm89-d-003", "Daily", "Check evaporating & condensing pressures", "Op, Visual"),
      task("vsm89-d-004", "Daily", "Confirm oil pressure difference ≥1.5 bar", "Visual"),
      task("vsm89-d-005", "Daily", "Ensure chilled water & cooling water pumps running", "Visual"),
      task("vsm89-d-006", "Daily", "Inspect all valves in operational positions", "Visual"),
      task("vsm89-d-007", "Daily", "Listen for abnormal noises or vibrations", "Visual"),
      task("vsm89-d-008", "Daily", "Check for alarms on OP and monitors", "Visual"),
      task("vsm89-d-009", "Daily", "Inspect shaft seal (≤300 ml/24h leakage)", "Visual"),
      task("vsm89-d-010", "Daily", "Ensure oil heater is functioning (oil ≥35°C)", "Visual"),
      task("vsm89-w-001", "Weekly", "Run unit briefly during long idle periods", "Visual"),
      task("vsm89-w-002", "Weekly", "Test emergency stop and interlocks", "Op"),
      task("vsm89-w-003", "Weekly", "Check expansion valve stability (no hunting)", "Visual"),
      task("vsm89-m-001", "Monthly", "Inspect oil filter differential pressure LEDs", "Visual"),
      task("vsm89-m-002", "Monthly", "Inspect drier and air supply filters", "Visual"),
      task("vsm89-m-003", "Monthly", "Test gas detector alarms", "Visual"),
      task("vsm89-m-004", "Monthly", "Check solenoid valve operation", "Multimeter"),
      task("vsm89-m-005", "Monthly", "Check all temperature sensors against OP readings", "Visual, External Temp Sensor"),
      task("vsm89-q-001", "Quarterly", "Inspect external oil pump for leaks/noise/vibration", "Visual"),
      task("vsm89-q-002", "Quarterly", "Inspect hoses, joints, strainers, valves", "Visual"),
      task("vsm89-q-003", "Quarterly", "Inspect electrical cabinet components", "Visual"),
      task("vsm89-q-004", "Quarterly", "Calibrate capacity transmitter", "Manual"),
      task("vsm89-sa-001", "Semi-Annual", "Test mechanical pressostats (HP/LP/oil diff)", "Visual, Multimeter"),
      task("vsm89-sa-002", "Semi-Annual", "Test thermostats (discharge gas & oil heater)", "Visual, Multimeter"),
      task("vsm89-sa-003", "Semi-Annual", "Oil analysis", "Sample Kit"),
      task("vsm89-sa-004", "Semi-Annual", "Refrigerant analysis", "Sample Kit"),
      task("vsm89-sa-005", "Semi-Annual", "Clean condenser/evaporator tubes (if applicable)", "Tube Cleaner Machine"),
      task("vsm89-a-001", "Annual", "Replace oil filter", "Mechanic Tools"),
      task("vsm89-a-002", "Annual", "Replace drier filter", "Mechanic Tools"),
      task("vsm89-a-003", "Annual", "Replace air supply filter", "Mechanic Tools"),
      task("vsm89-a-004", "Annual", "Grease motor bearings (40g Klüberplex)", "Grease, Manual"),
      task("vsm89-a-005", "Annual", "Verify shaft seal leakage limit", "Visual"),
      task("vsm89-a-006", "Annual", "Full expansion valve functional inspection", "Mechanic Tools"),
      task("vsm89-a-007", "Annual", "Inspect all service/check/safety valves", "Mechanic Tools"),
      task("vsm89-a-008", "Annual", "Revalidate SE2200 cutout limits & delays", "Visual, OP"),
      task("vsm89-a-009", "Annual", "Recalibrate all sensors (PT100, pressure, oil)", "OP, External Temp Sensor"),
      task("vsm89-a-010", "Annual", "Inspect sequence control (multi-chiller systems)", "OP"),
      task("vsm89-2y-001", "2-Year / Shipyard", "Replace hoses, gaskets, seals (PM2/PM3 rules)", "Mechanic Tools"),
      task("vsm89-2y-002", "2-Year / Shipyard", "Replace solenoid coils, blind covers, hoses", "Mechanic Tools"),
      task("vsm89-2y-003", "2-Year / Shipyard", "Full compressor internal inspection if needed", "Workshop Overhaul"),
      task("vsm89-2y-004", "2-Year / Shipyard", "Revalidate CCU logic & safety systems", "OP, Programming"),
      task("vsm89-si-001", "Shutdown/Idle", "Close SV01 & SV02", "Manual"),
      task("vsm89-si-002", "Shutdown/Idle", "Move refrigerant to safe parts of system", "Manual"),
      task("vsm89-si-003", "Shutdown/Idle", "Weekly startup to protect bearings", "Manual"),
      task("vsm89-f-001", "Fault-finding", "High condenser approach", "Digital Manifold"),
      task("vsm89-f-002", "Fault-finding", "High evaporator approach", "Digital Manifold"),
    ],
  },
  VSM2817: {
    tasks: [
      task("vsm2817-d-000", "Daily", "Check run hours", "Visual"),
      task("vsm2817-d-001", "Daily", "Check oil pressure difference <1 bar", "Visual"),
      task("vsm2817-d-002", "Daily", "Check oil level in sight glasses", "Visual"),
      task("vsm2817-d-003", "Daily", "Verify refrigerant level >=150 mm in condenser", "Visual"),
      task("vsm2817-d-004", "Daily", "Inspect abnormal sounds/vibrations", "Visual"),
      task("vsm2817-d-005", "Daily", "Check PI01/PI02 pressures vs OP", "Visual"),
      task("vsm2817-d-006", "Daily", "Ensure chilled and cooling water pumps running", "Visual"),
      task("vsm2817-d-007", "Daily", "Check shaft seal leakage <=375 ml/24h", "Visual"),
      task("vsm2817-w-001", "Weekly", "Run unit briefly during long idle period", "Visual"),
      task("vsm2817-w-002", "Weekly", "Test emergency stop and interlocks", "Op"),
      task("vsm2817-w-003", "Weekly", "Inspect expansion valve for hunting", "Visual"),
      task("vsm2817-m-001", "Monthly", "Inspect oil filter LED indicators", "Visual"),
      task("vsm2817-m-002", "Monthly", "Inspect drier and air supply filters", "Visual"),
      task("vsm2817-m-003", "Monthly", "Test gas detector alarms", "Visual"),
      task("vsm2817-m-004", "Monthly", "Check solenoid valves", "Multimeter"),
      task("vsm2817-q-001", "Quarterly", "Inspect external oil pump and hoses", "Visual"),
      task("vsm2817-q-002", "Quarterly", "Inspect electrical cabinet", "Visual"),
      task("vsm2817-sa-001", "Semi-Annual", "Test mechanical pressostats HP/LP", "Multimeter"),
      task("vsm2817-sa-002", "Semi-Annual", "Oil analysis", "Sample Kit"),
      task("vsm2817-sa-003", "Semi-Annual", "Refrigerant analysis", "Sample Kit"),
      task("vsm2817-sa-004", "Semi-Annual", "Clean condenser/evaporator tubes (if applicable)", "Tube Cleaner Machine"),
      task("vsm2817-sa-005", "Semi-Annual", "Test thermostats", "External Thermostat"),
      task("vsm2817-a-001", "Annual", "Replace oil filter", "Mechanic Tools"),
      task("vsm2817-a-002", "Annual", "Replace drier filter", "Mechanic Tools"),
      task("vsm2817-a-003", "Annual", "Grease motor bearings", "Grease, Manual"),
      task("vsm2817-a-004", "Annual", "Recalibrate sensors", "External Sensor, OP"),
      task("vsm2817-2y-001", "2-Year / Shipyard", "Replace hoses, seals (PM2/PM3 rules)", "Mechanic Tools"),
      task("vsm2817-2y-002", "2-Year / Shipyard", "Inspect compressor internally", "Workshop Overhaul"),
      task("vsm2817-st-001", "Startup", "Verify electrical connections and oil heater", "Multimeter"),
      task("vsm2817-st-002", "Startup", "Check refrigerant charge and dry unit", "Digital Manifold"),
      task("vsm2817-st-003", "Startup", "Verify valve positions", "Visual"),
      task("vsm2817-st-004", "Startup", "Check motor rotation direction", "Visual"),
      task("vsm2817-op-001", "Operational", "Check expansion valve stability", "Visual"),
      task("vsm2817-op-002", "Operational", "Check oil return system (ORV bubbles)", "Visual"),
      task("vsm2817-ol-001", "Off-limit Operation", "Procedure for low cooling water flow", "OP"),
      task("vsm2817-ol-002", "Off-limit Operation", "Procedure for high cooling water temp", "OP"),
      task("vsm2817-f-001", "Fault-finding", "High condensing pressure diagnostic", "Digital Manifold"),
      task("vsm2817-f-002", "Fault-finding", "Low evaporating pressure diagnostic", "Digital Manifold"),
      task("vsm2817-f-003", "Fault-finding", "High condenser approach", "Digital Manifold"),
      task("vsm2817-f-004", "Fault-finding", "High evaporator approach", "Digital Manifold"),
    ],
  },
  VSM151: {
    tasks: [
      task("vsm151-d-000", "Daily", "Check run hours", "Visual"),
      task("vsm151-d-001", "Daily", "Check oil level visible in oil receiver sight glasses (≥1 of 2)", "Visual"),
      task("vsm151-d-002", "Daily", "Verify oil heater operating; oil temp ≥35°C before start", "Visual"),
      task("vsm151-d-003", "Daily", "Read condensing/evaporating pressures (PI01/PI02) and compare to OP", "Visual, External Temp Sensor"),
      task("vsm151-d-004", "Daily", "Confirm oil pressure criteria: (Pdis - Poil) < 2.0 bar and Poil ≥ Pevap + 0.5 bar", "Visual, OP"),
      task("vsm151-d-005", "Daily", "Check brine pump running and no brine pump alarm when in AutoStart", "Visual"),
      task("vsm151-d-006", "Daily", "Verify condenser and evaporator flows (no flow alarms)", "Visual"),
      task("vsm151-d-007", "Daily", "Inspect for abnormal noise/vibration; check pipes/valves for knocking", "Visual"),
      task("vsm151-d-008", "Daily", "Check ORV sight glass for bubbles (oil return functioning)", "Visual"),
      task("vsm151-d-009", "Daily", "Monitor discharge gas temperature and superheat on OP", "Visual, Digital Manifold"),
      task("vsm151-w-001", "Weekly", "Test Emergency Stop and Local Stop circuit; verify alarm and restart sequence", "OP, Multimeter"),
      task("vsm151-w-002", "Weekly", "Exercise Increase/Decrease capacity pushbuttons in Manual mode (no load drift)", "OP"),
      task("vsm151-w-003", "Weekly", "Inspect economizer on/off function (cuts in >50%, out <40%)", "OP"),
      task("vsm151-m-001", "Monthly", "Inspect oil filter differential pressure indicator; green OK, yellow=service", "Visual, OP"),
      task("vsm151-m-002", "Monthly", "Test high discharge pressostat and low evaporating pressostat trip chain (via simulated signals)", "Multimeter"),
      task("vsm151-m-003", "Monthly", "Function-test brine low-pressure input; verify trip conditions in OP", "Visual, OP"),
      task("vsm151-m-004", "Monthly", "Test gas detectors (LAN63 PKT, GR/GS24) alarms and logging", "Visual"),
      task("vsm151-m-005", "Monthly", "Check air supply filter condition (replace/clean if clogged)", "Visual"),
      task("vsm151-q-001", "Quarterly", "Inspect electrical enclosure: fuses/MCBs/relays/terminal tightness, clean dust", "Visual"),
      task("vsm151-q-002", "Quarterly", "Verify calibration of capacity transmitter (XJF screw) per GB90178B", "Visual"),
      task("vsm151-q-003", "Quarterly", "Inspect condenser/evaporator water/brine strainers; clean", "Visual"),
      task("vsm151-sa-001", "Semi-Annual", "Prove mechanical monitors: HP/LP pressostats; confirm electronic trips earlier", "Multimeter"),
      task("vsm151-sa-002", "Semi-Annual", "Prove thermostats TS01 (discharge) and TS02 (oil separator)", "External Temp Sensor"),
      task("vsm151-sa-003", "Semi-Annual", "Inspect all solenoid valves (capacity, economizer) for actuation/leakage", "Leak Detector, Multimeter"),
      task("vsm151-a-001", "Annual", "Replace oil filter element; reset differential switch and verify no leak", "Mechanic Tools"),
      task("vsm151-a-002", "Annual", "Replace drier filter; record refrigerant dehydration event", "Mechanic Tools, Vacuum Pump"),
      task("vsm151-a-003", "Annual", "Regrease motor bearings (Klüberplex BEM 41-132, 35 g each bearing)", "Grease, Manual"),
      task("vsm151-a-004", "Annual", "Recalibrate PT100 sensors and pressure transmitters; verify OP readings", "External Temp Sensor"),
      task("vsm151-a-005", "Annual", "Review SE2200 cut-out limits/delays match GB00596A defaults or ship settings", "OP"),
      task("vsm151-2y-001", "2-Year / Shipyard", "Replace hoses, gaskets, seals, O-rings if PM2/PM3 criteria met; replace all if ≥ threshold", "Mechanic Tools"),
      task("vsm151-2y-002", "2-Year / Shipyard", "Inspect compressor internals as condition-based; check slide valve and bearings", "Workshop Overhaul"),
      task("vsm151-st-001", "Startup", "Verify installation per GB00512; check wiring against drawings; power up control cabinet", "Multimeter"),
      task("vsm151-st-002", "Startup", "Dry plant (GB00462), then charge refrigerant per GB00531; remove nitrogen shipping charge", "Vacuum Pump, Refrigerant Hoses"),
      task("vsm151-st-003", "Startup", "Check motor rotation (shaft coupling dismounted); correct if not clockwise viewed from shaft end", "Visual"),
      task("vsm151-st-004", "Startup", "Set valve positions and verify safety chain before start", "Visual"),
      task("vsm151-op-001", "Operational", "Check chilled/brine temp control stability in OP", "Visual, OP"),
      task("vsm151-op-002", "Operational", "Monitor condenser/evaporator approach temperatures", "Visual, OP, Ultrasonic Flow Meter"),
      task("vsm151-op-003", "Operational", "Verify cooling-water flow and off-limit reaction logic", "Visual, OP, Ultrasonic Flow Meter"),
      task("vsm151-op-004", "Operational", "Confirm superheat/discharge temperature trends remain within limits", "OP, External Temp Sensor"),
      task("vsm151-ol-001", "Off-limit Operation", "Apply low cooling-water flow procedure", "OP"),
      task("vsm151-ol-002", "Off-limit Operation", "Apply high cooling-water temperature procedure", "OP"),
      task("vsm151-ol-003", "Off-limit Operation", "Apply brine low-level / low-flow protective procedure", "Visual"),
      task("vsm151-ol-004", "Off-limit Operation", "Apply high condensing pressure procedure", "Visual"),
      task("vsm151-br-001", "Brine System", "Check expansion tank level and low-level switch operation; inspect level measuring device", "Visual, Manual"),
      task("vsm151-br-002", "Brine System", "Verify corrosion inhibitor concentration and MSDS; sample brine and log", "Multimeter"),
      task("vsm151-br-003", "Brine System", "Operate 3-way regulating valves (all decks/rooms) and actuators; check respiration/positioners", "Multimeter"),
      task("vsm151-br-004", "Brine System", "Function-test overflow valve SVI and air filter regulator type 78; verify controller power supply", "Visual"),
      task("vsm151-br-005", "Brine System", "Inspect main/defrost (hot) brine pumps: vibration, seals; compare to characteristic curves", "Visual"),
      task("vsm151-cf-001", "Cargo Fans/Dampers", "Cycle fresh-air dampers and SM24 actuators; verify end-stops and tight shutoff", "Visual, OP"),
      task("vsm151-cf-002", "Cargo Fans/Dampers", "Inspect ACP/ACN fans and motors; bearings, insulation, amperage vs nameplate", "Visual, OP"),
      task("vsm151-pn-001", "Pneumatic", "Inspect solenoid valve blocks in BC/LC cubicles; coil tests; replace clogged silencers", "Visual, Multimeter"),
      task("vsm151-pn-002", "Pneumatic", "Leak test pneumatic lines; verify air pressure/filtration/drying per spec", "Mechanic Tools"),
      task("vsm151-sn-001", "Sensors", "Check PT100 placement/greasing in pockets; validate readings vs standards", "Mechanic Tools"),
      task("vsm151-sn-002", "Sensors", "Verify differential pressure transmitters 3051C zero/span; impulse lines clear", "Mechanic Tools, Multimeter"),
      task("vsm151-sn-003", "Sensors", "Inspect pressure gauges (suction/discharge) and WEKA level indicator; replace if damaged", "Multimeter"),
      task("vsm151-f-001", "Fault-finding", "Prepare systematic fault tracing checklist (high condensing P, low evaporating P, high discharge T, etc.)", "Visual"),
    ],
  },

  VSD: {
    tasks: [
      
        task("vsd-001", "VSD Maintenance", "Clean/replace air filters", "Mechanic Tools"),
        task("vsd-002", "VSD Maintenance", "Inspect/replace cooling fans", "Mechanic Tools"),
        task("vsd-003", "VSD Maintenance", "Clean heatsinks", "Mechanic Tools"),
        task("vsd-004", "VSD Maintenance", "Inspect capacitors (reform/replace)", "Visual, Multimeter"),
        task("vsd-005", "VSD Maintenance", "Check IGBT modules & grounding", "Multimeter"),
        task("vsd-006", "VSD Maintenance", "Thermography", "Multimeter"),
        task("vsd-007", "VSD Maintenance", "Check Parameters", "Multimeter"),
        task("vsd-008", "VSD Maintenance", "Check Circuit Breakers", "Multimeter"),
      
    ]
  },

  EM: {
    tasks: [
      
        task("em-001", "EM Starter Maintenance", "Clean/replace air filters", "Mechanic Tools"),
        task("em-002", "EM Starter Maintenance", "Inspect/replace cooling fans", "Mechanic Tools"),
        task("em-003", "EM Starter Maintenance", "Inspect Power Wiring", "Mechanic Tools"),
        task("em-004", "EM Starter Maintenance", "Thermography", "Visual, Multimeter"),
        task("em-005", "EM Starter Maintenance", "Inspect Timer (if applicable)", "Visual, Multimeter"),
        task("em-006", "EM Starter Maintenance", "Check grounding", "Multimeter"),
        task("em-007", "EM Starter Maintenance", "Check Circuit Breakers", "Multimeter"),
      
    ]
  },

  SSS: {
    tasks: [
      
        task("sss-001", "SSS Maintenance", "Clean/replace air filters", "Mechanic Tools"),
        task("sss-002", "SSS Maintenance", "Inspect/replace cooling fans", "Mechanic Tools"),
        task("sss-003", "SSS Maintenance", "Clean heatsinks", "Mechanic Tools"),
        task("sss-004", "SSS Maintenance", "Check Parameters", "Visual, Multimeter"),
        task("sss-005", "SSS Maintenance", "Check grounding", "Multimeter"),
        task("sss-006", "SSS Maintenance", "Thermography", "Multimeter"),
        task("sss-007", "SSS Maintenance", "Check Power Wiring", "Multimeter"),
        task("sss-008", "SSS Maintenance", "Check Circuit Breakers", "Multimeter"),
      
    ]
  }
};

export const availableStartersModels = ["VSD", "EM", "SSS"] as const;

export const availableMachineModels = Object.keys(maintenancePlanLibrary).filter(
  (name) => !availableStartersModels.includes(name as (typeof availableStartersModels)[number])
);


//export const availableMachineModels = Object.keys(maintenancePlanLibrary).filter((name) => !name.match("VSD"));

export function createTasksFromModel(model: string, starter: string): MaintenanceTask[] {
  const machinePlan = maintenancePlanLibrary[model];
  const starterPlan = maintenancePlanLibrary[starter];

  if (!machinePlan) return [];
  if (!starterPlan) return [];

  return [...machinePlan.tasks, ...starterPlan.tasks].map((item) => ({
    ...item,
    checked: false,
    status: "pending",
    notes: "",
    measuredValue: "",
    completedAt: undefined,
  }));
}