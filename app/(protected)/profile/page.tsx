"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { PinInput } from "@/components/auth/PinInput";
import {
  updateProfile,
  changePin,
  getHouseholdMembers,
  resetHouseholdPin,
} from "@/lib/auth/actions";

interface HouseholdMember {
  id: string;
  display_name: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [apartment, setApartment] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showPinChange, setShowPinChange] = useState(false);

  // Household reset state
  const [householdMembers, setHouseholdMembers] = useState<HouseholdMember[]>([]);
  const [showHouseholdReset, setShowHouseholdReset] = useState(false);
  const [selectedMember, setSelectedMember] = useState<HouseholdMember | null>(null);
  const [resetPin, setResetPin] = useState("");
  const [resetConfirmPin, setResetConfirmPin] = useState("");

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.apartment) setApartment(data.apartment);
        if (data.display_name) setDisplayName(data.display_name);
        if (data.is_admin) setIsAdmin(true);
      });

    startTransition(async () => {
      const members = await getHouseholdMembers();
      setHouseholdMembers(members);
    });
  }, []);

  function handleSaveProfile() {
    setMessage("");
    setError("");
    startTransition(async () => {
      const result = await updateProfile(displayName);
      if (result.error) setError(result.error);
      else setMessage("Profile updated!");
    });
  }

  function handleChangePin() {
    setMessage("");
    setError("");
    if (newPin.length !== 4 || confirmPin.length !== 4) {
      setError("PIN must be 4 digits");
      return;
    }
    if (newPin !== confirmPin) {
      setError("New PINs don't match");
      return;
    }
    startTransition(async () => {
      const result = await changePin(currentPin, newPin);
      if (result.error) {
        setError(result.error);
      } else {
        setMessage("PIN changed successfully!");
        setCurrentPin("");
        setNewPin("");
        setConfirmPin("");
        setShowPinChange(false);
      }
    });
  }

  function handleResetHouseholdPin() {
    if (!selectedMember) return;
    setMessage("");
    setError("");
    if (resetPin.length !== 4 || resetConfirmPin.length !== 4) {
      setError("PIN must be 4 digits");
      return;
    }
    if (resetPin !== resetConfirmPin) {
      setError("PINs don't match");
      return;
    }
    startTransition(async () => {
      const result = await resetHouseholdPin(selectedMember.id, resetPin);
      if (result.error) {
        setError(result.error);
      } else {
        setMessage(`PIN reset for ${result.name}!`);
        setSelectedMember(null);
        setResetPin("");
        setResetConfirmPin("");
        setShowHouseholdReset(false);
      }
    });
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  }

  const inputClass =
    "w-full px-4 py-3 glass-input rounded-xl focus:outline-none text-sm";

  return (
    <div>
      <PageHeader title="Profile" />

      <div className="px-4 py-6 space-y-6">
        {/* Apartment info */}
        <div className="glass-card rounded-2xl p-4 text-center">
          <p className="text-sm text-blue-600">Apartment</p>
          <p className="text-2xl font-bold text-blue-700">{apartment}</p>
        </div>

        {/* Display name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Display Name
          </label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="How others will see you"
            className={inputClass}
          />
          <button
            onClick={handleSaveProfile}
            disabled={isPending}
            className="mt-3 w-full py-2.5 px-4 bg-blue-600 text-white font-medium rounded-xl
              hover:bg-blue-700 disabled:bg-gray-300 transition-colors text-sm"
          >
            {isPending ? "Saving..." : "Save Name"}
          </button>
        </div>

        {/* Change PIN */}
        <div className="border-t border-gray-100 dark:border-gray-700/50 pt-6">
          {!showPinChange ? (
            <button
              onClick={() => { setShowPinChange(true); setShowHouseholdReset(false); }}
              className="w-full py-2.5 text-sm font-medium text-gray-600 glass-chip rounded-xl hover:bg-white/70 transition-colors"
            >
              Change My PIN
            </button>
          ) : (
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-700">Change My PIN</h3>
              <div>
                <p className="text-xs text-gray-500 mb-2 text-center">Current PIN</p>
                <PinInput value={currentPin} onChange={setCurrentPin} />
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
                  onClick={() => {
                    setShowPinChange(false);
                    setCurrentPin("");
                    setNewPin("");
                    setConfirmPin("");
                  }}
                  className="flex-1 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  onClick={handleChangePin}
                  disabled={isPending}
                  className="flex-1 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-xl disabled:bg-gray-300"
                >
                  {isPending ? "..." : "Update PIN"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Reset household member's PIN */}
        {householdMembers.length > 0 && (
          <div className="border-t border-gray-100 dark:border-gray-700/50 pt-6">
            {!showHouseholdReset ? (
              <button
                onClick={() => { setShowHouseholdReset(true); setShowPinChange(false); }}
                className="w-full py-2.5 text-sm font-medium text-gray-600 glass-chip rounded-xl hover:bg-white/70 transition-colors"
              >
                Reset Household Member&apos;s PIN
              </button>
            ) : (
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-700">Reset PIN for</h3>

                {!selectedMember ? (
                  <div className="space-y-2">
                    {householdMembers.map((member) => (
                      <button
                        key={member.id}
                        onClick={() => setSelectedMember(member)}
                        className="w-full flex items-center gap-3 px-4 py-3 glass-card rounded-xl
                          hover:bg-white/80 transition-all text-left"
                      >
                        <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                          <span className="text-blue-600 font-semibold text-sm">
                            {member.display_name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span className="font-medium text-gray-900 text-sm">{member.display_name}</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <>
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-900">{selectedMember.display_name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-2 text-center">New PIN</p>
                      <PinInput value={resetPin} onChange={setResetPin} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-2 text-center">Confirm New PIN</p>
                      <PinInput value={resetConfirmPin} onChange={setResetConfirmPin} />
                    </div>
                  </>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowHouseholdReset(false);
                      setSelectedMember(null);
                      setResetPin("");
                      setResetConfirmPin("");
                    }}
                    className="flex-1 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  {selectedMember && (
                    <button
                      onClick={handleResetHouseholdPin}
                      disabled={isPending}
                      className="flex-1 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-xl disabled:bg-gray-300"
                    >
                      {isPending ? "..." : "Reset PIN"}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
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

        {/* Admin */}
        {isAdmin && (
          <Link
            href="/admin"
            className="block w-full py-2.5 text-center text-sm font-medium text-amber-700 glass-chip rounded-xl hover:bg-amber-50/50 transition-colors"
          >
            Admin Panel
          </Link>
        )}

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full py-2.5 text-sm font-medium text-red-600 glass-chip rounded-xl hover:bg-red-50/50 transition-colors"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
