"use client";
import React, { useState } from "react";
import { submitDebateRegistration } from "./actions";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
const getWordCount = (text: string) => text.trim() ? text.trim().split(/\s+/).length : 0;

function damerauLevenshtein(a: string, b: string): number {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  const matrix = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
  for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
  for (let j = 0; j <= b.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      let cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        matrix[i][j] = Math.min(matrix[i][j], matrix[i - 2][j - 2] + cost);
      }
    }
  }
  return matrix[a.length][b.length];
}

function suggestEmailCorrection(email: string): string | null {
  if (!email || !email.includes("@")) return null;
  const [user, domain] = email.split("@");
  if (!domain || domain.length < 4) return null;

  const COMMON_DOMAINS = ["gmail.com", "yahoo.com", "ymail.com", "hotmail.com", "outlook.com", "icloud.com", "aol.com", "live.com", "msn.com"];
  if (COMMON_DOMAINS.includes(domain.toLowerCase())) return null;

  for (const common of COMMON_DOMAINS) {
    const dist = damerauLevenshtein(domain.toLowerCase(), common);
    const maxDist = common.length >= 8 ? 3 : 2;
    if (dist > 0 && dist <= maxDist) {
      return `${user}@${common}`;
    }
  }
  return null;
}

export default function DebatePage() {
  const [formData, setFormData] = useState({
    fullName: "",
    age: "",
    contactNumber: "",
    email: "",
    likedFilm: "",
    likedReason: "",
    dislikedReason: "",
    inHyderabad: "",
    discussPart: "",
    okayFilmed: "",
    socialHandles: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countryCode, setCountryCode] = useState("91");

  const [socialHandleEntries, setSocialHandleEntries] = useState<{ platform: string; handle: string }[]>([
    { platform: "X/Twitter", handle: "" },
  ]);

  const handleSocialChange = (index: number, field: "platform" | "handle", value: string) => {
    const newEntries = [...socialHandleEntries];
    newEntries[index][field] = value;
    setSocialHandleEntries(newEntries);
    setFormData((prev) => ({
      ...prev,
      socialHandles: newEntries
        .filter((e) => e.handle)
        .map((e) => {
          let prefix = "";
          if (e.platform === "X/Twitter" || e.platform === "Instagram") prefix = "@";
          else if (e.platform === "Reddit") prefix = "u/";
          return `${e.platform}: ${prefix}${e.handle}`;
        })
        .join(", "),
    }));
  };

  const addSocialEntry = () => {
    if (socialHandleEntries.some(e => !e.handle.trim())) return;
    const platforms = ["X/Twitter", "Instagram", "Reddit"];
    const usedPlatforms = socialHandleEntries.map(e => e.platform);
    const availablePlatforms = platforms.filter(p => !usedPlatforms.includes(p));
    const nextPlatform = availablePlatforms.length > 0 ? availablePlatforms[0] : platforms[0];
    setSocialHandleEntries([...socialHandleEntries, { platform: nextPlatform, handle: "" }]);
  };

  const removeSocialEntry = (index: number) => {
    const newEntries = socialHandleEntries.filter((_, i) => i !== index);
    setSocialHandleEntries(newEntries);
    setFormData((prev) => ({
      ...prev,
      socialHandles: newEntries
        .filter((e) => e.handle)
        .map((e) => {
          let prefix = "";
          if (e.platform === "X/Twitter" || e.platform === "Instagram") prefix = "@";
          else if (e.platform === "Reddit") prefix = "u/";
          return `${e.platform}: ${prefix}${e.handle}`;
        })
        .join(", "),
    }));
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    let value = e.target.value;
    if (e.target.name === "contactNumber") {
      value = value.replace(/\D/g, "").slice(0, 10);
    } else if (e.target.name === "age") {
      value = value.replace(/\D/g, "").replace(/^0+/, "").slice(0, 2);
    }
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleRadioChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: prev[name as keyof typeof prev] === value ? "" : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email.includes("@")) {
      setError("Please enter a valid email address containing '@'.");
      return;
    }

    if (formData.contactNumber.length !== 10) {
      setError("Contact number must be exactly 10 digits.");
      return;
    }

    if (getWordCount(formData.likedReason) > 500 || getWordCount(formData.dislikedReason) > 500 || getWordCount(formData.discussPart) > 500) {
      setError("Please ensure your answers are under 500 words before submitting.");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const payload = { ...formData, contactNumber: `+${countryCode} ${formData.contactNumber}` };
      const response = await submitDebateRegistration(payload);
      if (response.success) {
        setIsSuccess(true);
      } else {
        setError(response.error || "An error occurred during submission.");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4 relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#d4af37]/5 rounded-full blur-[120px] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 mx-auto flex max-w-md w-full flex-col items-center text-center p-8 rounded-2xl border border-white/5 bg-zinc-950/80 backdrop-blur-xl shadow-2xl"
        >
          <div className="w-16 h-16 rounded-full bg-[#d4af37]/10 flex items-center justify-center mb-6">
            <svg className="w-8 h-8 text-[#d4af37]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold tracking-tight text-white mb-3">
            Registration Complete
          </h2>
          <p className="text-sm text-zinc-400 mb-8 leading-relaxed">
            Thank you for registering for the Rao Bahadur open discussion.
            Selected participants will be contacted soon.
          </p>
          <div className="flex flex-col gap-4 w-full mt-2">
            <Link
              href="/"
              className="w-full flex-1 rounded-full bg-[#d4af37] px-4 py-3 text-sm font-bold text-black hover:bg-[#c4a130] transition-colors text-center"
            >
              Back to Home
            </Link>
            <button
              onClick={() => window.location.reload()}
              className="text-[#d4af37] hover:text-[#c4a130] text-sm font-medium hover:underline transition-all"
            >
              Submit another response
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  const RadioGroup = ({ name, options, label, required = true, icons }: { name: string, options: string[], label: string, required?: boolean, icons?: Record<string, (isSelected: boolean) => React.ReactNode> }) => (
    <div className="space-y-3">
      <label className="block text-xs font-medium text-zinc-400 tracking-normal">{label} {required && "*"}</label>
      <div className="flex gap-3">
        {options.map((option) => {
          const isSelected = formData[name as keyof typeof formData] === option;
          return (
            <button
              key={option}
              type="button"
              onClick={() => handleRadioChange(name, option)}
              className={`flex-1 py-3 px-4 rounded-xl border text-sm font-medium transition-all duration-200 flex items-center justify-center ${isSelected
                ? "border-[#d4af37] bg-[#d4af37]/10 text-[#d4af37]"
                : "border-white/10 bg-zinc-900/30 text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
                }`}
            >
              {icons && icons[option] && (
                <span className="w-5 h-5 mr-2 flex items-center justify-center transition-colors">
                  {icons[option](isSelected)}
                </span>
              )}
              {option}
            </button>
          );
        })}
      </div>
      {/* Hidden input to enforce required validation */}
      {required && (
        <input
          type="radio"
          name={name}
          required
          checked={!!formData[name as keyof typeof formData]}
          onChange={() => { }}
          className="opacity-0 absolute -z-10 w-0 h-0"
        />
      )}
    </div>
  );

  return (
    <div className="min-h-screen relative selection:bg-[#d4af37]/30">

      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">

        {/* Header */}
        <div className="mb-12 mt-12 md:mt-20">
          <h1 className="text-4xl md:text-5xl font-serif font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-zinc-400 mb-6">
            Rao Bahadur <br /><span className="text-[#d4af37]">Open Debate</span>
          </h1>
          <div className="text-zinc-400 leading-relaxed max-w-2xl text-sm md:text-base space-y-4">
            <p>
              Whether you loved it, hated it, or have mixed feelings, we want to hear from you.
            </p>
            <p>
              Register to join an open discussion with the team behind the film.
            </p>
            <p className="text-[#d4af37] font-medium border-l-2 border-[#d4af37] pl-3 py-1 bg-[#d4af37]/5 rounded-r-lg">
              Selected participants will be contacted with event details.
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              {error}
            </div>
          )}

          <div className="bg-zinc-950/50 backdrop-blur-md border border-white/5 rounded-3xl p-6 md:p-10 space-y-8 shadow-2xl">



            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {/* 2. Full Name */}
              <div className="space-y-2">
                <label className="block text-xs font-medium text-zinc-400 tracking-normal">Full name *</label>
                <input required type="text" name="fullName" value={formData.fullName} onChange={handleChange}
                  className="w-full rounded-xl border border-white/10 bg-zinc-900/30 px-4 py-3 text-sm text-white placeholder-zinc-600 focus:border-[#d4af37] focus:bg-zinc-900/80 focus:outline-none focus:ring-1 focus:ring-[#d4af37] transition-all"
                  placeholder="Enter your name" />
              </div>

              {/* 3. Age */}
              <div className="space-y-2">
                <label className="block text-xs font-medium text-zinc-400 tracking-normal">Age *</label>
                <input required type="text" name="age" value={formData.age} onChange={handleChange} maxLength={2}
                  className="w-full rounded-xl border border-white/10 bg-zinc-900/30 px-4 py-3 text-sm text-white placeholder-zinc-600 focus:border-[#d4af37] focus:bg-zinc-900/80 focus:outline-none focus:ring-1 focus:ring-[#d4af37] transition-all"
                  placeholder="e.g. 25" />
              </div>

              {/* 4. Contact Number */}
              <div className="space-y-2">
                <label className="block text-xs font-medium text-zinc-400 tracking-normal">Contact number *</label>
                <div className="w-full flex items-center rounded-xl border border-white/10 bg-zinc-900/30 focus-within:border-[#d4af37] focus-within:bg-zinc-900/80 focus-within:ring-1 focus-within:ring-[#d4af37] transition-all overflow-hidden">
                  <span className="pl-4 text-zinc-500 font-medium">+</span>
                  <input
                    type="text"
                    name="countryCode"
                    id="countryCode"
                    autoComplete="tel-country-code"
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value.replace(/\D/g, '').slice(0, 3))}
                    className="w-10 bg-transparent pr-1 py-3 text-sm text-zinc-500 font-medium focus:outline-none"
                  />
                  <input required type="tel" name="contactNumber" id="contactNumber" value={formData.contactNumber} onChange={handleChange} maxLength={10}
                    className="w-full bg-transparent px-2 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none border-l border-white/10"
                    placeholder="0000000000"
                    autoComplete="tel-national" />
                </div>
              </div>

              {/* 5. Email Address */}
              <div className="space-y-2">
                <label className="block text-xs font-medium text-zinc-400 tracking-normal">Email address *</label>
                <input required type="email" name="email" value={formData.email} onChange={handleChange}
                  className="w-full rounded-xl border border-white/10 bg-zinc-900/30 px-4 py-3 text-sm text-white placeholder-zinc-600 focus:border-[#d4af37] focus:bg-zinc-900/80 focus:outline-none focus:ring-1 focus:ring-[#d4af37] transition-all"
                  placeholder="you@example.com" />
                {suggestEmailCorrection(formData.email) && (
                  <p className="text-xs text-[#d4af37]">
                    Did you mean <button type="button" onClick={() => setFormData({ ...formData, email: suggestEmailCorrection(formData.email)! })} className="font-bold underline hover:text-white transition-colors">{suggestEmailCorrection(formData.email)}</button>?
                  </p>
                )}
              </div>
            </div>

            {/* 6. Did you like the film? */}
            <RadioGroup
              name="likedFilm"
              options={["Yes", "No"]}
              label="Did you like the film?"
              icons={{
                "Yes": (isSelected) => (
                  <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" fill={isSelected ? "currentColor" : "none"} viewBox="0 0 24 24"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 22V11m-5 2v7a2 2 0 0 0 2 2h13.426a3 3 0 0 0 2.965-2.544l1.077-7A3 3 0 0 0 18.503 9H15a1 1 0 0 1-1-1V4.466A2.466 2.466 0 0 0 11.534 2a.82.82 0 0 0-.75.488l-3.52 7.918A1 1 0 0 1 6.35 11H4a2 2 0 0 0-2 2" /></svg>
                ),
                "No": (isSelected) => (
                  <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" fill={isSelected ? "currentColor" : "none"} viewBox="0 0 24 24"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 2v11m5-3.2V5.2c0-1.12 0-1.68-.218-2.108a2 2 0 0 0-.874-.874C20.48 2 19.92 2 18.8 2H8.118c-1.461 0-2.192 0-2.782.267A3 3 0 0 0 4.06 3.361c-.354.542-.465 1.265-.687 2.71l-.523 3.4c-.293 1.904-.44 2.857-.157 3.598a3 3 0 0 0 1.32 1.539C4.704 15 5.667 15 7.595 15H8.4c.56 0 .84 0 1.054.109a1 1 0 0 1 .437.437c.11.214.11.494.11 1.054v2.934A2.466 2.466 0 0 0 12.465 22a.82.82 0 0 0 .751-.488l3.36-7.562c.154-.344.23-.516.35-.642a1 1 0 0 1 .384-.249c.164-.059.352-.059.729-.059h.76c1.12 0 1.68 0 2.108-.218a2 2 0 0 0 .874-.874C22 11.48 22 10.92 22 9.8" /></svg>
                )
              }}
            />

            {/* 7. What did you like about the film? */}
            <div className="space-y-2">
              <label className="block text-xs font-medium text-zinc-400 tracking-normal">In one sentence, what did you like about the film? *</label>
              <textarea required name="likedReason" value={formData.likedReason} onChange={handleChange} rows={4}
                className={`w-full rounded-xl border bg-zinc-900/30 px-4 py-3 text-sm text-white placeholder-zinc-600 focus:bg-zinc-900/80 focus:outline-none focus:ring-1 transition-all resize-none ${getWordCount(formData.likedReason) > 500 ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-white/10 focus:border-[#d4af37] focus:ring-[#d4af37]'}`}
                placeholder="Your thoughts..."></textarea>
              {getWordCount(formData.likedReason) > 500 && (
                <p className="text-xs text-red-500">Exceeded 500 words, please reduce the content</p>
              )}
            </div>

            {/* 8. What did you not like about Rao Bahadur? */}
            <div className="space-y-2">
              <label className="block text-xs font-medium text-zinc-400 tracking-normal">In one sentence, what did you not like about Rao Bahadur? *</label>
              <textarea required name="dislikedReason" value={formData.dislikedReason} onChange={handleChange} rows={4}
                className={`w-full rounded-xl border bg-zinc-900/30 px-4 py-3 text-sm text-white placeholder-zinc-600 focus:bg-zinc-900/80 focus:outline-none focus:ring-1 transition-all resize-none ${getWordCount(formData.dislikedReason) > 500 ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-white/10 focus:border-[#d4af37] focus:ring-[#d4af37]'}`}
                placeholder="Your thoughts..."></textarea>
              {getWordCount(formData.dislikedReason) > 500 && (
                <p className="text-xs text-red-500">Exceeded 500 words, please reduce the content</p>
              )}
            </div>

            {/* 9. Are you in Hyderabad? */}
            <RadioGroup name="inHyderabad" options={["Yes", "No"]} label="Are you in Hyderabad?" />

            {/* 10. Which part of the film would you like to discuss about? */}
            <div className="space-y-2">
              <label className="block text-xs font-medium text-zinc-400 tracking-normal">Which part of the film would you like to discuss about? *</label>
              <textarea required name="discussPart" value={formData.discussPart} onChange={handleChange} rows={4}
                className={`w-full rounded-xl border bg-zinc-900/30 px-4 py-3 text-sm text-white placeholder-zinc-600 focus:bg-zinc-900/80 focus:outline-none focus:ring-1 transition-all resize-none ${getWordCount(formData.discussPart) > 500 ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-white/10 focus:border-[#d4af37] focus:ring-[#d4af37]'}`}
                placeholder="Specific scene, character, or theme..."></textarea>
              {getWordCount(formData.discussPart) > 500 && (
                <p className="text-xs text-red-500">Exceeded 500 words, please reduce the content</p>
              )}
            </div>

            {/* 11. Are you okay being filmed? */}
            <RadioGroup name="okayFilmed" options={["Yes", "No"]} label="Are you okay being filmed and telecasted across various media platforms?" />

            {/* 12. Social Media Handles */}
            <div className="space-y-4">
              <label className="block text-xs font-medium text-zinc-400 tracking-normal">Social media handles *</label>

              {socialHandleEntries.map((entry, idx) => (
                <div key={idx} className="flex gap-3">
                  <select
                    value={entry.platform}
                    onChange={(e) => handleSocialChange(idx, 'platform', e.target.value)}
                    className="w-1/3 rounded-xl border border-white/10 bg-zinc-900/30 px-3 py-3 text-sm text-white focus:border-[#d4af37] focus:bg-zinc-900/80 focus:outline-none focus:ring-1 focus:ring-[#d4af37] transition-all"
                  >
                    <option value="X/Twitter">X/Twitter</option>
                    <option value="Instagram">Instagram</option>
                    <option value="Reddit">Reddit</option>
                  </select>
                  <div className="w-2/3 flex-1 flex items-center rounded-xl border border-white/10 bg-zinc-900/30 focus-within:border-[#d4af37] focus-within:bg-zinc-900/80 focus-within:ring-1 focus-within:ring-[#d4af37] transition-all overflow-hidden">
                    {(entry.platform === "X/Twitter" || entry.platform === "Instagram") && <span className="pl-4 text-zinc-500">@</span>}
                    {entry.platform === "Reddit" && <span className="pl-4 text-zinc-500">u/</span>}
                    <input
                      type="text"
                      value={entry.handle}
                      onChange={(e) => {
                        let val = e.target.value;
                        if (entry.platform === "Reddit") {
                          val = val.replace(/^u\//, '');
                        } else if (entry.platform === "X/Twitter" || entry.platform === "Instagram") {
                          val = val.replace(/^@/, '');
                        }
                        handleSocialChange(idx, 'handle', val);
                      }}
                      className="w-full bg-transparent px-2 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none"
                      placeholder="username"
                      required={idx === 0}
                    />
                  </div>
                  {socialHandleEntries.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSocialEntry(idx)}
                      className="px-3 text-zinc-500 hover:text-red-400"
                    >
                      <svg width="20" height="20" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  )}
                </div>
              ))}

              <button
                type="button"
                onClick={addSocialEntry}
                className="text-sm text-[#d4af37] flex items-center gap-1 hover:underline"
              >
                <svg width="16" height="16" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                Add another handle
              </button>
            </div>

          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full group relative overflow-hidden flex items-center justify-center gap-3 rounded-full bg-[#d4af37] px-8 py-4 text-sm font-bold text-black uppercase tracking-widest hover:bg-[#c4a130] disabled:opacity-50 disabled:hover:bg-[#d4af37] transition-all shadow-[0_0_40px_rgba(212,175,55,0.2)] hover:shadow-[0_0_40px_rgba(212,175,55,0.4)]"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Registering...
              </>
            ) : (
              <>
                <span>Register for Debate</span>
                <ArrowLeft className="w-4 h-4 rotate-180 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </button>

          <p className="text-center text-xs text-zinc-600">
            By submitting this form, you agree to the potential use of your responses for selection purposes.
          </p>

        </form>
      </div>
    </div>
  );
}
