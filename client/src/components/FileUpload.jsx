import { useState } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function FileUpload({ onUpload, multiple = false, accept = 'image/*' }) {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e) => {
    const files = e.target.files;
    if (!files.length) return;
    setUploading(true);
    try {
      const formData = new FormData();
      if (multiple) {
        Array.from(files).forEach(f => formData.append('files', f));
      } else {
        formData.append('file', files[0]);
      }
      const res = await api.post(`/upload${multiple ? '/multiple' : ''}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (onUpload) onUpload(res.data);
      toast.success('Fichier uploadé');
    } catch (err) {
      toast.error("Erreur d'upload");
    } finally {
      setUploading(false);
    }
  };

  return (
    <label className={`cursor-pointer inline-flex items-center gap-2 btn-outline text-xs py-2 px-4 ${uploading ? 'opacity-50' : ''}`}>
      {uploading ? (
        <span className="inline-block w-4 h-4 border-2 border-sport-green border-t-transparent rounded-full animate-spin" />
      ) : (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
      )}
      {uploading ? 'Upload...' : 'Upload'}
      <input type="file" accept={accept} multiple={multiple} onChange={handleUpload} className="hidden" disabled={uploading} />
    </label>
  );
}
