import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Mainlayout from "@/Layout/Mainlayout";
import { useAuth } from "@/lib/AuthContext";
import axiosInstance from "@/lib/axiosinstance";
import { Calendar, Edit, Plus, X } from "lucide-react";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

export default function UserProfilePage() {
  const { user } = useAuth();
  const router = useRouter();
  const { id } = router.query;
  const userId = Array.isArray(id) ? id[0] : id;

  const [profileUser, setProfileUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    about: "",
    tags: [] as string[],
  });
  const [newTag, setNewTag] = useState("");

  useEffect(() => {
    if (!userId) return;
    const fetchUser = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get("/user/getalluser");
        const matched = res.data.data?.find((u: any) => u._id === userId);
        if (matched) {
          setProfileUser(matched);
          setEditForm({
            name: matched.name || "",
            about: matched.about || "",
            tags: matched.tags || [],
          });
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [userId]);

  if (loading) {
    return (
      <Mainlayout>
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      </Mainlayout>
    );
  }

  if (!profileUser) {
    return (
      <Mainlayout>
        <div className="max-w-4xl mx-auto my-8 p-8 bg-gray-50 border rounded-lg text-center text-gray-500">
          User not found.
        </div>
      </Mainlayout>
    );
  }

  const handleSaveProfile = async () => {
    try {
      const res = await axiosInstance.patch(`/user/update/${user?._id}`, {
        editForm,
      });
      if (res.data.data) {
        const updated = res.data.data;
        setProfileUser(updated);
        setIsEditing(false);
        toast.success("Profile updated successfully!");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to update profile");
    }
  };

  const handleAddTag = () => {
    const trimmedTag = newTag.trim();
    if (trimmedTag && !editForm.tags.includes(trimmedTag)) {
      setEditForm({ ...editForm, tags: [...editForm.tags, trimmedTag] });
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setEditForm({
      ...editForm,
      tags: editForm.tags.filter((tag: string) => tag !== tagToRemove),
    });
  };

  const isOwnProfile = user?._id === profileUser._id;

  const getInitials = (name: string) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0][0]?.toUpperCase() || "U";
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <Mainlayout>
      <div className="max-w-6xl mx-auto p-4 lg:p-6">
        {/* User Header */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6 mb-8 border-b pb-6">
          <Avatar className="w-24 h-24 lg:w-32 lg:h-32 shadow-sm border border-gray-200">
            <AvatarFallback className="text-2xl lg:text-3xl bg-orange-100 text-orange-800 font-bold">
              {getInitials(profileUser.name)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-1">
                  {profileUser.name}
                </h1>
                <p className="text-sm text-gray-500">{profileUser.email}</p>
              </div>

              {isOwnProfile && (
                <Dialog open={isEditing} onOpenChange={setIsEditing}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 text-sm font-medium border-gray-300"
                    >
                      <Edit className="w-4 h-4" />
                      Edit Profile
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-xl bg-white text-gray-900 p-6 rounded-lg">
                    <DialogHeader>
                      <DialogTitle className="text-lg font-bold">Edit Profile</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-5 py-3">
                      <div>
                        <Label htmlFor="name" className="text-sm font-medium">Display Name</Label>
                        <Input
                          id="name"
                          value={editForm.name}
                          onChange={(e) =>
                            setEditForm({ ...editForm, name: e.target.value })
                          }
                          className="mt-1"
                          placeholder="Your display name"
                        />
                      </div>

                      <div>
                        <Label htmlFor="about" className="text-sm font-medium">About Me</Label>
                        <Textarea
                          id="about"
                          value={editForm.about}
                          onChange={(e) =>
                            setEditForm({ ...editForm, about: e.target.value })
                          }
                          placeholder="Tell us about yourself, your experience, and interests..."
                          className="min-h-28 mt-1 text-sm"
                        />
                      </div>

                      <div>
                        <Label className="text-sm font-medium mb-1 block">Skills & Technologies</Label>
                        <div className="flex gap-2 mb-2">
                          <Input
                            value={newTag}
                            onChange={(e) => setNewTag(e.target.value)}
                            placeholder="Add a skill (e.g. React, Node.js)"
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                handleAddTag();
                              }
                            }}
                            className="text-sm"
                          />
                          <Button
                            onClick={handleAddTag}
                            variant="outline"
                            type="button"
                            size="sm"
                            className="bg-orange-600 hover:bg-orange-700 text-white border-none px-3"
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>

                        <div className="flex flex-wrap gap-1.5">
                          {editForm.tags?.map((t: string) => (
                            <Badge
                              key={t}
                              variant="secondary"
                              className="bg-orange-100 text-orange-800 text-xs px-2 py-0.5 flex items-center gap-1"
                            >
                              {t}
                              <button
                                type="button"
                                onClick={() => handleRemoveTag(t)}
                                className="hover:text-red-600 ml-0.5"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                        <Button
                          variant="ghost"
                          onClick={() => setIsEditing(false)}
                          className="text-sm text-gray-600"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleSaveProfile}
                          className="bg-blue-600 hover:bg-blue-700 text-white text-sm"
                        >
                          Save Changes
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>

            <div className="flex items-center text-xs text-gray-500 mb-3">
              <Calendar className="w-4 h-4 mr-1 text-gray-400" />
              Member since{" "}
              {profileUser.joinDate
                ? new Date(profileUser.joinDate).toLocaleDateString()
                : "Recently"}
            </div>
          </div>
        </div>

        {/* Profile Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-sm border-gray-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold text-gray-900">About</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed text-sm whitespace-pre-line">
                  {profileUser.about || "This user hasn't added a bio yet."}
                </p>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="shadow-sm border-gray-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold text-gray-900">Top Tags & Skills</CardTitle>
              </CardHeader>
              <CardContent>
                {(!profileUser.tags || profileUser.tags.length === 0) ? (
                  <p className="text-xs text-gray-500">No tags added yet.</p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {profileUser.tags.map((t: string) => (
                      <Badge
                        key={t}
                        variant="secondary"
                        className="bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs px-2.5 py-1 border border-blue-100"
                      >
                        {t}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Mainlayout>
  );
}
