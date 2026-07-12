"use client";

import React, { useState, useEffect } from "react";
import { BirthDetails } from "../../types";
import { useChat } from "../../hooks/useChat";
import { useAuth } from "../../hooks/useAuth";
import { api } from "../../lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

interface BirthDetailsFormProps {
  onSuccess?: () => void;
}

export function BirthDetailsForm({ onSuccess }: BirthDetailsFormProps) {
  const { birthDetails, updateBirthDetails } = useChat();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState<BirthDetails>({
    name: "",
    gender: "",
    date_of_birth: "",
    time_of_birth: "",
    place_of_birth: "",
    timezone: "Asia/Kolkata" // default fallback
  });

  const [savedProfiles, setSavedProfiles] = useState<any[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState<string>("");
  const [shouldSaveProfile, setShouldSaveProfile] = useState(false);
  const [profileLabel, setProfileLabel] = useState("Myself");

  const [isSaved, setIsSaved] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load saved profiles if authenticated
  useEffect(() => {
    if (user) {
      loadSavedProfiles();
    }
  }, [user]);

  const loadSavedProfiles = async () => {
    try {
      const data = await api.getBirthDetails();
      setSavedProfiles(data);
    } catch (err) {
      console.error("Failed to load saved profiles", err);
    }
  };

  // Sync state with Context values when loaded
  useEffect(() => {
    setFormData({
      name: birthDetails.name || "",
      gender: birthDetails.gender || "",
      date_of_birth: birthDetails.date_of_birth || "",
      time_of_birth: birthDetails.time_of_birth || "",
      place_of_birth: birthDetails.place_of_birth || "",
      timezone: birthDetails.timezone || "Asia/Kolkata"
    });
  }, [birthDetails]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear errors as user typing
    if (errors[name]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
  };

  const handleProfileSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const profileId = e.target.value;
    setSelectedProfileId(profileId);
    if (!profileId) return;
    const profile = savedProfiles.find(p => p.id === profileId);
    if (profile) {
      setFormData({
        name: profile.name || "",
        gender: profile.gender || "",
        date_of_birth: profile.date_of_birth || "",
        time_of_birth: profile.time_of_birth?.substring(0, 5) || "",
        place_of_birth: profile.place_of_birth || "",
        timezone: profile.timezone || "Asia/Kolkata"
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name || formData.name.trim().length === 0) {
      newErrors.name = "Name is required.";
    }
    
    if (!formData.date_of_birth) {
      newErrors.date_of_birth = "Date of birth is required.";
    } else {
      const parsedDate = new Date(formData.date_of_birth);
      if (isNaN(parsedDate.getTime())) {
        newErrors.date_of_birth = "Invalid date format.";
      } else if (parsedDate > new Date()) {
        newErrors.date_of_birth = "Birth date cannot be in the future.";
      }
    }

    if (!formData.time_of_birth) {
      newErrors.time_of_birth = "Time of birth is required.";
    } else {
      const timeRegex = /^(?:[01]\d|2[0-3]):[0-5]\d$/;
      if (!timeRegex.test(formData.time_of_birth)) {
        newErrors.time_of_birth = "Time must be in HH:MM format.";
      }
    }

    if (!formData.place_of_birth || formData.place_of_birth.trim().length === 0) {
      newErrors.place_of_birth = "Place of birth is required.";
    }

    if (shouldSaveProfile && (!profileLabel || profileLabel.trim().length === 0)) {
      newErrors.profileLabel = "Label is required to save profile.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    // Clean empty values out
    const cleanedData: BirthDetails = {};
    Object.entries(formData).forEach(([key, val]) => {
      if (val && val.trim() !== "") {
        cleanedData[key as keyof BirthDetails] = val.trim();
      }
    });

    // Update active chat context
    updateBirthDetails(cleanedData);

    // Save profile to database if requested
    if (user && shouldSaveProfile) {
      try {
        await api.saveBirthDetails({
          label: profileLabel.trim(),
          name: cleanedData.name,
          gender: cleanedData.gender,
          date_of_birth: cleanedData.date_of_birth,
          time_of_birth: cleanedData.time_of_birth,
          place_of_birth: cleanedData.place_of_birth,
          timezone: cleanedData.timezone
        });
        loadSavedProfiles();
      } catch (err) {
        console.error("Failed to save birth profile", err);
      }
    }

    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
    
    if (onSuccess) {
      onSuccess();
    }
  };

  return (
    <Card className="glass-panel w-full border-border/80">
      <CardHeader className="p-4 md:p-6 pb-2">
        <CardTitle className="text-lg md:text-xl text-accent font-display">Birth Chart Details</CardTitle>
        <CardDescription className="text-xs md:text-sm">
          Enter your birth details to generate highly personalized Vedic charts (Kundli) and predictions.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 md:p-6 pt-0">
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Quick Select Saved Profile Dropdown (Only visible if logged in and has saved profiles) */}
          {user && savedProfiles.length > 0 && (
            <div className="p-3 bg-secondary/20 border border-border/40 rounded-lg space-y-1.5">
              <label htmlFor="quick-profile" className="block text-xs font-semibold uppercase tracking-wider text-accent text-2xs">
                Quick Select Birth Profile
              </label>
              <select
                id="quick-profile"
                value={selectedProfileId}
                onChange={handleProfileSelect}
                className="flex h-9 w-full rounded-lg border border-border bg-card px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
              >
                <option value="">-- Choose an existing profile --</option>
                {savedProfiles.map((prof) => (
                  <option key={prof.id} value={prof.id}>
                    {prof.name} ({prof.label})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-xs font-semibold uppercase tracking-wider mb-1.5 text-mutedText">
                Full Name
              </label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Aarav Sharma"
              />
              {errors.name && <p className="text-rose-400 text-xs mt-1">{errors.name}</p>}
            </div>

            {/* Gender */}
            <div>
              <label htmlFor="gender" className="block text-xs font-semibold uppercase tracking-wider mb-1.5 text-mutedText">
                Gender
              </label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="flex h-10 w-full rounded-lg border border-border bg-card px-3 py-2 text-md text-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Date of Birth */}
            <div>
              <label htmlFor="date_of_birth" className="block text-xs font-semibold uppercase tracking-wider mb-1.5 text-mutedText">
                Date of Birth
              </label>
              <Input
                id="date_of_birth"
                name="date_of_birth"
                type="date"
                value={formData.date_of_birth}
                onChange={handleChange}
              />
              {errors.date_of_birth && <p className="text-rose-400 text-xs mt-1">{errors.date_of_birth}</p>}
            </div>

            {/* Time of Birth */}
            <div>
              <label htmlFor="time_of_birth" className="block text-xs font-semibold uppercase tracking-wider mb-1.5 text-mutedText">
                Time of Birth (24hr)
              </label>
              <Input
                id="time_of_birth"
                name="time_of_birth"
                type="time"
                value={formData.time_of_birth}
                onChange={handleChange}
              />
              {errors.time_of_birth && <p className="text-rose-400 text-xs mt-1">{errors.time_of_birth}</p>}
            </div>

            {/* Place of Birth */}
            <div>
              <label htmlFor="place_of_birth" className="block text-xs font-semibold uppercase tracking-wider mb-1.5 text-mutedText">
                Place of Birth
              </label>
              <Input
                id="place_of_birth"
                name="place_of_birth"
                value={formData.place_of_birth}
                onChange={handleChange}
                placeholder="New Delhi, India"
              />
              {errors.place_of_birth && <p className="text-rose-400 text-xs mt-1">{errors.place_of_birth}</p>}
            </div>

            {/* Timezone */}
            <div>
              <label htmlFor="timezone" className="block text-xs font-semibold uppercase tracking-wider mb-1.5 text-mutedText">
                Timezone
              </label>
              <Input
                id="timezone"
                name="timezone"
                value={formData.timezone}
                onChange={handleChange}
                placeholder="Asia/Kolkata"
              />
            </div>
          </div>

          {/* Save Profile Option (Only visible if logged in) */}
          {user && (
            <div className="border-t border-border/40 pt-3.5 space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="save-profile"
                  checked={shouldSaveProfile}
                  onChange={(e) => setShouldSaveProfile(e.target.checked)}
                  className="rounded border-border bg-card text-primary focus:ring-primary h-4 w-4 cursor-pointer"
                />
                <label htmlFor="save-profile" className="text-xs font-semibold text-white cursor-pointer select-none">
                  Save this profile to my account for quick access
                </label>
              </div>

              {shouldSaveProfile && (
                <div className="pl-6 space-y-1.5 animate-fadeIn">
                  <label htmlFor="profileLabel" className="block text-xs font-semibold uppercase tracking-wider text-mutedText text-2xs">
                    Profile Label (e.g. Myself, Spouse, Child, Friend)
                  </label>
                  <Input
                    id="profileLabel"
                    value={profileLabel}
                    onChange={(e) => setProfileLabel(e.target.value)}
                    placeholder="Myself"
                    className="h-9 max-w-xs text-xs"
                  />
                  {errors.profileLabel && <p className="text-rose-400 text-xs mt-1">{errors.profileLabel}</p>}
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-border/40">
            <span className="text-2xs text-mutedText">
              * Details are processed securely to calculate Kundli.
            </span>
            <Button type="submit" variant={isSaved ? "secondary" : "primary"}>
              {isSaved ? "✓ Details Saved" : "Save Details"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export default BirthDetailsForm;
