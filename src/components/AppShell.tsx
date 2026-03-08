import { type ReactNode } from "react";
import { AddMachineModal } from "./AddMachineModal";
import { AddMenuModal } from "./AddMenuModal";
import { AddVesselModal } from "./AddVesselModal";
import { NavigationTabs } from "./NavigationTabs";
import {
  type NewMachinePayload,
  type NewVesselPayload,
  type Vessel,
  type MaintenanceTask,
} from "../types/maintenance";

type Props = {
  children: ReactNode;
  vessels: Vessel[];
  addMenuOpen: boolean;
  addVesselOpen: boolean;
  addMachineOpen: boolean;
  onOpenAddMenu: () => void;
  onCloseAddMenu: () => void;
  onOpenAddVessel: () => void;
  onOpenAddMachine: () => void;
  onCloseAddVessel: () => void;
  onCloseAddMachine: () => void;
  onAddVessel: (payload: NewVesselPayload) => void;
  onAddMachine: (payload: NewMachinePayload & { tasks: MaintenanceTask[] }) => void;
};

export function AppShell({
  children,
  vessels,
  addMenuOpen,
  addVesselOpen,
  addMachineOpen,
  onOpenAddMenu,
  onCloseAddMenu,
  onOpenAddVessel,
  onOpenAddMachine,
  onCloseAddVessel,
  onCloseAddMachine,
  onAddVessel,
  onAddMachine,
}: Props) {
  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <div className="mx-auto max-w-6xl space-y-4 px-4 py-4 pb-24 sm:px-6 lg:px-8">
    {children}
  </div>
      <NavigationTabs onOpenAdd={onOpenAddMenu} />

      <AddMenuModal
        open={addMenuOpen}
        onClose={onCloseAddMenu}
        onChooseShips={onOpenAddVessel}
        onChooseMachines={onOpenAddMachine}
      />

      <AddVesselModal open={addVesselOpen} onClose={onCloseAddVessel} onSubmit={onAddVessel} />
      <AddMachineModal open={addMachineOpen} onClose={onCloseAddMachine} vessels={vessels} onSubmit={onAddMachine} />
    </main>
  );
}