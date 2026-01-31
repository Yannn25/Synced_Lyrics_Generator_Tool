import React from "react";

const ShortcutsHint: React.FC = () => {
  return (
    <div className="card">
      <div className="card-header py-4">
        <div>
          <h2 className="card-title text-base">Raccourcis</h2>
          <p className="card-subtitle text-xs">Astuces pour aller plus vite</p>
        </div>
      </div>

      <div className="card-body py-4">
        <ul className="space-y-2.5 text-sm">
          <li className="flex items-center justify-between gap-4 p-2.5 rounded-lg bg-slate-800/40">
            <span className="text-slate-300 text-xs">Synchroniser</span>
            <kbd className="kbd text-[10px]">Entrée</kbd>
          </li>
          <li className="flex items-center justify-between gap-4 p-2.5 rounded-lg bg-slate-800/40">
            <span className="text-slate-300 text-xs">Sélectionner</span>
            <kbd className="kbd text-[10px]">Clic</kbd>
          </li>
          <li className="flex items-center justify-between gap-4 p-2.5 rounded-lg bg-slate-800/40">
            <span className="text-slate-300 text-xs">Éditer texte</span>
            <kbd className="kbd text-[10px]">Double-clic</kbd>
          </li>
          <li className="flex items-center justify-between gap-4 p-2.5 rounded-lg bg-slate-800/40">
            <span className="text-slate-300 text-xs">Éditer temps</span>
            <kbd className="kbd text-[10px]">Clic sur temps</kbd>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default ShortcutsHint;