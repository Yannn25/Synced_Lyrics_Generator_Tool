import React from "react";

const ExportPanel: React.FC = () => {
  return (
    <div className="card">
      <div className="card-header">
        <div>
          <h2 className="card-title">Export</h2>
          <p className="card-subtitle">Télécharge tes lyrics synchronisées.</p>
        </div>
      </div>

      <div className="card-body flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <button className="btn-primary">Export JSON</button>
          <button className="btn-ghost">Export LRC</button>
        </div>

      </div>
    </div>
  );
};

export default ExportPanel;