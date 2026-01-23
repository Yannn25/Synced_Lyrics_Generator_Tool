import React from "react";

const ShortcutsHint: React.FC = () => {
  return (
    <div className="card">
      <div className="card-header">
        <div>
          <h2 className="card-title">Raccourcis clavier</h2>
          <p className="card-subtitle">Petites astuces pour aller plus vite.</p>
        </div>
      </div>

      <div className="card-body">
        <ul className="space-y-3 text-sm">
          <li className="flex items-center justify-between gap-4 p-3 rounded-lg bg-slate-800/30 border border-white/5">
            <span className="text-slate-300">Synchroniser la ligne sélectionnée</span>
            <span className="kbd">ESPACE</span>
          </li>
          <li className="flex items-center justify-between gap-4 p-3 rounded-lg bg-slate-800/30 border border-white/5">
            <span className="text-slate-300"> Sélectionner une ligne</span>
            <span className="text-primary-dark font-semibold">Clic</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default ShortcutsHint;