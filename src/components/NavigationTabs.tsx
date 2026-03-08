import { LuBoxes, LuPlus, LuSettings } from "react-icons/lu";
import { RiShipLine } from "react-icons/ri";
import { BiWorld } from "react-icons/bi";
import { Link, useLocation } from "react-router-dom";

const tabs = [
  { label: "Ships", to: "/vessels" , icon: <><RiShipLine size={28} /></>},
  { label: "Machines", to: "/machines" , icon: <><LuBoxes size={28} /></>},
  { label: "Add", to: "/add" , icon: <><LuPlus size={28} /></>},
  { label: "Sync Data", to: "/sync" , icon: <><BiWorld size={28} /></>},
  { label: "Settings", to: "/settings" , icon: <><LuSettings size={28} /></>},
];

type Props = {
  onOpenAdd: () => void;
};

export function NavigationTabs({ onOpenAdd }: Props) {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white p-2 pb-[env(safe-area-inset-bottom)] shadow-lg ring-1 ring-slate-200">
      <div className="grid grid-cols-5 gap-2 mb-6">
        {tabs.map((tab) => {
          const isAdd = tab.label === "Add";
          const active = !isAdd && location.pathname.startsWith(tab.to);

          if (isAdd) {
            return (
              <button
                key={tab.label}
                type="button"
                onClick={onOpenAdd}
                className="-mt-8 flex h-14 w-14 items-center justify-center justify-self-center rounded-full bg-slate-700 text-lg font-semibold text-white shadow-lg ring-4 ring-slate-100 transition active:scale-95"
              >
                {tab.icon}
              </button>
            );
          }

          return (
            <Link
              key={tab.label}
              to={tab.to}
              className={`rounded-2xl px-3 py-3 text-center text-sm font-medium transition flex flex-col items-center gap-1 ${
                active
                  ? "bg-slate-500 text-white shadow-sm"
                  : "bg-white text-slate-700"
              }`}
            >
              <div>
                {tab.icon}
              </div>
              
            </Link>
          );
        })}
      </div>
    </nav>
  );
}