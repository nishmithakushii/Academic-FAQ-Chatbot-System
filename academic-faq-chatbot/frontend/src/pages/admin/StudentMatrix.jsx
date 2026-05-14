import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Upload, Download, Search, Users, ChevronLeft, ChevronRight, Trophy } from 'lucide-react';

export default function StudentMatrix() {
  const [students, setStudents] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [uploading, setUploading] = useState(false);
  const [subjectKeys, setSubjectKeys] = useState([]);
  const fileRef = useRef();
  const PER_PAGE = 10;

  const load = () => {
    axios.get('/matrix').then(r => {
      const data = Array.isArray(r.data) ? r.data : [r.data];
      setStudents(data);
      setFiltered(data);
      // Extract dynamic subject columns
      const keys = new Set();
      data.forEach(s => { if (s.marks_data) Object.keys(s.marks_data).forEach(k => keys.add(k)); });
      setSubjectKeys([...keys]);
    });
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(students.filter(s =>
      s.student_id?.toLowerCase().includes(q) ||
      s.name?.toLowerCase().includes(q) ||
      s.department?.toLowerCase().includes(q)
    ));
    setPage(1);
  }, [search, students]);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    try {
      const res = await axios.post('/matrix/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success(`Imported ${res.data.imported}/${res.data.total} students`);
      if (res.data.errors?.length) toast.error(`${res.data.errors.length} rows had errors`);
      load();
    } catch (err) {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const exportCSV = () => {
    const headers = ['Rank', 'Student ID', 'Name', 'Department', 'Semester', ...subjectKeys, 'Attendance', 'Fee Status', 'CGPA'];
    const rows = filtered.map(s => [
      s.rank, s.student_id, s.name, s.department, s.semester,
      ...subjectKeys.map(k => s.marks_data?.[k] ?? 'N/A'),
      s.attendance, s.fee_status, s.cgpa
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'student_matrix.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const totalPages = Math.ceil(filtered.length / PER_PAGE);

  const feeColor = { paid: 'badge-paid', pending: 'badge-pending', partial: 'badge-partial' };
  const rankEmoji = (r) => r === 1 ? '🥇' : r === 2 ? '🥈' : r === 3 ? '🥉' : `#${r}`;

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Student Matrix</h1>
          <p className="text-sm text-slate-500 mt-0.5">{filtered.length} students</p>
        </div>
        <div className="flex gap-2">
          <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleUpload} />
          <button className="btn-secondary" onClick={() => fileRef.current.click()} disabled={uploading}>
            <Upload className="w-4 h-4" /> {uploading ? 'Uploading...' : 'Upload CSV'}
          </button>
          <button className="btn-primary" onClick={exportCSV}>
            <Download className="w-4 h-4" /> Export
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input className="input pl-10" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, ID, or department..." />
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Rank</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Student ID</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Name</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Dept</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Sem</th>
                {subjectKeys.map(k => (
                  <th key={k} className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap hidden lg:table-cell">{k}</th>
                ))}
                <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Attend.</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Fee</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">CGPA</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 && (
                <tr><td colSpan={20} className="text-center py-12 text-slate-400"><Users className="w-8 h-8 mx-auto mb-2 opacity-30" />No students found</td></tr>
              )}
              {paginated.map((s, i) => (
                <tr key={s.student_id} className={`border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors ${s.rank <= 3 ? 'bg-amber-50/30 dark:bg-amber-950/10' : ''}`}>
                  <td className="px-4 py-3 font-mono text-sm font-bold text-slate-700 dark:text-slate-300">{rankEmoji(s.rank)}</td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-500">{s.student_id}</td>
                  <td className="px-4 py-3 font-medium text-slate-900 dark:text-white whitespace-nowrap">{s.name}</td>
                  <td className="px-4 py-3 text-slate-500 hidden md:table-cell text-xs">{s.department}</td>
                  <td className="px-4 py-3 text-slate-500 hidden md:table-cell text-xs text-center">{s.semester}</td>
                  {subjectKeys.map(k => (
                    <td key={k} className="px-4 py-3 text-center hidden lg:table-cell">
                      <span className={`font-medium text-sm ${(s.marks_data?.[k] ?? 0) >= 75 ? 'text-green-600' : 'text-red-500'}`}>
                        {s.marks_data?.[k] ?? '—'}
                      </span>
                    </td>
                  ))}
                  <td className="px-4 py-3 text-center">
                    <span className={`text-sm font-medium ${s.attendance >= 75 ? 'text-green-600' : 'text-red-500'}`}>{s.attendance}%</span>
                  </td>
                  <td className="px-4 py-3 text-center"><span className={feeColor[s.fee_status]}>{s.fee_status}</span></td>
                  <td className="px-4 py-3 text-center"><span className="font-bold text-primary-600">{s.cgpa}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 dark:border-slate-800">
            <p className="text-xs text-slate-500">Showing {((page-1)*PER_PAGE)+1}–{Math.min(page*PER_PAGE, filtered.length)} of {filtered.length}</p>
            <div className="flex gap-1">
              <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page===1} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button key={i} onClick={() => setPage(i+1)} className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${page===i+1 ? 'bg-primary-600 text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>{i+1}</button>
              ))}
              <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page===totalPages} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
