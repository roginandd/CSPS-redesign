import { useState, useEffect } from "react";
import Footer from "../../components/Footer";
import AuthenticatedNav from "../../components/AuthenticatedNav";
import Layout from "../../components/Layout";
import BackgroundLogos from "./components/BackgroundLogos";
import Hero from "./components/Hero";
import Announcements from "./components/Announcements";
import Activities from "./components/Activities";
import Merch from "./components/Merch";
import { useAuthStore } from "../../store/auth_store";
import LoadingPage from "../loading";
import ProfileCompletionModal from "../../components/ProfileCompletionModal";
import type { StudentResponse } from "../../interfaces/student/StudentResponse";
import { useScrollLock } from "../../hooks/useScrollLock";

const Index = () => {
  const user = useAuthStore((state) => state.user);
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Lock scroll whiten profile modal is open
  useScrollLock(showProfileModal);



  // Show profile completion modal only when isProfileComplete is explicitly false.
  // During optimistic login, isProfileComplete is undefined (from JWT decode) — modal stays hidden.
  // After background profile() resolves, isProfileComplete becomes a boolean:
  //   false → show modal | true → keep hidden
  useEffect(() => {
    if (user && user.role === "STUDENT") {
      const studentUser = user as StudentResponse & { role: "STUDENT" };

      if (studentUser.user?.isProfileComplete === false) {
        setShowProfileModal(true);
      }
    }
  }, [user]);

  const handleProfileCompleted = (completedUserData: any) => {
    // Update the auth store with the completed profile data
    if (user && user.role === "STUDENT") {
      const studentUser = user as StudentResponse & { role: "STUDENT" };
      const updatedUser = {
        ...studentUser,
        user: {
          ...studentUser.user,
          ...completedUserData.user,
          isProfileComplete: true,
        },
      };

      useAuthStore.getState().setUser(updatedUser);
      setShowProfileModal(false);
    }
  };

  // Show loading until user data is available
  if (!user) {
    return <LoadingPage />;
  }

  // Get studentId safely - only exists on StudentResponse
  const studentId =
    user.role === "STUDENT"
      ? (user as StudentResponse & { role: "STUDENT" }).studentId
      : "";

  return (
    <div className="animate-[fadeIn_500ms_ease-in-out]">
      {/* Profile Completion Modal */}
      <ProfileCompletionModal
        isOpen={showProfileModal}
        studentId={studentId || ""}
        onCompleted={handleProfileCompleted}
      />

      <Layout overflowHidden={true} withFooter={false}>
        <BackgroundLogos />

        {/* Foreground UI */}
        <AuthenticatedNav />

        <Hero />
      </Layout>

      <div className="flex min-h-screen w-full justify-center bg-black py-16 sm:py-20 lg:py-28">
        <div className="w-full max-w-[90rem] px-4 text-white sm:px-6 lg:px-8 space-y-20 sm:space-y-24 lg:space-y-32">
          {/** Announcements Section */}
          <Announcements />

          {/** Activities Section */}
          <Activities />

          {/* Merch Section */}
          <Merch />
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Index;
