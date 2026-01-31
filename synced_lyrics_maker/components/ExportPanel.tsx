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
        <div className="w-full">
          <h2 className="card-title">Export</h2>
          <p className="card-subtitle">
              {canExport
                  ? `${stats.synced}/${stats.total} synchronisées`
                  : "Synchronise au moins une ligne"}
          </p>

          {/* Progress bar */}
          <div className="mt-3 h-1.5 w-full bg-slate-700/50 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary-darkest to-primary-dark transition-all duration-300"
              style={{ width: `${stats.percentage}%` }}
            />
          </div>
        </div>
      </div>

      <div className="card-body flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-3">
          <button
              className="btn-primary text-sm py-2.5"
              onClick={handleExportJSON}
              disabled={!canExport}
          >
              JSON
          </button>
          <button
              className="btn-ghost text-sm py-2.5"
              onClick={handleExportLRC}
              disabled={!canExport}
          >
              LRC
          </button>
        </div>

        {!canExport && (
          <p className="text-xs text-slate-500 text-center">
            Les boutons seront actifs après synchronisation
          </p>
        )}
      </div>
    </div>
  );
};

export default ExportPanel;