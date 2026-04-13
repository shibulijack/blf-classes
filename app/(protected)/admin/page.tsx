"use client";

import { useState, useEffect, useTransition } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { PinInput } from "@/components/auth/PinInput";
import {
  searchResidents,
  adminResetPin,
  getReportedClasses,
  resolveReport,
  adminDeleteClass,
  searchClasses,
} from "@/lib/admin/actions";

interface Resident {
  id: string;
  apartment: string;
  display_name: string;
  is_admin: boolean;
  created_at: string;
}

interface Report {
  id: string;
  reason: string;
  details: string | null;
  created_at: string;
  reporter_name: string;
  reporter_apartment: string;
  class_id: string;
  class_title: string;
  class_created_by: string;
  creator_name: string;
  creator_apartment: string;
  tutor_contact: string | null;
}

interface ClassResult {
  id: string;
  title: string;
  category: string;
  tutor_name: string | null;
  location: string | null;
  is_active: boolean;
  created_at: string;
  creator_name: string;
  creator_apartment: string;
}

type Tab = "reports" | "classes" | "pin-reset";

export default function AdminPage() {
  const [isPending, startTransition] = useTransition();
  const [tab, setTab] = useState<Tab>("reports");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // PIN reset state
  const [query, setQuery] = useState("");
  const [residents, setResidents] = useState<Resident[]>([]);
  const [searched, setSearched] = useState(false);
  const [selectedResident, setSelectedResident] = useState<Resident | null>(null);
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");

  // Reports state
  const [reports, setReports] = useState<Report[]>([]);
  const [reportsLoaded, setReportsLoaded] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  // Classes state
  const [classQuery, setClassQuery] = useState("");
  const [classes, setClasses] = useState<ClassResult[]>([]);
  const [classSearched, setClassSearched] = useState(false);
  const [confirmClassDelete, setConfirmClassDelete] = useState<string | null>(null);

  useEffect(() => {
    loadReports();
  }, []);

  function loadReports() {
    startTransition(async () => {
      const data = await getReportedClasses();
      setReports(data);
      setReportsLoaded(true);
    });
  }

  function handleSearch() {
    if (!query.trim()) return;
    setMessage("");
    setError("");
    setSelectedResident(null);
    startTransition(async () => {
      const results = await searchResidents(query.trim());
      setResidents(results);
      setSearched(true);
    });
  }

  function handleResetPin() {
    if (!selectedResident) return;
    setMessage("");
    setError("");
    if (newPin.length !== 4 || confirmPin.length !== 4) {
      setError("PIN must be 4 digits");
      return;
    }
    if (newPin !== confirmPin) {
      setError("PINs don't match");
      return;
    }
    startTransition(async () => {
      const result = await adminResetPin(selectedResident.id, newPin);
      if (result.error) {
        setError(result.error);
      } else {
        setMessage(`PIN reset for ${result.name} (${result.apartment})`);
        setSelectedResident(null);
        setNewPin("");
        setConfirmPin("");
      }
    });
  }

  function handleDismiss(reportId: string) {
    setMessage("");
    setError("");
    startTransition(async () => {
      const result = await resolveReport(reportId);
      if (result.error) {
        setError(result.error);
      } else {
        setReports((prev) => prev.filter((r) => r.id !== reportId));
        setMessage("Report dismissed");
      }
    });
  }

  function handleDeleteClass(classId: string, source: "report" | "classes") {
    setMessage("");
    setError("");
    startTransition(async () => {
      const result = await adminDeleteClass(classId);
      if (result.error) {
        setError(result.error);
      } else {
        if (source === "report") {
          setReports((prev) => prev.filter((r) => r.class_id !== classId));
          setConfirmDelete(null);
        } else {
          setClasses((prev) => prev.filter((c) => c.id !== classId));
          setConfirmClassDelete(null);
        }
        setMessage("Class deleted");
      }
    });
  }

  function handleClassSearch() {
    if (!classQuery.trim()) return;
    setMessage("");
    setError("");
    setConfirmClassDelete(null);
    startTransition(async () => {
      const results = await searchClasses(classQuery.trim());
      setClasses(results);
      setClassSearched(true);
    });
  }

  function switchTab(t: Tab) {
    setTab(t);
    setMessage("");
    setError("");
  }

  return (
    <div>
      <PageHeader title="Admin" showBack />

      {/* Tabs */}
      <div className="px-4 pt-4 flex gap-2">
        {(["reports", "classes", "pin-reset"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => switchTab(t)}
            className={`flex-1 py-2 text-sm font-medium rounded-xl transition-colors ${
              tab === t
                ? "bg-amber-600 text-white"
                : "glass-chip text-gray-600 hover:bg-white/70"
            }`}
          >
            {t === "reports" ? "Reports" : t === "classes" ? "Classes" : "PIN Reset"}
            {t === "reports" && reportsLoaded && reports.length > 0 && (
              <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
                tab === "reports" ? "bg-amber-500" : "bg-red-100 text-red-600"
              }`}>
                {reports.length}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="px-4 py-6 space-y-4">
        {/* ===== REPORTS TAB ===== */}
        {tab === "reports" && (
          <>
            {!reportsLoaded ? (
              <p className="text-sm text-gray-400 text-center py-8">Loading...</p>
            ) : reports.length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-gray-500 font-medium">No pending reports</p>
                <p className="text-gray-400 text-sm mt-1">All clear!</p>
              </div>
            ) : (
              reports.map((report) => (
                <div
                  key={report.id}
                  className="glass-card rounded-2xl p-4 space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 text-sm truncate">
                        {report.class_title}
                      </h3>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Posted by {report.creator_name} ({report.creator_apartment})
                        {report.tutor_contact && ` \u00b7 ${report.tutor_contact}`}
                      </p>
                    </div>
                  </div>
                  <div className="bg-red-50 rounded-xl p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-red-700 bg-red-100 px-2 py-0.5 rounded-full">
                        {report.reason}
                      </span>
                    </div>
                    {report.details && (
                      <p className="text-sm text-red-800 mt-1">{report.details}</p>
                    )}
                    <p className="text-xs text-red-400 mt-2">
                      Reported by {report.reporter_name} ({report.reporter_apartment}) &middot;{" "}
                      {new Date(report.created_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                      })}
                    </p>
                  </div>
                  {confirmDelete === report.class_id ? (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-3 space-y-2">
                      <p className="text-sm font-medium text-red-800">
                        Delete &quot;{report.class_title}&quot;? This cannot be undone.
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setConfirmDelete(null)}
                          className="flex-1 py-2 text-sm font-medium text-gray-600 glass-chip rounded-lg"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleDeleteClass(report.class_id, "report")}
                          disabled={isPending}
                          className="flex-1 py-2 text-sm font-medium text-white bg-red-600 rounded-lg disabled:bg-gray-300"
                        >
                          {isPending ? "..." : "Confirm Delete"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <a
                        href={`/classes/${report.class_id}`}
                        className="flex-1 py-2 text-center text-sm font-medium text-blue-600 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors"
                      >
                        View
                      </a>
                      <button
                        onClick={() => handleDismiss(report.id)}
                        disabled={isPending}
                        className="flex-1 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                      >
                        Dismiss
                      </button>
                      <button
                        onClick={() => setConfirmDelete(report.class_id)}
                        className="flex-1 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-xl hover:bg-red-100 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </>
        )}

        {/* ===== CLASSES TAB ===== */}
        {tab === "classes" && (
          <>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-800">
              Search and manage any class. Search by title, tutor, or location.
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={classQuery}
                onChange={(e) => setClassQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleClassSearch()}
                placeholder="Search classes..."
                className="flex-1 px-4 py-2.5 glass-input rounded-xl text-sm
                  focus:outline-none"
              />
              <button
                onClick={handleClassSearch}
                disabled={isPending || !classQuery.trim()}
                className="px-4 py-2.5 bg-blue-600 text-white font-medium rounded-xl text-sm
                  hover:bg-blue-700 disabled:bg-gray-300 transition-colors shrink-0"
              >
                {isPending ? "..." : "Search"}
              </button>
            </div>

            {classSearched && (
              <div className="space-y-2">
                {classes.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-4">No classes found</p>
                ) : (
                  classes.map((cls) => (
                    <div
                      key={cls.id}
                      className="glass-card rounded-xl p-4 space-y-2"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 text-sm truncate">{cls.title}</h3>
                          <p className="text-xs text-gray-400 mt-0.5">
                            by {cls.creator_name} ({cls.creator_apartment})
                            {cls.tutor_name && ` \u00b7 Tutor: ${cls.tutor_name}`}
                          </p>
                          {cls.location && (
                            <p className="text-xs text-gray-400">{cls.location}</p>
                          )}
                        </div>
                        <span className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${
                          cls.is_active ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-500"
                        }`}>
                          {cls.is_active ? "Active" : "Inactive"}
                        </span>
                      </div>

                      {confirmClassDelete === cls.id ? (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3 space-y-2">
                          <p className="text-sm font-medium text-red-800">
                            Delete &quot;{cls.title}&quot;? This cannot be undone.
                          </p>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setConfirmClassDelete(null)}
                              className="flex-1 py-2 text-sm font-medium text-gray-600 glass-chip rounded-lg"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleDeleteClass(cls.id, "classes")}
                              disabled={isPending}
                              className="flex-1 py-2 text-sm font-medium text-white bg-red-600 rounded-lg disabled:bg-gray-300"
                            >
                              {isPending ? "..." : "Confirm Delete"}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <a
                            href={`/classes/${cls.id}`}
                            className="flex-1 py-2 text-center text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                          >
                            View
                          </a>
                          <button
                            onClick={() => setConfirmClassDelete(cls.id)}
                            className="flex-1 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        )}

        {/* ===== PIN RESET TAB ===== */}
        {tab === "pin-reset" && (
          <>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-800">
              Reset PINs for any resident. Search by apartment number or name.
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Search apartment or name..."
                className="flex-1 px-4 py-2.5 glass-input rounded-xl text-sm
                  focus:outline-none"
              />
              <button
                onClick={handleSearch}
                disabled={isPending || !query.trim()}
                className="px-4 py-2.5 bg-blue-600 text-white font-medium rounded-xl text-sm
                  hover:bg-blue-700 disabled:bg-gray-300 transition-colors shrink-0"
              >
                {isPending ? "..." : "Search"}
              </button>
            </div>

            {searched && !selectedResident && (
              <div className="space-y-2">
                {residents.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-4">No residents found</p>
                ) : (
                  residents.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => { setSelectedResident(r); setNewPin(""); setConfirmPin(""); setError(""); setMessage(""); }}
                      className="w-full flex items-center justify-between px-4 py-3 glass-card rounded-xl
                        hover:border-blue-400 hover:bg-blue-50 transition-colors text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                          <span className="text-blue-600 font-semibold text-sm">
                            {r.display_name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{r.display_name}</p>
                          <p className="text-xs text-gray-400">{r.apartment}</p>
                        </div>
                      </div>
                      {r.is_admin && (
                        <span className="text-xs font-medium text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">
                          Admin
                        </span>
                      )}
                    </button>
                  ))
                )}
              </div>
            )}

            {selectedResident && (
              <div className="glass-card rounded-2xl p-4 space-y-4">
                <div className="text-center">
                  <p className="text-sm text-gray-500">Reset PIN for</p>
                  <p className="font-semibold text-gray-900">{selectedResident.display_name}</p>
                  <p className="text-xs text-gray-400">{selectedResident.apartment}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-2 text-center">New PIN</p>
                  <PinInput value={newPin} onChange={setNewPin} />
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-2 text-center">Confirm New PIN</p>
                  <PinInput value={confirmPin} onChange={setConfirmPin} />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => { setSelectedResident(null); setNewPin(""); setConfirmPin(""); }}
                    className="flex-1 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleResetPin}
                    disabled={isPending}
                    className="flex-1 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-xl disabled:bg-gray-300"
                  >
                    {isPending ? "..." : "Reset PIN"}
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {message && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-600 text-center">
            {message}
          </div>
        )}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 text-center">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
