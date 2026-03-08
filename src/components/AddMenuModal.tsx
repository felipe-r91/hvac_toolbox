import { RiShipLine } from "react-icons/ri";
import { Modal } from "./Modal";
import { LuBoxes } from "react-icons/lu";

type Props = {
  open: boolean;
  onClose: () => void;
  onChooseShips: () => void;
  onChooseMachines: () => void;
};

export function AddMenuModal({ open, onClose, onChooseShips, onChooseMachines }: Props) {
  return (
    <Modal title="Add" open={open} onClose={onClose}>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={onChooseShips}
          className="rounded-3xl bg-slate-100 px-4 py-6 text-left ring-1 ring-slate-200"
        >
          <div className="flex gap-6">
            <RiShipLine size={28} />
          <div className="mt-1 text-sm text-slate-500">Create a new vessel in the fleet.</div>
          </div>
          
        </button>

        <button
          type="button"
          onClick={onChooseMachines}
          className="rounded-3xl bg-slate-100 px-4 py-6 text-left ring-1 ring-slate-200"
        >
          <div className="flex gap-6">
            <LuBoxes size={28} />
          <div className="mt-1 text-sm text-slate-500">Create a new machine.</div>
          </div>
        </button>
      </div>
    </Modal>
  );
}