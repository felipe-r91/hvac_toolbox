import { Modal } from "./Modal";

type Props = {
  open: boolean;
  title: string;
  description: string;
  onClose: () => void;
  onConfirm: () => void;
};

export function DeleteConfirmModal({
  open,
  title,
  description,
  onClose,
  onConfirm,
}: Props) {
  return (
    <Modal title={title} open={open} onClose={onClose}>
      <div className="space-y-4">
        <p className="text-sm text-slate-600">{description}</p>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-2xl bg-white px-4 py-3 text-sm font-medium text-slate-900 ring-1 ring-slate-300"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex-1 rounded-2xl bg-red-600 px-4 py-3 text-sm font-medium text-white"
          >
            Delete
          </button>
        </div>
      </div>
    </Modal>
  );
}