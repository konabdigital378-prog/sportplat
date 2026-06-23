import api from '../api/axios';
import toast from 'react-hot-toast';

export default function ExportButtons({ tournamentId, tournamentName }) {
  const handleExportCSV = async () => {
    try {
      const res = await api.get(`/export/tournament/${tournamentId}/csv`, { responseType: 'blob' });
      const blob = new Blob([res.data], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${tournamentName?.replace(/[^a-z0-9]/gi, '_') || 'tournament'}_export.csv`;
      link.click();
      toast.success('Export CSV téléchargé');
    } catch (err) {
      toast.error('Erreur export');
    }
  };

  const handleExportJSON = async () => {
    try {
      const res = await api.get(`/export/tournament/${tournamentId}/json`);
      const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${tournamentName?.replace(/[^a-z0-9]/gi, '_') || 'tournament'}_export.json`;
      link.click();
      toast.success('Export JSON téléchargé');
    } catch (err) {
      toast.error('Erreur export');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex items-center gap-2">
      <button onClick={handleExportCSV} className="btn-outline text-xs py-1.5 px-3" title="Export CSV">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        CSV
      </button>
      <button onClick={handleExportJSON} className="btn-outline text-xs py-1.5 px-3" title="Export JSON">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
        </svg>
        JSON
      </button>
      <button onClick={handlePrint} className="btn-outline text-xs py-1.5 px-3" title="Imprimer">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
        </svg>
      </button>
    </div>
  );
}
