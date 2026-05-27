import { RiAlarmWarningLine } from "react-icons/ri";
import { Modal } from "./Modal";
import { LiaListAltSolid } from "react-icons/lia";
import { MdContentPasteSearch, MdOutlineToday } from "react-icons/md";

type Props = {
  open: boolean;
  onClose: () => void;
  onChooseCfr: () => void;
  onChooseMachineMaintenance: () => void;
  onChooseServiceReport: () => void;
  onChooseDaily: () => void;
};

export function ChooseMaintenanceTypeModal({ open, onClose, onChooseCfr, onChooseMachineMaintenance, onChooseServiceReport, onChooseDaily }: Props) {
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
          onClick={onChooseMachineMaintenance}
          className="rounded-3xl bg-slate-100 px-4 py-6 text-left ring-1 ring-slate-200"
        >
          <div className="flex gap-6">
            <LiaListAltSolid size={28} />
          <div className="mt-1 text-sm text-slate-500">Machine Maintenance.</div>
          </div>
          
        </button>

        <button
          type="button"
          onClick={onChooseServiceReport}
          className="rounded-3xl bg-slate-100 px-4 py-6 text-left ring-1 ring-slate-200"
        >
          <div className="flex gap-6">
            <RiAlarmWarningLine size={28} />
          <div className="mt-1 text-sm text-slate-500">Service Report.</div>
          </div>
        </button>

        <button
          type="button"
          onClick={onChooseDaily}
          className="rounded-3xl bg-slate-100 px-4 py-6 text-left ring-1 ring-slate-200"
        >
          <div className="flex gap-6">
            <MdOutlineToday size={28} />
          <div className="mt-1 text-sm text-slate-500">Daily Report.</div>
          </div>
        </button>
      </div>
    </Modal>
  );
}
