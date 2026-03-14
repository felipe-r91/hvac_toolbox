import { MachineForm } from "./MachineForm";
import { Modal } from "./Modal";
import {type MaintenanceTask, type NewMachinePayload, type Vessel , } from "../types/maintenance";

type Props = {
  open: boolean;
  onClose: () => void;
  vessels: Vessel[];
  onSubmit: (payload: NewMachinePayload & { tasks: MaintenanceTask[] }) => void;
};

export function AddMachineModal({ open, onClose, vessels, onSubmit }: Props) {
  return (
    <Modal title="Add machine" open={open} onClose={onClose}>
      <MachineForm
        vessels={vessels}
        onSubmit={(payload) => {
          onSubmit(payload);
          onClose();
          console.log(payload)
        }}
      />
    </Modal>
  );
}