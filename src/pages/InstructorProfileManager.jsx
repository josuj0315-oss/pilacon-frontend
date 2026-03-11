import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import InstructorProfileList from "./InstructorProfileList";
import InstructorProfileEdit from "./InstructorProfileEdit";
import InstructorProfileView from "./InstructorProfileView";
import { usePilaCon } from "../store/pilaconStore";

export default function InstructorProfileManager() {
    const { profiles, deleteProfile, setPrimaryProfile, saveProfile } = usePilaCon();
    const [searchParams] = useSearchParams();
    const initialMode = searchParams.get("mode");
    const [view, setView] = useState("list"); // list | detail | edit
    const [activeTab, setActiveTab] = useState("sub"); // sub | regular
    const [viewingProfileId, setViewingProfileId] = useState(null);

    const handleCreateProfile = (type) => {
        setViewingProfileId(`new_${type}`);
        setActiveTab(type);
        setView("edit");
    };

    const handleViewProfile = (id) => {
        setViewingProfileId(id);
        setView("detail");
    };

    const handleEditProfile = (id) => {
        setViewingProfileId(id);
        setView("edit");
    };

    const handleDeleteProfile = async (id) => {
        if (window.confirm("프로필을 삭제하시겠습니까?")) {
            await deleteProfile(id);
            if (view === "detail") setView("list");
        }
    };

    const handleSetPrimary = async (type, id) => {
        await setPrimaryProfile(id);
    };

    const handleSaveProfile = async (updatedProfile) => {
        const res = await saveProfile(updatedProfile);
        if (res.ok) {
            // 저장 후 상세 페이지로 이동하거나 목록으로 이동
            setViewingProfileId(res.data.id);
            setView("detail");
        } else {
            alert(res.error);
        }
    };

    if (view === "detail") {
        const profile = profiles.find(p => p.id === viewingProfileId);
        if (!profile) {
            setView("list");
            return null;
        }
        return (
            <InstructorProfileView
                profile={profile}
                onEdit={() => setView("edit")}
                onBack={() => setView("list")}
            />
        );
    }

    if (view === "edit") {
        let editingProfile;
        if (typeof viewingProfileId === 'string' && viewingProfileId.startsWith('new_')) {
            const type = viewingProfileId.split('_')[1];
            editingProfile = {
                type: type,
                title: "",
                intro: "",
                experience: "",
                specialty: "",
                message: "",
                resumeUrl: "",
                activityUrl: "",
                detailIntro: "",
                pdfUrl: "",
                portfolioUrl: "",
                isPrimary: profiles.filter(p => p.type === type).length === 0,
            };
        } else {
            editingProfile = profiles.find(p => p.id === viewingProfileId);
        }

        if (!editingProfile) {
            setView("list");
            return null;
        }

        return (
            <InstructorProfileEdit
                profile={editingProfile}
                onSave={handleSaveProfile}
                onBack={() => {
                    if (typeof viewingProfileId === 'string' && viewingProfileId.startsWith('new_')) {
                        setView("list");
                    } else {
                        setView("detail");
                    }
                }}
            />
        );
    }

    return (
        <InstructorProfileList
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            profiles={profiles.filter(p => p.type === activeTab)}
            onCreate={handleCreateProfile}
            onView={handleViewProfile}
            onDelete={handleDeleteProfile}
            onSetPrimary={handleSetPrimary}
            initialMode={initialMode}
        />
    );
}
