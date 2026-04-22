import { RiAlarmWarningLine } from "react-icons/ri";
import { Modal } from "./Modal";
import { LiaListAltSolid } from "react-icons/lia";
import { MdContentPasteSearch } from "react-icons/md";

type Props = {
  open: boolean;
  onClose: () => void;
  onChooseCfr: () => void;
  onChoosePreventive: () => void;
  onChooseCorrective: () => void;
};

export function ChooseMaintenanceTypeModal({ open, onClose, onChooseCfr, onChoosePreventive, onChooseCorrective }: Props) {
  return (
    <Modal title="Select type" open={open} onClose={onClose}>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={onChooseCfr}
          className="rounded-3xl bg-slate-100 px-4 py-6 text-left ring-1 ring-slate-200"
        >
          <div className="flex gap-6">
            <MdContentPasteSearch size={28} />
          <div className="mt-1 text-sm text-slate-500">Condition Found Report.</div>
          </div>
          
        </button>
        <button
          type="button"
          onClick={onChoosePreventive}
          className="rounded-3xl bg-slate-100 px-4 py-6 text-left ring-1 ring-slate-200"
        >
          <div className="flex gap-6">
            <LiaListAltSolid size={28} />
          <div className="mt-1 text-sm text-slate-500">Machine Maintenance.</div>
          </div>
          
        </button>

        <button
          type="button"
          onClick={onChooseCorrective}
          className="rounded-3xl bg-slate-100 px-4 py-6 text-left ring-1 ring-slate-200"
        >
          <div className="flex gap-6">
            <RiAlarmWarningLine size={28} />
          <div className="mt-1 text-sm text-slate-500">Corrective Report.</div>
          </div>
        </button>
      </div>
    </Modal>
  );
}