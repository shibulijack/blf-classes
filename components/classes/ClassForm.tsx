"use client";

import { useState, useTransition } from "react";
import { CATEGORIES, DAYS_OF_WEEK, AGE_GROUPS, TIME_OPTIONS } from "@/lib/constants";
import { createClass, updateClass } from "@/lib/classes/actions";
import { Class, Category } from "@/lib/types";
import { PageHeader } from "@/components/layout/PageHeader";

interface ClassFormProps {
  mode: "create" | "edit";
  classData?: Class;
}

function parseTimeSlot(timeSlot: string | null): { start: string; end: string } {
  if (!timeSlot) return { start: "", end: "" };
  const parts = timeSlot.split(" - ");
  return { start: parts[0]?.trim() || "", end: parts[1]?.trim() || "" };
}

export function ClassForm({ mode, classData }: ClassFormProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [step, setStep] = useState(1);

  // Step 1 — mandatory fields
  const [title, setTitle] = useState(classData?.title || "");
  const [category, setCategory] = useState<Category>(classData?.category || "other");
  const [days, setDays] = useState<string[]>(classData?.day_of_week || []);
  const existingTime = parseTimeSlot(classData?.time_slot || null);
  const [startTime, setStartTime] = useState(existingTime.start);
  const [endTime, setEndTime] = useState(existingTime.end);
  const [location, setLocation] = useState(classData?.location || "");

  // Step 2 — optional fields
  const [description, setDescription] = useState(classData?.description || "");
  const [ageGroup, setAgeGroup] = useState(classData?.age_group || "");
  const [tutorName, setTutorName] = useState(classData?.tutor_name || "");
  const [tutorContact, setTutorContact] = useState(classData?.tutor_contact || "");
  const [fee, setFee] = useState(classData?.fee || "");
  const [maxStudents, setMaxStudents] = useState(classData?.max_students?.toString() || "");

  // In edit mode, show both steps together
  const isEdit = mode === "edit";

  function toggleDay(day: string) {
    setDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  }

  function validateStep1(): string | null {
    if (!title.trim()) return "Class title is required";
    if (days.length === 0) return "Select at least one day";
    if (!startTime || !endTime) return "Select start and end time";
    if (!location.trim()) return "Location is required";
    return null;
  }

  function handleNext() {
    const err = validateStep1();
    if (err) {
      setError(err);
      return;
    }
    setError("");
    setStep(2);
  }

  function handleSubmit() {
    const err = validateStep1();
    if (err) {
      setError(err);
      return;
    }
    setError("");

    const timeSlot = startTime && endTime ? `${startTime} - ${endTime}` : "";

    const formData = {
      title,
      description,
      category,
      day_of_week: days,
      time_slot: timeSlot,
      age_group: ageGroup,
      location,
      tutor_name: tutorName,
      tutor_contact: tutorContact,
      fee,
      max_students: maxStudents,
    };

    startTransition(async () => {
      const result =
        isEdit && classData
          ? await updateClass(classData.id, formData)
          : await createClass(formData);
      if (result?.error) setError(result.error);
    });
  }

  const inputClass =
    "w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 text-sm";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1.5";

  // Get the index of startTime to filter endTime options
  const startIdx = TIME_OPTIONS.indexOf(startTime);

  return (
    <div>
      <PageHeader
        title={isEdit ? "Edit Class" : "Add Class"}
        showBack
      />

      {/* Step indicator for create mode */}
      {!isEdit && (
        <div className="px-4 pt-4 flex items-center gap-2">
          <div className={`h-1 flex-1 rounded-full ${step >= 1 ? "bg-blue-600" : "bg-gray-200"}`} />
          <div className={`h-1 flex-1 rounded-full ${step >= 2 ? "bg-blue-600" : "bg-gray-200"}`} />
        </div>
      )}

      <div className="px-4 py-6 space-y-5">
        {/* STEP 1: Mandatory fields — always shown in edit mode, shown on step 1 in create mode */}
        {(isEdit || step === 1) && (
          <>
            {!isEdit && (
              <p className="text-sm text-gray-500">Basic details about the class</p>
            )}

            {/* Title */}
            <div>
              <label className={labelClass}>
                Class Title <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Bharatanatyam for Kids"
                autoFocus
                className={inputClass}
              />
            </div>

            {/* Days */}
            <div>
              <label className={labelClass}>
                Days <span className="text-red-400">*</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {DAYS_OF_WEEK.map((d) => (
                  <button
                    key={d.value}
                    type="button"
                    onClick={() => toggleDay(d.value)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      days.includes(d.value)
                        ? "bg-gray-900 text-white"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Time Range */}
            <div>
              <label className={labelClass}>
                Time <span className="text-red-400">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <select
                  value={startTime}
                  onChange={(e) => {
                    setStartTime(e.target.value);
                    if (endTime) {
                      const newStartIdx = TIME_OPTIONS.indexOf(e.target.value);
                      const endIdx = TIME_OPTIONS.indexOf(endTime);
                      if (endIdx <= newStartIdx) setEndTime("");
                    }
                  }}
                  className={inputClass}
                >
                  <option value="">From</option>
                  {TIME_OPTIONS.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                <select
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className={inputClass}
                >
                  <option value="">To</option>
                  {TIME_OPTIONS
                    .filter((_, i) => startIdx === -1 || i > startIdx)
                    .map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                </select>
              </div>
            </div>

            {/* Location */}
            <div>
              <label className={labelClass}>
                Location <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., Clubhouse Hall 2"
                className={inputClass}
              />
            </div>
          </>
        )}

        {/* STEP 2: Optional fields — always shown in edit mode, shown on step 2 in create mode */}
        {(isEdit || step === 2) && (
          <>
            {!isEdit && (
              <div>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium mb-2"
                >
                  &larr; Back to basics
                </button>
                <p className="text-sm text-gray-500">Additional details (all optional)</p>
              </div>
            )}

            {/* Category */}
            <div>
              <label className={labelClass}>Category</label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setCategory(cat.value)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      category === cat.value
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Age Group */}
            <div>
              <label className={labelClass}>Age Group</label>
              <div className="flex flex-wrap gap-2">
                {AGE_GROUPS.map((ag) => (
                  <button
                    key={ag}
                    type="button"
                    onClick={() => setAgeGroup(ageGroup === ag ? "" : ag)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      ageGroup === ag
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {ag}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className={labelClass}>Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tell others about this class..."
                rows={3}
                className={inputClass}
              />
            </div>

            {/* Tutor */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Tutor Name</label>
                <input
                  type="text"
                  value={tutorName}
                  onChange={(e) => setTutorName(e.target.value)}
                  placeholder="Name"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Contact</label>
                <input
                  type="text"
                  value={tutorContact}
                  onChange={(e) => setTutorContact(e.target.value)}
                  placeholder="Phone / Telegram"
                  className={inputClass}
                />
              </div>
            </div>

            {/* Fee & Max Students */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Monthly Fees</label>
                <input
                  type="text"
                  value={fee}
                  onChange={(e) => setFee(e.target.value)}
                  placeholder="e.g., Rs. 2000"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Max Students</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={maxStudents}
                  onChange={(e) => setMaxStudents(e.target.value.replace(/\D/g, ""))}
                  placeholder="No limit"
                  className={inputClass}
                />
              </div>
            </div>
          </>
        )}

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Buttons */}
        {!isEdit && step === 1 && (
          <div className="space-y-3">
            <button
              type="button"
              onClick={handleNext}
              className="w-full py-3 px-4 bg-blue-600 text-white font-semibold rounded-xl
                hover:bg-blue-700 active:bg-blue-800 transition-colors"
            >
              Next: Add Details
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isPending}
              className="w-full py-3 px-4 text-blue-600 font-medium rounded-xl border border-blue-200
                hover:bg-blue-50 active:bg-blue-100 disabled:text-gray-400 disabled:border-gray-200
                transition-colors text-sm"
            >
              {isPending ? "Creating..." : "Skip & Add Class"}
            </button>
          </div>
        )}

        {(isEdit || step === 2) && (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isPending}
            className="w-full py-3 px-4 bg-blue-600 text-white font-semibold rounded-xl
              hover:bg-blue-700 active:bg-blue-800 disabled:bg-gray-300 disabled:cursor-not-allowed
              transition-colors"
          >
            {isPending
              ? isEdit ? "Saving..." : "Creating..."
              : isEdit ? "Save Changes" : "Add Class"}
          </button>
        )}
      </div>
    </div>
  );
}
