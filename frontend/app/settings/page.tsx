"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Settings as SettingsIcon, 
  User, 
  Bell, 
  ShieldCheck, 
  Moon, 
  Globe, 
  CreditCard,
  Trash2,
  Download,
  Save,
  CheckCircle2
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { api } from "../../lib/api";
import { analytics } from "../../lib/analytics";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import Footer from "../../components/layout/Footer";

export default function SettingsPage() {
  const router = useRouter();
  const { user, signOut, loading: authLoading } = useAuth();

  // Settings states
  const [theme, setTheme] = useState("dark");
  const [language, setLanguage] = useState("en");
  const [emailHoroscope, setEmailHoroscope] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(false);
  const [trackingOptOut, setTrackingOptOut] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Profile fields
  const [profileName, setProfileName] = useState("");
  const [savedProfiles, setSavedProfiles] = useState<any[]>([]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      setProfileName(user.name);
      loadSavedProfiles();
      // Load settings from local storage
      const savedTheme = localStorage.getItem("setting_theme") || "dark";
      const savedLang = localStorage.getItem("setting_lang") || "en";
      const savedOptOut = localStorage.getItem("setting_tracking_opt_out") === "true";
      setTheme(savedTheme);
      setLanguage(savedLang);
      setTrackingOptOut(savedOptOut);
    }
  }, [user]);

  const loadSavedProfiles = async () => {
    try {
      const data = await api.getBirthDetails();
      setSavedProfiles(data);
    } catch (err) {
      console.error("Failed to load saved birth profiles", err);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMessage(null);

    analytics.trackEvent("button_click", { name: "save_settings" });

    try {
      // Save local preferences
      localStorage.setItem("setting_theme", theme);
      localStorage.setItem("setting_lang", language);
      localStorage.setItem("setting_tracking_opt_out", String(trackingOptOut));

      // Save display name to backend profile
      if (profileName.trim() !== user?.name) {
        await api.updateProfile(profileName.trim());
      }

      setSuccessMessage("Preferences saved successfully!");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      alert(err.message || "Failed to update profile settings.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProfile = async (id: string) => {
    if (!confirm("Are you sure you want to delete this saved birth profile?")) return;
    try {
      await api.deleteBirthDetails(id);
      setSavedProfiles(prev => prev.filter(p => p.id !== id));
      analytics.trackEvent("button_click", { name: "delete_saved_profile" });
    } catch (err) {
      console.error("Failed to delete birth profile", err);
    }
  };

  const handleExportData = async () => {
    try {
      const data = await api.exportData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `astrologer_gdpr_export_${user?.id}.json`;
      a.click();
      URL.revokeObjectURL(url);
      analytics.trackEvent("button_click", { name: "export_gdpr_data" });
    } catch (err) {
      alert("Failed to export personal data.");
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm("WARNING: This will permanently wipe your account and all saved configurations. This cannot be undone. Proceed?")) return;
    try {
      await api.deleteAccount();
      await signOut();
    } catch (err) {
      alert("Failed to delete account.");
    }
  };

  if (authLoading || !user) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <p className="text-mutedText font-sans">Loading user settings...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-background relative select-none">
      
      {/* Decorative glows */}
      <div className="absolute top-20 left-10 h-72 w-72 rounded-full bg-primary/5 blur-[100px] pointer-events-none" />

      <main className="flex-1 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10 relative z-10 w-full space-y-8">
        
        {/* Settings Header */}
        <div className="flex items-center gap-3 border-b border-border/60 pb-6">
          <div className="h-12 w-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
            <SettingsIcon className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-white">System Settings</h1>
            <p className="text-xs text-mutedText">Configure themes, notification channels, birth profiles, and security keys.</p>
          </div>
        </div>

        {successMessage && (
          <div className="p-3 text-xs font-semibold text-emerald-400 bg-emerald-950/20 border border-emerald-500/20 rounded-lg flex items-center gap-2 max-w-xl animate-fadeIn">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Configurations Layout */}
        <form onSubmit={handleSaveSettings} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          <div className="lg:col-span-8 space-y-6">
            
            {/* Display & Language Settings */}
            <Card className="glass-panel border-border/60">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-bold font-display text-white flex items-center gap-2">
                  <Moon className="h-5 w-5 text-accent" />
                  <span>Display & Language</span>
                </CardTitle>
                <CardDescription>Customize the interface aesthetics and translation engines.</CardDescription>
              </CardHeader>
              <CardContent className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="theme" className="block text-xs font-semibold uppercase tracking-wider mb-1.5 text-mutedText">
                    Application Theme
                  </label>
                  <select
                    id="theme"
                    value={theme}
                    onChange={(e) => setTheme(e.target.value)}
                    className="flex h-10 w-full rounded-lg border border-border bg-card px-3 py-2 text-md text-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                  >
                    <option value="dark">Vedic Dark Mode (Default)</option>
                    <option value="light">Solarized Light Mode</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="language" className="block text-xs font-semibold uppercase tracking-wider mb-1.5 text-mutedText">
                    Primary Language
                  </label>
                  <select
                    id="language"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="flex h-10 w-full rounded-lg border border-border bg-card px-3 py-2 text-md text-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                  >
                    <option value="en">English</option>
                    <option value="hi">Hindi (हिन्दी)</option>
                    <option value="sa">Sanskrit (संस्कृतम्)</option>
                    <option value="ta">Tamil (தமிழ்)</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            {/* Notification Preferences */}
            <Card className="glass-panel border-border/60">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-bold font-display text-white flex items-center gap-2">
                  <Bell className="h-5 w-5 text-primary" />
                  <span>Notifications</span>
                </CardTitle>
                <CardDescription>Select which updates you want delivered to your email.</CardDescription>
              </CardHeader>
              <CardContent className="pt-4 space-y-3.5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h4 className="text-sm font-semibold text-white">Daily Transit Horoscope</h4>
                    <p className="text-xs text-mutedText leading-relaxed mt-0.5">Receive auspicious muhurtas and planetary change warnings daily.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={emailHoroscope}
                    onChange={(e) => setEmailHoroscope(e.target.checked)}
                    className="rounded border-border bg-card text-primary focus:ring-primary h-4.5 w-4.5 cursor-pointer mt-1"
                  />
                </div>

                <div className="flex items-start justify-between gap-4 border-t border-border/40 pt-3.5">
                  <div>
                    <h4 className="text-sm font-semibold text-white">Sade Sati & Saturn Alerts</h4>
                    <p className="text-xs text-mutedText leading-relaxed mt-0.5">Critical notifications when major planetary transits enter active houses.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={emailAlerts}
                    onChange={(e) => setEmailAlerts(e.target.checked)}
                    className="rounded border-border bg-card text-primary focus:ring-primary h-4.5 w-4.5 cursor-pointer mt-1"
                  />
                </div>
              </CardContent>
            </Card>

            {/* User Account / Profile name */}
            <Card className="glass-panel border-border/60">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-bold font-display text-white flex items-center gap-2">
                  <User className="h-5 w-5 text-accent" />
                  <span>Profile Settings</span>
                </CardTitle>
                <CardDescription>Manage user display details.</CardDescription>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div>
                  <label htmlFor="pname" className="block text-xs font-semibold uppercase tracking-wider mb-1.5 text-mutedText">
                    Display Name
                  </label>
                  <Input
                    id="pname"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 text-mutedText">
                    Email Address (Registered)
                  </label>
                  <Input
                    value={user.email}
                    disabled
                    className="opacity-60 cursor-not-allowed bg-secondary/20"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Saved Birth Profiles manager */}
            <Card className="glass-panel border-border/60">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-bold font-display text-white">Saved Birth Profiles</CardTitle>
                <CardDescription>Edit or delete saved birth profiles available in astrologer consultation.</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                {savedProfiles.length === 0 ? (
                  <p className="text-xs text-mutedText text-center py-4">No saved birth profiles. Enter birth details inside Chat to save them.</p>
                ) : (
                  <div className="space-y-3.5">
                    {savedProfiles.map((prof) => (
                      <div key={prof.id} className="p-3.5 rounded-lg border border-border bg-card/20 flex items-center justify-between gap-3">
                        <div>
                          <h4 className="text-sm font-semibold text-white">{prof.name} ({prof.label})</h4>
                          <p className="text-2xs text-mutedText mt-0.5">
                            {prof.date_of_birth} • {prof.place_of_birth}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteProfile(prof.id)}
                          className="text-mutedText hover:text-rose-400 p-2 rounded hover:bg-rose-950/20 transition-all focus:outline-none"
                          title="Delete Birth Profile"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            
          </div>

          {/* Right Column (Future Premium & Privacy Controls) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Future Subscriptions */}
            <Card className="glass-panel border-border/60 bg-gradient-to-br from-secondary/40 via-card/25 to-secondary/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-bold font-display text-white flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-accent" />
                  <span>Subscription Plan</span>
                </CardTitle>
                <CardDescription>Upgrade to premium for unlimited readings.</CardDescription>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 text-center">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-mutedText">Current Plan</h4>
                  <span className="text-2xl font-bold font-display text-white mt-1 block">Free MVP Tier</span>
                  <p className="text-[10px] text-mutedText mt-2 leading-relaxed">Includes 50 messages/day and basic Kundli chart calculations.</p>
                </div>
                
                <Button type="button" variant="outline" className="w-full opacity-60 cursor-not-allowed" disabled>
                  Upgrade to Premium (Future)
                </Button>
              </CardContent>
            </Card>

            {/* Privacy preferences */}
            <Card className="glass-panel border-border/60">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-bold font-display text-white flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-emerald-400" />
                  <span>Privacy & GDPR</span>
                </CardTitle>
                <CardDescription>Export or permanently wipe personal records.</CardDescription>
              </CardHeader>
              <CardContent className="pt-4 space-y-3">
                <div className="flex items-center justify-between gap-4 py-1.5 border-b border-border/40">
                  <span className="text-xs text-mutedText">Opt-out of tracking cookies</span>
                  <input
                    type="checkbox"
                    checked={trackingOptOut}
                    onChange={(e) => setTrackingOptOut(e.target.checked)}
                    className="rounded border-border bg-card text-primary focus:ring-primary h-4.5 w-4.5 cursor-pointer"
                  />
                </div>

                <Button type="button" onClick={handleExportData} variant="outline" className="w-full flex items-center justify-center gap-2" size="sm">
                  <Download className="h-4 w-4" />
                  <span>Export All Data (JSON)</span>
                </Button>

                <Button type="button" onClick={handleDeleteAccount} variant="outline" className="w-full flex items-center justify-center gap-2 border-rose-500/20 text-rose-400 hover:bg-rose-950/20 hover:text-white" size="sm">
                  <Trash2 className="h-4 w-4" />
                  <span>Delete Account</span>
                </Button>
              </CardContent>
            </Card>

            <Button type="submit" className="w-full flex items-center justify-center gap-2" size="lg" isLoading={isSaving}>
              <Save className="h-4.5 w-4.5" />
              <span>Save Configurations</span>
            </Button>
          </div>

        </form>

      </main>
      <Footer />
    </div>
  );
}
