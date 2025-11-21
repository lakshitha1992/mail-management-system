import React, { useState, useEffect } from "react";

const LOCAL_KEY = "file_references_v1";
const PAGE_SIZE = 20;

export default function AddFileReference() {
    const [meter, setMeter] = useState("");
    const [fileRef, setFileRef] = useState("");
    const [description, setDescription] = useState("");
    const [items, setItems] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [page, setPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        try {
            const raw = localStorage.getItem(LOCAL_KEY);
            if (raw) setItems(JSON.parse(raw));
        } catch (e) {
            console.error(e);
        }
    }, []);

    useEffect(() => {
        localStorage.setItem(LOCAL_KEY, JSON.stringify(items));
    }, [items]);

    function resetForm() {
        setMeter("");
        setFileRef("");
        setDescription("");
        setEditingId(null);
    }

    function handleAddOrUpdate(e) {
        e.preventDefault();
        if (!meter.trim() || !fileRef.trim()) return;

        if (editingId) {
            setItems((prev) =>
                prev.map((it) =>
                    it.id === editingId ? { ...it, meter, fileRef, description } : it
                )
            );
        } else {
            const newItem = {
                id: Date.now().toString(),
                meter,
                fileRef,
                description,
                createdAt: new Date().toISOString(),
            };
            setItems((prev) => [newItem, ...prev]);
            // if adding new item, go to first page to show it
            setPage(1);
        }

        resetForm();
    }

    function handleEdit(item) {
        setMeter(item.meter);
        setFileRef(item.fileRef);
        setDescription(item.description);
        setEditingId(item.id);
        // navigate to page where the item is
        const index = items.findIndex((it) => it.id === item.id);
        if (index >= 0) setPage(Math.floor(index / PAGE_SIZE) + 1);
    }

    const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
    const startIdx = (page - 1) * PAGE_SIZE;
    const pageItems = items.slice(startIdx, startIdx + PAGE_SIZE);

    return (
        <div className="min-h-screen flex flex-col">
            {/* Banner */}
            <div className="w-full rounded-b-3xl p-6 mb-6" style={{ background: 'linear-gradient(90deg, var(--primary), rgba(0,0,0,0.05))' }}>
                <div className="mx-auto w-[80vw] max-w-full flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-white">File References</h2>
                        <p className="text-sm text-white/90">Create and manage file references for meters</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={resetForm} className="bg-white/10 text-white px-3 py-2 rounded">Reset</button>
                        <button onClick={() => { setMeter(''); setFileRef(''); setDescription(''); }} className="bg-white text-sm px-3 py-2 rounded themed-text">Clear</button>
                    </div>
                </div>
            </div>

            {/* Main area */}
            <div className="flex-1 mx-auto w-[80vw] max-w-full px-4">
                <div className="grid lg:grid-cols-3 gap-6 h-[calc(100vh-220px)]">
                    {/* Form */}
                    <div className="p-6 rounded-2xl shadow-lg lg:col-span-1 flex flex-col" style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', color: 'var(--card-text)' }}>
                        <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--card-text)' }}>Add / Edit Reference</h3>
                        <form onSubmit={handleAddOrUpdate} className="flex-1 flex flex-col gap-3">
                            <div>
                                <label className="block text-sm font-medium themed-text mb-1">Meter</label>
                                <select value={meter} onChange={(e) => setMeter(e.target.value)} className="themed-input w-full rounded px-3 py-2 text-sm">
                                    <option value="">Select meter</option>
                                    <option value="Meter A">Meter A</option>
                                    <option value="Meter B">Meter B</option>
                                    <option value="Meter C">Meter C</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium themed-text mb-1">File Reference</label>
                                <input value={fileRef} onChange={(e) => setFileRef(e.target.value)} className="themed-input w-full rounded px-3 py-2 text-sm" placeholder="Enter file reference" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium themed-text mb-1">Description</label>
                                <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="themed-input w-full rounded px-3 py-2 text-sm h-28 resize-none" placeholder="Optional description" />
                            </div>

                            <div className="mt-auto flex items-center gap-2">
                                {editingId ? (
                                    <>
                                        <button type="submit" className="themed-btn px-4 py-2 rounded">Update</button>
                                        <button type="button" onClick={resetForm} className="px-4 py-2 rounded border">Cancel</button>
                                    </>
                                ) : (
                                    <button type="submit" className="themed-btn px-4 py-2 rounded">Add Reference</button>
                                )}
                            </div>
                        </form>
                    </div>

                    {/* List */}
                    <div className="lg:col-span-2 p-6 rounded-2xl shadow-lg h-full flex flex-col" style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', color: 'var(--card-text)' }}>
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="text-lg font-semibold flex items-center gap-2" style={{ color: 'var(--card-text)' }}>References ({items.length})</h4>
                            <div className="relative w-72">
                                <input type="text" placeholder="Search references..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="themed-input w-full rounded px-3 py-2 text-sm" />
                            </div>
                        </div>

                        <div className="flex-1 overflow-auto content-scrollbar">
                            {items.length === 0 ? (
                                <div className="h-full flex items-center justify-center themed-muted">
                                    <div className="text-center">
                                        <p className="text-base">No references created yet</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="grid gap-3">
                                    {pageItems.map((it, idx) => (
                                        <div key={it.id} className="p-4 rounded-lg border flex items-start justify-between hover:shadow transition-shadow">
                                            <div>
                                                <div className="flex items-center gap-3 mb-2">
                                                    <div className="w-8 h-8 rounded-md flex items-center justify-center text-white font-semibold" style={{ background: 'var(--primary)' }}>{startIdx + idx + 1}</div>
                                                    <div>
                                                        <div className="font-semibold themed-text">{it.fileRef}</div>
                                                        <div className="text-sm themed-muted">{it.meter} — {it.description}</div>
                                                    </div>
                                                </div>
                                                <div className="text-xs themed-muted">Created: {new Date(it.createdAt).toLocaleString()}</div>
                                            </div>

                                            <div className="flex flex-col items-end gap-2">
                                                <button onClick={() => handleEdit(it)} className="text-sm px-3 py-1 bg-yellow-100 text-yellow-800 rounded">Edit</button>
                                                <button onClick={() => { setEditingId(it.id); setMeter(it.meter); setFileRef(it.fileRef); setDescription(it.description); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="text-sm px-3 py-1 rounded border">Open</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Pagination */}
                        <div className="mt-4 flex items-center justify-between">
                            <div className="text-sm themed-muted">Showing {items.length === 0 ? 0 : startIdx + 1} - {Math.min(startIdx + PAGE_SIZE, items.length)} of {items.length}</div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1 rounded border bg-white disabled:opacity-50 text-sm">Prev</button>
                                <div className="text-sm">Page {page} / {totalPages}</div>
                                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1 rounded border bg-white disabled:opacity-50 text-sm">Next</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}