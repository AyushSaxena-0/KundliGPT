"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, Save, Trash2, Download, ShieldAlert, Plus, Compass } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { api } from "../../lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import Footer from "../../components/layout/Footer";

export default function ProfilePage() {
  const router = useRouter();
  const { user, signOut, loading: authLoading } = useAuth();
  
  const [profileName, setProfileName] = useState("");
  const [savedProfiles, setSavedProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  // Load profile data and saved profiles
  useEffect(() => {
    if (user) {
      setProfileName(user.name);
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

  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      await api.updateProfile(profileName);
      setMessage("Profile name updated successfully.");
    } catch (err: any) {
      setMessage(err.message || "Failed to update name.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProfile = async (id: string) => {
    if (!confirm("Are you sure you want to delete this saved profile?")) return;
    try {
      await api.deleteBirthDetails(id);
      setSavedProfiles(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error("Failed to delete profile", err);
    }
  };

  const handleExportData = async () => {
    try {
      const data = await api.exportData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `astrologer_user_data_${user?.id}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert("Failed to export data.");
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm("WARNING: This will permanently delete your account and all saved configurations. This cannot be undone. Proceed?")) return;
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
        <p className="text-mutedText">Loading user profile...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-background relative select-none">
      
      {/* Decorative glows */}
      <div className="absolute top-20 left-10 h-72 w-72 rounded-full bg-primary/5 blur-[100px] pointer-events-none" />

      <main className="flex-1 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12 relative z-10 w-full space-y-8">
        
        {/* Profile Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-border/60 pb-6">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <User className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-white">{user.name}</h1>
              <p className="text-xs text-mutedText">{user.email}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={signOut}>Sign Out</Button>
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Settings Column */}
          <div className="md:col-span-6 space-y-6">
            <Card className="glass-panel border-border/60">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-bold font-display text-white">Profile Settings</CardTitle>
                <CardDescription>Manage your display details.</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <form onSubmit={handleUpdateName} className="space-y-4">
                  {message && (
                    <div className="p-3 text-xs font-semibold text-accent bg-secondary/30 border border-border/40 rounded-lg">
                      {message}
                    </div>
                  )}

                  <div>
                    <label htmlFor="pname" className="block text-xs font-semibold uppercase tracking-wider mb-1.5 text-mutedText">
                      Display Name
                    </label>
                    <Input
                      id="pname"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      placeholder="Rahul Sharma"
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full flex items-center justify-center gap-1.5" size="sm" isLoading={loading}>
                    <Save className="h-4 w-4" />
                    <span>Save Changes</span>
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* GDPR & Privacy Controls */}
            <Card className="glass-panel border-border/60">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-bold font-display text-white">GDPR & Data Privacy</CardTitle>
                <CardDescription>Export or delete your personal details.</CardDescription>
              </CardHeader>
              <CardContent className="pt-4 space-y-3">
                <Button onClick={handleExportData} variant="outline" className="w-full flex items-center justify-center gap-2" size="sm">
                  <Download className="h-4 w-4" />
                  <span>Export All Data (JSON)</span>
                </Button>

                <Button onClick={handleDeleteAccount} variant="outline" className="w-full flex items-center justify-center gap-2 border-rose-500/20 text-rose-400 hover:bg-rose-950/20 hover:text-white" size="sm">
                  <Trash2 className="h-4 w-4" />
                  <span>Delete Account</span>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Saved Profiles Column */}
          <div className="md:col-span-6 space-y-6">
            <Card className="glass-panel border-border/60">
              <CardHeader className="pb-2 flex flex-row items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-lg font-bold font-display text-white">Saved Birth Profiles</CardTitle>
                  <CardDescription>Easily swap details during chats.</CardDescription>
                </div>
                <Button size="sm" variant="outline" className="h-8 w-8 p-0" onClick={() => router.push("/chat")}>
                  <Plus className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="pt-4">
                {savedProfiles.length === 0 ? (
                  <p className="text-xs text-mutedText py-4 text-center">No saved birth profiles. Enter details inside Chat to save them.</p>
                ) : (
                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                    {savedProfiles.map((prof) => (
                      <div key={prof.id} className="p-3 rounded-lg border border-border bg-card/20 flex items-center justify-between gap-3">
                        <div>
                          <h4 className="text-sm font-semibold text-white">{prof.name} ({prof.label})</h4>
                          <p className="text-2xs text-mutedText mt-0.5">
                            {prof.date_of_birth} • {prof.place_of_birth}
                          </p>
                        </div>
                        <button
                          onClick={() => handleDeleteProfile(prof.id)}
                          className="text-mutedText hover:text-rose-400 p-1.5 transition-colors"
                          title="Delete Saved Profile"
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

        </div>

      </main>
      <Footer />
    </div>
  );
}
