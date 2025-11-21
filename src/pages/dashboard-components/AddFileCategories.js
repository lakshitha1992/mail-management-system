import React, { useState, useEffect } from "react";
import { FaPlus, FaTrash, FaFileAlt, FaCalendarAlt, FaSearch, FaFolderOpen } from "react-icons/fa";
import { IoDocumentText } from "react-icons/io5";

export default function AddFiles() {
  const [matter, setMatter] = useState("");
  const [description, setDescription] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [items, setItems] = useState(() => {
    try {
      const raw = localStorage.getItem("fileMatters");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("fileMatters", JSON.stringify(items));
    } catch {}
  }, [items]);

  const filteredItems = items.filter(item =>
    item.matter.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  function handleAdd(e) {
    e.preventDefault();
    if (!matter.trim() && !description.trim()) return;
    const newItem = {
      id: Date.now(),
      matter: matter.trim(),
      description: description.trim(),
      createdAt: new Date().toISOString(),
    };
    setItems((s) => [newItem, ...s]);
    setMatter("");
    setDescription("");
  }

  function handleDelete(id) {
    if (window.confirm("Are you sure you want to delete this file?")) {
      setItems((s) => s.filter((it) => it.id !== id));
    }
  }

  return (
    <div className="min-h-screen  bg-transparent">
      {/* Top Banner */}
      <div className="w-full rounded-b-3xl p-6 mb-6" style={{ background: 'linear-gradient(90deg, var(--primary), rgba(99,102,241,0.9))' }}>
        <div className="mx-auto w-[80vw] max-w-full flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg" style={{ background: 'var(--primary)' }}>FM</div>
            <div>
              <h1 className="text-2xl font-bold text-white">File Management</h1>
              <p className="text-sm text-white/80">Manage file matters and references</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="px-4 py-2 rounded-md bg-white/10 text-white">Top</button>
            <button onClick={() => { setMatter(''); setDescription(''); setSearchTerm(''); }} className="px-4 py-2 rounded-md bg-white text-sm themed-text">Reset</button>
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 mx-auto w-[80vw] max-w-full px-4">
        <div className="grid lg:grid-cols-3 gap-6 h-[calc(100vh-220px)]">
          {/* Left: prominent form */}
          <div className="p-6 rounded-2xl shadow-lg lg:col-span-1 h-full flex flex-col" style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', color: 'var(--card-text)' }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">File Matter</h2>
              <span className="text-sm" style={{ color: 'var(--muted)' }}>Primary</span>
            </div>

            <form onSubmit={handleAdd} className="flex-1 flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium themed-text mb-2">File Matter</label>
                <input value={matter} onChange={(e) => setMatter(e.target.value)} placeholder="Enter matter name" className="themed-input w-full rounded-lg px-4 py-3" />
              </div>

              <div>
                <label className="block text-sm font-medium themed-text mb-2">Description</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Short description" className="themed-input w-full rounded-lg px-4 py-3 h-32 resize-none" />
              </div>

              <div className="mt-auto flex items-center gap-3">
                <button type="submit" className="themed-btn px-4 py-3 rounded-lg font-semibold flex items-center gap-2">
                  <FaPlus /> Add Matter
                </button>
                <button type="button" onClick={() => { setMatter(''); setDescription(''); }} className="px-4 py-3 rounded-lg border">Clear</button>
              </div>
            </form>
          </div>

          {/* Right: list and search */}
          <div className="lg:col-span-2 flex flex-col p-6 rounded-2xl shadow-lg h-full" style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', color: 'var(--card-text)' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2"><FaFileAlt style={{ color: 'var(--primary)' }} /> Files ({filteredItems.length})</h3>
              <div className="relative w-80">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: 'var(--muted)' }} />
                <input type="text" placeholder="Search files..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="themed-input w-full rounded-lg px-10 py-3" />
              </div>
            </div>

            <div className="flex-1 overflow-auto content-scrollbar pr-2">
              {filteredItems.length === 0 ? (
                <div className="h-full flex items-center justify-center themed-muted">
                  <div className="text-center">
                    <FaFileAlt className="text-5xl opacity-40 mx-auto mb-4" />
                    <p className="text-base">{searchTerm ? 'No files match your search' : 'No files added yet'}</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredItems.map((it, i) => (
                    <div key={it.id} className="flex items-start justify-between p-4 rounded-lg border hover:shadow-md transition-shadow">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-8 h-8 rounded-md flex items-center justify-center text-white font-semibold" style={{ background: 'var(--primary)' }}>{i + 1}</div>
                          <div>
                            <h4 className="font-semibold themed-text">{it.matter}</h4>
                            <div className="text-sm themed-muted">{it.description}</div>
                          </div>
                        </div>
                        <div className="text-xs themed-muted flex items-center gap-2"><FaCalendarAlt /> <span>{new Date(it.createdAt).toLocaleString()}</span></div>
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <button onClick={() => handleDelete(it.id)} className="text-sm text-red-600 px-3 py-1 rounded hover:bg-red-50">Delete</button>
                        <button className="text-sm px-3 py-1 rounded border">Details</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Floating Action Button */}
      <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="fixed right-6 bottom-6 w-14 h-14 rounded-full shadow-xl flex items-center justify-center text-white" style={{ background: 'var(--primary)' }} title="Back to top">
        <FaFolderOpen />
      </button>
    </div>
  );
}