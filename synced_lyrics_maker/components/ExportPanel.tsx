import React from "react";
import {LyricLine} from "@/types";
import { useExport} from "@/hooks/useExport";


interface ExportPanelProps {
    lyrics: LyricLine[];
    exporter: ReturnType<typeof useExport>;
}

const ExportPanel: React.FC<ExportPanelProps> = ({lyrics, exporter}) => {
    const {quickExport, getExportStats } = exporter;
    const stats = getExportStats(lyrics);
    const canExport = stats.synced > 0;

    const handleExportJSON = () => {
        try{
            quickExport(lyrics, 'json');
        } catch (error) {
            console.error(error);
        }
    };

    const handleExportLRC = () => {
        try{
            quickExport(lyrics, 'lrc');
        } catch (error) {
            console.error(error);
        }
    };

    return (
    <div className="card">
      <div className="card-header">
        <div>
          <h2 className="card-title">Export</h2>
            <p className="card-subtitle">
                {canExport
                    ? `${stats.synced}/${stats.total} lignes synchronisées (${stats.percentage}%)`
                    : "Synchronise au moins une ligne avant d'exporter"}
            </p>
        </div>
      </div>

      <div className="card-body flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <button
              className="btn-primary"
              onClick={handleExportJSON}
              disabled={!canExport}
          >
              Export JSON
          </button>
          <button
              className="btn-ghost"
              onClick={handleExportLRC}
              disabled={!canExport}
          >
              Export LRC
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportPanel;