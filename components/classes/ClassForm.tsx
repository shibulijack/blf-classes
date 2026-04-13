"use client";

import { useState, useTransition, useRef } from "react";
import { CATEGORIES, DAYS_OF_WEEK, AGE_GROUPS, TIME_OPTIONS } from "@/lib/constants";
import { createClass, updateClass } from "@/lib/classes/actions";
import { uploadClassImage } from "@/lib/classes/image";
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
  const [days, setDays] = useState<string[]>(classData?.day_of_week || []);
  const existingTime = parseTimeSlot(classData?.time_slot || null);
  const [startTime, setStartTime] = useState(existingTime.start);
  const [endTime, setEndTime] = useState(existingTime.end);
  const [location, setLocation] = useState(classData?.location || "");

  // Step 2 — optional fields
  const [category, setCategory] = useState<Category>(classData?.category || "other");
  const [description, setDescription] = useState(classData?.description || "");
  const [ageGroup, setAgeGroup] = useState(classData?.age_group || "");
  const [tutorName, setTutorName] = useState(classData?.tutor_name || "");
  const [tutorContact, setTutorContact] = useState(classData?.tutor_contact || "");
  const [fee, setFee] = useState(classData?.fee || "");
  const [maxStudents, setMaxStudents] = useState(classData?.max_students?.toString() || "");
  const [imageUrl, setImageUrl] = useState(classData?.image_url || "");
  const [imagePreview, setImagePreview] = useState(classData?.image_url || "");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  async function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be under 5MB.");
      return;
    }

    // Show preview immediately
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
    setError("");
    setUploading(true);

    const formData = new FormData();
    formData.append("image", file);

    const result = await uploadClassImage(formData);
    setUploading(false);

    if (result.error) {
      setError(result.error);
      setImagePreview(imageUrl); // revert to previous
    } else if (result.url) {
      setImageUrl(result.url);
      setImagePreview(result.url);
    }
  }

  function removeImage() {
    setImageUrl("");
    setImagePreview("");
    if (fileInputRef.current) fileInputRef.current.value = "";
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
      image_url: imageUrl,
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
    "w-full px-4 py-3 glass-input rounded-xl focus:outline-none text-sm";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1.5";

  const startIdx = TIME_OPTIONS.indexOf(startTime);

  return (
    <div>
      <PageHeader
        title={isEdit ? "Edit Class" : "Add Class"}
        showBack={isEdit}
      />

      {!isEdit && (
        <div className="px-4 pt-4 flex items-center gap-2">
          <div className={`h-1 flex-1 rounded-full ${step >= 1 ? "bg-blue-600" : "bg-gray-200"}`} />
          <div className={`h-1 flex-1 rounded-full ${step >= 2 ? "bg-blue-600" : "bg-gray-200"}`} />
        </div>
      )}

      <div className="px-4 py-6 space-y-5">
        {(isEdit || step === 1) && (
          <>
            {!isEdit && (
              <p className="text-sm text-gray-500">Basic details about the class</p>
            )}

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
                        : "glass-chip text-gray-600"
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

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

            {/* Image upload */}
            <div>
              <label className={labelClass}>Photo</label>
              {imagePreview ? (
                <div className="relative w-full h-40 rounded-xl overflow-hidden bg-gray-100">
                  <img
                    src={imagePreview}
                    alt="Class preview"
                    className="w-full h-full object-cover"
                  />
                  {uploading && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <span className="text-white text-sm font-medium">Uploading...</span>
                    </div>
                  )}
                  {!uploading && (
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-2 right-2 w-7 h-7 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-28 border-2 border-dashed border-white/40 rounded-xl flex flex-col items-center justify-center gap-1 text-gray-400 glass-chip hover:border-blue-300/50 hover:text-blue-500 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.41a2.25 2.25 0 013.182 0l2.909 2.91m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                  </svg>
                  <span className="text-xs">Add a photo</span>
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageSelect}
                className="hidden"
              />
            </div>

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
                        : "glass-chip text-gray-600"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

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
                        : "glass-chip text-gray-600"
                    }`}
                  >
                    {ag}
                  </button>
                ))}
              </div>
            </div>

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
            disabled={isPending || uploading}
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
