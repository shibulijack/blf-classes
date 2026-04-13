"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { PinInput } from "./PinInput";

type Step = "apartment" | "pick-profile" | "pin" | "register" | "forgot-pin";

interface Profile {
  id: string;
  name: string;
}

export function AuthForm() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("apartment");
  const [apartment, setApartment] = useState("");
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function resetToApartment() {
    setStep("apartment");
    setPin("");
    setConfirmPin("");
    setDisplayName("");
    setError("");
    setSelectedProfile(null);
    setProfiles([]);
  }

  async function handleApartmentSubmit(e: FormEvent) {
    e.preventDefault();
    if (!apartment.trim()) return;
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apartment: apartment.trim() }),
      });
      const data = await res.json();

      setProfiles(data.profiles || []);

      if (!data.exists) {
        // No profiles at all — go straight to register
        setStep("register");
      } else if (data.profiles.length === 1) {
        // Single profile — go straight to PIN
        setSelectedProfile(data.profiles[0]);
        setStep("pin");
      } else {
        // Multiple profiles — let user pick or add new
        setStep("pick-profile");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handlePickProfile(profile: Profile) {
    setSelectedProfile(profile);
    setPin("");
    setError("");
    setStep("pin");
  }

  function handleAddNewProfile() {
    setSelectedProfile(null);
    setPin("");
    setConfirmPin("");
    setDisplayName("");
    setError("");
    setStep("register");
  }

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    if (pin.length !== 4 || !selectedProfile) return;
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          residentId: selectedProfile.id,
          apartment,
          pin,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        router.push("/classes");
      } else {
        setError(data.error);
        setPin("");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(e: FormEvent) {
    e.preventDefault();
    if (!displayName.trim()) {
      setError("Name is required");
      return;
    }
    if (pin.length !== 4) {
      setError("Please enter a 4-digit PIN");
      return;
    }
    if (pin !== confirmPin) {
      setError("PINs don't match");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apartment, pin, displayName }),
      });
      const data = await res.json();
      if (res.ok) {
        router.push("/classes");
      } else {
        setError(data.error);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-sm mx-auto">
      {step === "apartment" && (
        <form onSubmit={handleApartmentSubmit} className="space-y-6">
          <div>
            <label htmlFor="apartment" className="block text-sm font-medium text-gray-700 mb-2">
              Apartment Number
            </label>
            <input
              id="apartment"
              type="text"
              value={apartment}
              onChange={(e) => setApartment(e.target.value.toUpperCase())}
              placeholder="e.g., M051"
              autoFocus
              autoComplete="off"
              className="w-full px-4 py-3 text-lg glass-input rounded-xl
                focus:outline-none uppercase placeholder:normal-case placeholder:text-gray-400"
            />
          </div>
          <button
            type="submit"
            disabled={!apartment.trim() || loading}
            className="w-full py-3 px-4 bg-blue-600 text-white font-semibold rounded-xl
              hover:bg-blue-700 active:bg-blue-800 disabled:bg-gray-300 disabled:cursor-not-allowed
              transition-colors"
          >
            {loading ? "Checking..." : "Continue"}
          </button>
        </form>
      )}

      {step === "pick-profile" && (
        <div className="space-y-5">
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-1">Who&apos;s logging in?</p>
            <p className="text-lg font-bold text-gray-900">{apartment}</p>
          </div>
          <div className="space-y-2">
            {profiles.map((profile) => (
              <button
                key={profile.id}
                onClick={() => handlePickProfile(profile)}
                className="w-full flex items-center gap-3 px-4 py-3 glass-card rounded-xl
                  hover:bg-white/80 active:bg-white/90 transition-all text-left"
              >
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                  <span className="text-blue-600 font-semibold text-sm">
                    {profile.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="font-medium text-gray-900">{profile.name}</span>
              </button>
            ))}
          </div>
          <button
            onClick={handleAddNewProfile}
            className="w-full flex items-center justify-center gap-2 py-3 text-sm font-medium
              text-blue-600 border-2 border-dashed border-blue-300/50 rounded-xl
              hover:bg-blue-50/50 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add another person
          </button>
          <button
            type="button"
            onClick={resetToApartment}
            className="w-full py-2 text-sm text-gray-500 hover:text-gray-700"
          >
            Use a different apartment
          </button>
        </div>
      )}

      {step === "pin" && selectedProfile && (
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-1">Welcome back</p>
            <p className="text-lg font-bold text-gray-900">{selectedProfile.name}</p>
            <p className="text-sm text-gray-400">{apartment}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
              Enter your PIN
            </label>
            <PinInput value={pin} onChange={setPin} disabled={loading} />
          </div>
          <button
            type="submit"
            disabled={pin.length !== 4 || loading}
            className="w-full py-3 px-4 bg-blue-600 text-white font-semibold rounded-xl
              hover:bg-blue-700 active:bg-blue-800 disabled:bg-gray-300 disabled:cursor-not-allowed
              transition-colors"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
          <button
            type="button"
            onClick={() => { setStep("forgot-pin"); setPin(""); setError(""); }}
            className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Forgot PIN?
          </button>
          <div className="flex items-center justify-center gap-3 text-sm">
            {profiles.length > 1 ? (
              <button
                type="button"
                onClick={() => { setStep("pick-profile"); setPin(""); setError(""); }}
                className="text-gray-500 hover:text-gray-700"
              >
                Switch person
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleAddNewProfile}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Not you? Add another person
                </button>
                <span className="text-gray-300">|</span>
                <button
                  type="button"
                  onClick={resetToApartment}
                  className="text-gray-500 hover:text-gray-700"
                >
                  Change apartment
                </button>
              </>
            )}
          </div>
        </form>
      )}

      {step === "register" && (
        <form onSubmit={handleRegister} className="space-y-5">
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-1">
              {profiles.length > 0 ? "Add new person" : "New registration"}
            </p>
            <p className="text-lg font-bold text-gray-900">{apartment}</p>
          </div>
          <div>
            <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-2">
              Your Name <span className="text-red-400">*</span>
            </label>
            <input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="How others will see you"
              autoFocus
              className="w-full px-4 py-3 glass-input rounded-xl
                focus:outline-none placeholder:text-gray-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
              Set a 4-digit PIN
            </label>
            <PinInput value={pin} onChange={setPin} disabled={loading} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
              Confirm PIN
            </label>
            <PinInput value={confirmPin} onChange={setConfirmPin} disabled={loading} />
          </div>
          <button
            type="submit"
            disabled={pin.length !== 4 || confirmPin.length !== 4 || !displayName.trim() || loading}
            className="w-full py-3 px-4 bg-blue-600 text-white font-semibold rounded-xl
              hover:bg-blue-700 active:bg-blue-800 disabled:bg-gray-300 disabled:cursor-not-allowed
              transition-colors"
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
          <button
            type="button"
            onClick={() => {
              if (profiles.length > 0) {
                setStep("pick-profile");
                setPin("");
                setConfirmPin("");
                setDisplayName("");
                setError("");
              } else {
                resetToApartment();
              }
            }}
            className="w-full py-2 text-sm text-gray-500 hover:text-gray-700"
          >
            {profiles.length > 0 ? "Back to profiles" : "Use a different apartment"}
          </button>
        </form>
      )}

      {step === "forgot-pin" && (
        <div className="space-y-5">
          <div className="text-center">
            <p className="text-lg font-bold text-gray-900">Forgot your PIN?</p>
            <p className="text-sm text-gray-400 mt-1">{apartment}</p>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800 space-y-2">
            {profiles.length > 1 ? (
              <>
                <p className="font-medium">Ask a household member for help</p>
                <p>
                  Another person at {apartment} can reset your PIN from their
                  <span className="font-medium"> Profile &rarr; Reset Household Member&apos;s PIN</span>.
                </p>
              </>
            ) : (
              <>
                <p className="font-medium">Contact the community admin</p>
                <p>
                  Since you&apos;re the only profile at {apartment}, please reach out to the
                  community admin to get your PIN reset.
                </p>
              </>
            )}
          </div>
          <button
            type="button"
            onClick={() => { setStep("pin"); setError(""); }}
            className="w-full py-3 px-4 bg-blue-600 text-white font-semibold rounded-xl
              hover:bg-blue-700 active:bg-blue-800 transition-colors"
          >
            Back to Login
          </button>
          <button
            type="button"
            onClick={resetToApartment}
            className="w-full py-2 text-sm text-gray-500 hover:text-gray-700"
          >
            Use a different apartment
          </button>
        </div>
      )}

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 text-center">
          {error}
        </div>
      )}
    </div>
  );
}
