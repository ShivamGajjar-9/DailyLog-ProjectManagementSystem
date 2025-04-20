"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import {
  RegisterLink,
  LoginLink,
  LogoutLink,
} from "@kinde-oss/kinde-auth-nextjs/components";
import { toast } from "sonner";
import {
  LogOut,
  User,
  Globe,
  Building2,
  PenLine,
  Settings,
  Mail,
} from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

interface UserData {
  name: string;
  email: string;
  about: string | null;
  country: string;
  industryType: string;
}

const countries = [
  { value: "US", label: "United States" },
  { value: "GB", label: "United Kingdom" },
  { value: "CA", label: "Canada" },
  { value: "AU", label: "Australia" },
  { value: "IN", label: "India" },
  // Add more countries as needed
];

const industries = [
  { value: "Technology", label: "Technology" },
  { value: "Healthcare", label: "Healthcare" },
  { value: "Education", label: "Education" },
  { value: "Finance", label: "Finance" },
  { value: "Other", label: "Other" },
];

export default function ProfilePage() {
  const router = useRouter();
  const { user: kindeUser } = useKindeBrowserClient();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<UserData>({
    name: "",
    email: "",
    about: "",
    country: "US",
    industryType: "Technology",
  });

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await fetch("/api/profile");
      if (!response.ok) throw new Error("Failed to fetch user data");

      const userData = await response.json();
      setFormData({
        name: userData.name || kindeUser?.given_name || "",
        email: userData.email || kindeUser?.email || "",
        about: userData.about || "",
        country: userData.country || "US",
        industryType: userData.industryType || "Technology",
      });
    } catch (error) {
      console.error("Error fetching user data:", error);
      toast.error("Failed to load profile data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to update profile");

      toast.success("Profile updated successfully");
      setIsEditing(false);
      await fetchUserData();
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/profile-bg.jpg"
          alt="Background"
          fill
          className="object-cover opacity-20"
          priority
        />
      </div>

      <div className="container max-w-5xl mx-auto py-12 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-between items-center mb-8"
        >
          <div className="flex items-center gap-3">
            <Settings className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">
              Profile Settings
            </h1>
          </div>
          <div className="flex gap-4">
            {!isEditing ? (
              <Button
                onClick={() => setIsEditing(true)}
                variant="outline"
                className="flex items-center gap-2"
              >
                <PenLine className="h-4 w-4" />
                Edit Profile
              </Button>
            ) : (
              <Button
                onClick={() => setIsEditing(false)}
                variant="outline"
                className="flex items-center gap-2"
              >
                Cancel
              </Button>
            )}
            <LogoutLink>
              <Button
                type="button"
                variant="ghost"
                className="flex items-center gap-2 text-red-600 hover:text-red-600 hover:bg-red-100/50 dark:hover:bg-red-900/50"
              >
                <LogOut className="h-4 w-4" />
                <span>Log out</span>
              </Button>
            </LogoutLink>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-card rounded-2xl p-8 shadow-sm border"
        >
          <div className="flex items-center gap-6 mb-8">
            <div className="relative">
              <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
                <AvatarImage src={kindeUser?.picture || ""} />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {formData.name?.[0] || "U"}
                </AvatarFallback>
              </Avatar>
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-foreground">
                {formData.name}
              </h2>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                <p>{formData.email}</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-foreground flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Name
                </Label>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  disabled={!isEditing}
                  className="bg-background"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-foreground flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Country
                </Label>
                <Select
                  value={formData.country}
                  onValueChange={(value) =>
                    setFormData({ ...formData, country: value })
                  }
                  disabled={!isEditing}
                >
                  <SelectTrigger className="bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((country) => (
                      <SelectItem key={country.value} value={country.value}>
                        {country.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-foreground flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Industry
                </Label>
                <Select
                  value={formData.industryType}
                  onValueChange={(value) =>
                    setFormData({ ...formData, industryType: value })
                  }
                  disabled={!isEditing}
                >
                  <SelectTrigger className="bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {industries.map((industry) => (
                      <SelectItem key={industry.value} value={industry.value}>
                        {industry.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label className="text-foreground flex items-center gap-2">
                  <PenLine className="h-4 w-4" />
                  About
                </Label>
                <Textarea
                  value={formData.about || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, about: e.target.value })
                  }
                  disabled={!isEditing}
                  className="bg-background min-h-[100px]"
                  placeholder="Tell us about yourself..."
                />
              </div>
            </div>

            {isEditing && (
              <div className="flex justify-end gap-4">
                <Button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                      Saving...
                    </>
                  ) : (
                    <>Save Changes</>
                  )}
                </Button>
              </div>
            )}
          </form>
        </motion.div>
      </div>
    </div>
  );
}
