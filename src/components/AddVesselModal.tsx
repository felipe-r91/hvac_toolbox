import { VesselForm } from "./VesselForm";
import { Modal } from "./Modal";
import { type NewVesselPayload } from "../types/maintenance";

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: NewVesselPayload) => void;
};

export function AddVesselModal({ open, onClose, onSubmit }: Props) {
  return (
    <Modal title="Add ship" open={open} onClose={onClose}>
      <VesselForm
        onSubmit={(payload) => {
          onSubmit(payload);
          onClose();
        }}
      />
    </Modal>
  );
}