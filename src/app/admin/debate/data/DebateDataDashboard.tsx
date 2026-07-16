"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { DebateRegistration } from "@prisma/client";
import { Users, Search, Download, LayoutGrid, List, Trash2, CheckSquare, X } from "lucide-react";
import { deleteDebateRegistration, bulkDeleteDebateRegistrations, toggleDebateStatus } from "@/app/debate/actions";

export default function DebateDataDashboard({
  initialRegistrations,
  initialIsActive,
  initialClosingAt,
}: {
  initialRegistrations: DebateRegistration[];
  initialIsActive: boolean;
  initialClosingAt: Date | null;
}) {
  const [registrations, setRegistrations] = useState(initialRegistrations);
  const [isActive, setIsActive] = useState(initialIsActive);
  const [closingAt, setClosingAt] = useState<Date | null>(initialClosingAt);
  const [timeLeft, setTimeLeft] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    setRegistrations(initialRegistrations);
    setIsActive(initialIsActive);
    setClosingAt(initialClosingAt);
  }, [initialRegistrations, initialIsActive, initialClosingAt]);

  useEffect(() => {
    if (!closingAt) {
      setTimeLeft(null);
      return;
    }

    const updateTimer = () => {
      const now = new Date().getTime();
      const target = new Date(closingAt).getTime();
      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft(null);
        setClosingAt(null);
        setIsActive(false);
        router.refresh();
      } else {
        const minutes = Math.floor(diff / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        setTimeLeft(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
      }
    };

    updateTimer();
    const timerId = setInterval(updateTimer, 1000);
    return () => clearInterval(timerId);
  }, [closingAt, router]);

  useEffect(() => {
    // Poll the server every 5 seconds for new registrations
    const intervalId = setInterval(() => {
      router.refresh();
    }, 5000);

    return () => clearInterval(intervalId);
  }, [router]);

  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [sortOption, setSortOption] = useState<"newest" | "oldest" | "nameAsc" | "nameDesc">("newest");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [showToggleConfirmModal, setShowToggleConfirmModal] = useState(false);
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredRegistrations.length && filteredRegistrations.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredRegistrations.map((r) => r.id)));
    }
  };

  const confirmToggleStatus = async () => {
    setIsTogglingStatus(true);
    const newStatus = !isActive;

    const startGracePeriod = !newStatus;

    if (startGracePeriod) {
      setIsActive(true);
      setClosingAt(new Date(Date.now() + 5 * 60 * 1000));
    } else {
      setIsActive(true);
      setClosingAt(null);
    }

    await toggleDebateStatus(newStatus, startGracePeriod);
    router.refresh();
    setIsTogglingStatus(false);
    setShowToggleConfirmModal(false);
  };

  const confirmBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    setIsBulkDeleting(true);
    const response = await bulkDeleteDebateRegistrations(Array.from(selectedIds));
    if (response.success) {
      setRegistrations((prev) => prev.filter((reg) => !selectedIds.has(reg.id)));
      setSelectedIds(new Set());
      setShowBulkDeleteModal(false);
    } else {
      alert("Failed to bulk delete registrations.");
    }
    setIsBulkDeleting(false);
  };

  const handleDelete = (id: string) => {
    setDeletingId(id);
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    const response = await deleteDebateRegistration(deletingId);
    if (response.success) {
      setRegistrations((prev) => prev.filter((reg) => reg.id !== deletingId));
    } else {
      alert("Failed to delete registration.");
    }
    setIsDeleting(false);
    setDeletingId(null);
  };

  const filteredRegistrations = registrations
    .filter(
      (reg) =>
        reg.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reg.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortOption === "newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortOption === "oldest") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sortOption === "nameAsc") return a.fullName.localeCompare(b.fullName);
      if (sortOption === "nameDesc") return b.fullName.localeCompare(a.fullName);
      return 0;
    });

  const exportToCSV = () => {
    const headers = [
      "Name",
      "Age",
      "Contact",
      "Email",
      "Liked Film?",
      "Liked Reason",
      "Disliked Reason",
      "In Hyderabad?",
      "Discussion Topic",
      "Okay Filmed?",
      "Social: X/Twitter",
      "Social: Instagram",
      "Social: Reddit",
      "Date",
    ];

    const dataToExport = selectedIds.size > 0
      ? filteredRegistrations.filter(r => selectedIds.has(r.id))
      : filteredRegistrations;

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [
        headers.join(","),
        ...dataToExport.map((reg) => {
          const handles = reg.socialHandles.split(", ");
          const twitter = handles.find((h) => h.startsWith("X/Twitter: "))?.replace("X/Twitter: ", "") || "";
          const instagram = handles.find((h) => h.startsWith("Instagram: "))?.replace("Instagram: ", "") || "";
          const reddit = handles.find((h) => h.startsWith("Reddit: "))?.replace("Reddit: ", "") || "";

          return [
            `"${reg.fullName}"`,
            reg.age,
            `"${reg.contactNumber}"`,
            `"${reg.email}"`,
            `"${reg.likedFilm}"`,
            `"${reg.likedReason.replace(/"/g, '""')}"`,
            `"${reg.dislikedReason.replace(/"/g, '""')}"`,
            `"${reg.inHyderabad}"`,
            `"${reg.discussPart.replace(/"/g, '""')}"`,
            `"${reg.okayFilmed}"`,
            `"${twitter}"`,
            `"${instagram}"`,
            `"${reddit}"`,
            `"${new Date(reg.createdAt).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit", hour12: true })}"`,
          ].join(",");
        }),
      ].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "debate_registrations.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full max-w-[98%] 2xl:max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header section */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between mb-8 space-y-4 xl:space-y-0">
        <div className="flex flex-col gap-3">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
              <Users className="w-8 h-8 text-[#d4af37]" />
              Debate Registrations
            </h1>
            <p className="mt-2 text-sm text-zinc-400">
              Total Registrations: {filteredRegistrations.length}
            </p>
          </div>
          <div className="flex items-center gap-3 bg-zinc-900/50 border border-white/10 rounded-lg p-2 w-fit">
            <span className="text-sm font-medium text-zinc-300">Debate Status:</span>
            <button
              onClick={() => setShowToggleConfirmModal(true)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#d4af37] focus:ring-offset-2 focus:ring-offset-black ${isActive ? 'bg-[#d4af37]' : 'bg-zinc-600'
                }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isActive ? 'translate-x-6' : 'translate-x-1'
                  }`}
              />
            </button>
            <span className={`text-sm font-semibold ${isActive ? 'text-emerald-400' : 'text-rose-400'}`}>
              {isActive ? (closingAt ? 'Closing Soon...' : 'Active (Accepting)') : 'Closed'}
            </span>
            {timeLeft && (
              <div className="flex items-center gap-1">
                <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-amber-500/20 text-amber-500 border border-amber-500/30 animate-pulse">
                  {timeLeft}
                </span>
                <button
                  onClick={async () => {
                    setIsActive(true);
                    setClosingAt(null);
                    await toggleDebateStatus(true, false);
                    router.refresh();
                  }}
                  className="p-1 rounded-md text-amber-500 hover:text-amber-400 hover:bg-amber-500/10 transition-colors"
                  title="Cancel Closing Timer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
          <div className="flex bg-zinc-900/80 border border-white/10 rounded-lg p-1 hidden sm:flex">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-md transition-colors ${viewMode === "grid" ? "bg-white/10 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-300"}`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-md transition-colors ${viewMode === "list" ? "bg-white/10 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-300"}`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value as any)}
            className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] transition-all cursor-pointer flex-grow sm:flex-grow-0"
          >
            <option value="newest" className="bg-zinc-900">Newest First</option>
            <option value="oldest" className="bg-zinc-900">Oldest First</option>
            <option value="nameAsc" className="bg-zinc-900">Name (A-Z)</option>
            <option value="nameDesc" className="bg-zinc-900">Name (Z-A)</option>
          </select>

          <div className="relative flex-grow min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] transition-all w-full"
            />
          </div>
          <button
            onClick={exportToCSV}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white transition-colors flex-grow sm:flex-grow-0"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* View Mode content */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredRegistrations.map((reg) => (
            <div
              key={reg.id}
              className="bg-zinc-900/50 border border-white/10 rounded-xl p-6 hover:border-white/20 transition-all flex flex-col h-full"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-start gap-3">
                  <div className="pt-1">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(reg.id)}
                      onChange={() => toggleSelect(reg.id)}
                      className="w-4 h-4 rounded border-zinc-700 bg-zinc-900/50 text-[#d4af37] focus:ring-[#d4af37] focus:ring-offset-zinc-950 transition-all cursor-pointer accent-[#d4af37]"
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      {reg.fullName}
                    </h3>
                    <p className="text-sm text-zinc-400">{reg.email}</p>
                  </div>
                </div>
                <div className="text-right flex flex-col items-end gap-2">
                  <div>
                    <span className="text-xs text-zinc-500 block">
                      {new Date(reg.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                    <span className="text-xs text-zinc-500 block">
                      {new Date(reg.createdAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDelete(reg.id)}
                    className="text-zinc-500 hover:text-red-400 p-1.5 rounded-md hover:bg-white/5 transition-colors"
                    title="Delete Registration"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm mb-4 bg-black/40 p-3 rounded-lg border border-white/5">
                <div>
                  <span className="text-zinc-500 block text-xs uppercase tracking-wider">
                    Age
                  </span>
                  <span className="text-zinc-200">{reg.age}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block text-xs uppercase tracking-wider">
                    Contact
                  </span>
                  <span className="text-zinc-200">{reg.contactNumber}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block text-xs uppercase tracking-wider">
                    Hyderabad?
                  </span>
                  <span className="text-zinc-200">{reg.inHyderabad}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block text-xs uppercase tracking-wider">
                    Okay Filmed?
                  </span>
                  <span className="text-zinc-200">{reg.okayFilmed}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block text-xs uppercase tracking-wider">
                    Liked Film?
                  </span>
                  <span
                    className={
                      reg.likedFilm === "Yes"
                        ? "text-emerald-400"
                        : "text-rose-400"
                    }
                  >
                    {reg.likedFilm}
                  </span>
                </div>
                <div>
                  <span className="text-zinc-500 block text-xs uppercase tracking-wider">
                    Socials
                  </span>
                  <div className="text-zinc-200 block break-words space-y-1 mt-1">
                    {reg.socialHandles.split(', ').map((handle, i) => <div key={i}>{handle}</div>)}
                  </div>
                </div>
              </div>

              <div className="space-y-4 flex-grow">
                <div>
                  <span className="text-zinc-500 block text-xs uppercase tracking-wider mb-1">
                    Liked Reason
                  </span>
                  <p className="text-zinc-300 text-sm line-clamp-2" title={reg.likedReason}>
                    {reg.likedReason}
                  </p>
                </div>
                <div>
                  <span className="text-zinc-500 block text-xs uppercase tracking-wider mb-1">
                    Disliked Reason
                  </span>
                  <p className="text-zinc-300 text-sm line-clamp-2" title={reg.dislikedReason}>
                    {reg.dislikedReason}
                  </p>
                </div>
                <div>
                  <span className="text-[#d4af37]/70 block text-xs uppercase tracking-wider mb-1">
                    Wants to discuss
                  </span>
                  <p className="text-zinc-200 text-sm italic border-l-2 border-[#d4af37]/30 pl-3">
                    "{reg.discussPart}"
                  </p>
                </div>
              </div>
            </div>
          ))}

          {filteredRegistrations.length === 0 && (
            <div className="col-span-full py-12 text-center text-zinc-500 border border-white/5 rounded-xl border-dashed">
              No registrations found matching your search.
            </div>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto bg-zinc-900/50 border border-white/10 rounded-xl">
          <table className="w-full text-sm text-left text-zinc-400 min-w-[1024px]">
            <thead className="text-xs uppercase bg-black/40 text-zinc-500 border-b border-white/10">
              <tr>
                <th className="px-6 py-4 w-12">
                  <input
                    type="checkbox"
                    checked={filteredRegistrations.length > 0 && selectedIds.size === filteredRegistrations.length}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-zinc-700 bg-zinc-900/50 text-[#d4af37] focus:ring-[#d4af37] focus:ring-offset-zinc-950 transition-all cursor-pointer accent-[#d4af37]"
                  />
                </th>
                <th className="px-4 py-4 font-medium tracking-wider w-[15%]">Applicant</th>
                <th className="px-4 py-4 font-medium tracking-wider w-[10%]">Contact</th>
                <th className="px-4 py-4 font-medium tracking-wider w-[10%]">Details</th>
                <th className="px-4 py-4 font-medium tracking-wider w-[15%]">Socials</th>
                <th className="px-6 py-4 font-medium tracking-wider w-[40%]">Responses</th>
                <th className="px-4 py-4 font-medium tracking-wider text-right w-20">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredRegistrations.map((reg) => (
                <tr key={reg.id} className={`hover:bg-white/[0.02] transition-colors ${selectedIds.has(reg.id) ? 'bg-[#d4af37]/5' : ''}`}>
                  <td className="px-6 py-4 w-12 align-top pt-5">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(reg.id)}
                      onChange={() => toggleSelect(reg.id)}
                      className="w-4 h-4 rounded border-zinc-700 bg-zinc-900/50 text-[#d4af37] focus:ring-[#d4af37] focus:ring-offset-zinc-950 transition-all cursor-pointer accent-[#d4af37]"
                    />
                  </td>
                  <td className="px-4 py-4 align-top break-words">
                    <div className="font-medium text-white break-words">{reg.fullName}</div>
                    <div className="break-words">{reg.email}</div>
                    <div className="text-xs text-zinc-500 mt-1">
                      {new Date(reg.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} at {new Date(reg.createdAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}
                    </div>
                  </td>
                  <td className="px-4 py-4 align-top">
                    <div className="mb-1"><span className="text-zinc-500 text-xs uppercase">Age:</span> <span className="text-white">{reg.age}</span></div>
                    <div><span className="text-zinc-500 text-xs uppercase">Tel:</span> <span className="text-white whitespace-nowrap">{reg.contactNumber}</span></div>
                  </td>
                  <td className="px-4 py-4 align-top">
                    <div className="mb-1"><span className="text-zinc-500 text-xs uppercase">Hyd:</span> <span className="text-white">{reg.inHyderabad}</span></div>
                    <div className="mb-1"><span className="text-zinc-500 text-xs uppercase">Filmed:</span> <span className="text-white">{reg.okayFilmed}</span></div>
                    <div><span className="text-zinc-500 text-xs uppercase">Liked:</span> <span className={reg.likedFilm === "Yes" ? "text-emerald-400" : "text-rose-400"}>{reg.likedFilm}</span></div>
                  </td>
                  <td className="px-4 py-4 align-top break-words">
                    <div className="break-words space-y-1">
                      {reg.socialHandles.split(', ').map((handle, i) => <div key={i} className="text-white break-all">{handle}</div>)}
                    </div>
                  </td>
                  <td className="px-6 py-4 align-top break-words whitespace-normal">
                    <div className="mb-3">
                      <span className="text-xs uppercase text-zinc-500 block mb-1">Liked Reason</span>
                      <p className="text-zinc-300" title={reg.likedReason}>{reg.likedReason}</p>
                    </div>
                    <div className="mb-3">
                      <span className="text-xs uppercase text-zinc-500 block mb-1">Disliked Reason</span>
                      <p className="text-zinc-300" title={reg.dislikedReason}>{reg.dislikedReason}</p>
                    </div>
                    <div>
                      <span className="text-xs uppercase text-[#d4af37]/70 block mb-1">Wants to discuss</span>
                      <p className="text-zinc-200 italic" title={reg.discussPart}>"{reg.discussPart}"</p>
                    </div>
                  </td>
                  <td className="px-4 py-4 align-top text-right">
                    <button
                      onClick={() => handleDelete(reg.id)}
                      className="text-zinc-500 hover:text-red-400 p-1.5 rounded-md hover:bg-white/5 transition-colors"
                      title="Delete Registration"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredRegistrations.length === 0 && (
            <div className="py-12 text-center text-zinc-500">
              No registrations found matching your search.
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-zinc-950 border border-[#d4af37]/30 rounded-2xl shadow-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-2">Delete Registration?</h3>
            <p className="text-zinc-400 text-sm mb-6">
              Are you sure you want to delete this registration? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeletingId(null)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-full border border-white/10 text-white text-sm font-medium hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 rounded-full bg-red-500/10 text-red-500 border border-red-500/30 text-sm font-medium hover:bg-red-500/20 transition-colors disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Actions Sticky Toolbar */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-zinc-950 border-t border-white/10 shadow-2xl p-4 flex justify-center pb-6 sm:pb-8 animate-in slide-in-from-bottom">
          <div className="flex flex-col sm:flex-row items-center justify-between w-full max-w-4xl bg-zinc-900 border border-[#d4af37]/20 rounded-xl p-3 px-4 sm:px-6 shadow-xl gap-4 sm:gap-0">
            <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-start">
              <div className="flex items-center gap-3">
                <span className="text-[#d4af37] font-semibold text-xl">{selectedIds.size}</span>
                <span className="text-zinc-400 font-medium text-sm uppercase tracking-wider">Selected</span>
              </div>
              <button
                onClick={() => setSelectedIds(new Set())}
                className="px-3 py-2 text-zinc-400 hover:text-white transition-colors text-sm font-medium sm:hidden"
              >
                Clear
              </button>
            </div>
            <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
              <button
                onClick={() => setSelectedIds(new Set())}
                className="px-3 py-2 text-zinc-400 hover:text-white transition-colors text-sm font-medium hidden sm:block"
              >
                Clear
              </button>
              <button
                onClick={exportToCSV}
                className="flex items-center justify-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white transition-colors text-sm font-medium flex-1 sm:flex-none"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
              <button
                onClick={() => setShowBulkDeleteModal(true)}
                className="flex items-center justify-center gap-2 px-3 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-500 rounded-lg transition-colors text-sm font-medium flex-1 sm:flex-none"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Confirmation Modal */}
      {showBulkDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-zinc-950 border border-[#d4af37]/30 rounded-2xl shadow-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-2">Delete {selectedIds.size} Registrations?</h3>
            <p className="text-zinc-400 text-sm mb-6">
              Are you sure you want to bulk delete the selected registrations? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowBulkDeleteModal(false)}
                disabled={isBulkDeleting}
                className="px-4 py-2 rounded-full border border-white/10 text-white text-sm font-medium hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmBulkDelete}
                disabled={isBulkDeleting}
                className="px-4 py-2 rounded-full bg-red-500/10 text-red-500 border border-red-500/30 text-sm font-medium hover:bg-red-500/20 transition-colors disabled:opacity-50"
              >
                {isBulkDeleting ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Toggle Confirmation Modal */}
      {showToggleConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-zinc-950 border border-[#d4af37]/30 rounded-2xl shadow-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-2">Change Debate Status?</h3>
            <p className="text-zinc-400 text-sm mb-6">
              {isActive
                ? 'Are you sure you want to close the debate? A 5-minute timer will start to allow current users to finish.'
                : 'Are you sure you want to open the debate for registrations?'}
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowToggleConfirmModal(false)}
                disabled={isTogglingStatus}
                className="px-4 py-2 rounded-full border border-white/10 text-white text-sm font-medium hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmToggleStatus}
                disabled={isTogglingStatus}
                className="px-4 py-2 rounded-full bg-[#d4af37]/10 text-[#d4af37] border border-[#d4af37]/30 text-sm font-medium hover:bg-[#d4af37]/20 transition-colors disabled:opacity-50"
              >
                {isTogglingStatus ? "Changing..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
