import React, { useState, useEffect } from "react";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { RescheduleModal } from "../components/RescheduleModal";

import { LandingPage } from "../pages/LandingPage";
import { PatientLogin } from "../auth/patient/PatientLogin";
import { DoctorLogin } from "../auth/doctor/DoctorLogin";
import { StaffLogin } from "../auth/staff/StaffLogin";

import { PatientDashboard } from "../pages/patient/PatientDashboard";
import { PatientFlow } from "../pages/patient/PatientFlow";
import { LiveTracker } from "../pages/patient/LiveTracker";
import { DoctorDashboard } from "../pages/doctor/DoctorDashboard";
import { ReceptionistDashboard } from "../pages/receptionist/ReceptionistDashboard";

import { queueService } from "../services/queueService";
import { appointmentClient } from "../services/appointmentService";
import { QueueItem } from "../types";


export type PageRoute = 
  | "landing" 
  | "patient-login" 
  | "patient-dashboard" 
  | "patient-flow" 
  | "patient-tracker" 
  | "staff-login" 
  | "management-dashboard" 
  | "doctor-login" 
  | "doctor-dashboard";

export default function App() {
  const [page, setPage] = useState<PageRoute>("landing");
  const [currentUserEmail, setCurrentUserEmail] = useState("");
  const [trackingAppointment, setTrackingAppointment] = useState<QueueItem | null>(null);
  const [reschedulingAppointment, setReschedulingAppointment] = useState<QueueItem | null>(null);

  useEffect(() => {
    queueService.initialize();
  }, []);

  const goHome = () => setPage("landing");

  const handleCancelAppointment = async (id: string) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) return;
    try {
      await appointmentClient.cancelAppointment(id);
    } catch (e) {}
    const currentQueue = queueService.getLocalQueue();
    const updated = currentQueue.filter(x => x.id !== id);
    queueService.setLocalQueue(updated);
    setPage("patient-dashboard");
  };

  const handleRescheduleAppointment = (id: string) => {
    const currentQueue = queueService.getLocalQueue();
    const apt = currentQueue.find(x => x.id === id) || {
      id,
      name: currentUserEmail.split('@')[0],
      phone: currentUserEmail,
      scheduled: 'Tomorrow • 11:00 AM',
      type: 'Online' as const,
      status: 'Waiting' as const
    };
    setReschedulingAppointment(apt);
  };

  const confirmReschedule = async (newTime: string) => {
    if (!reschedulingAppointment) return;
    try {
      await appointmentClient.rescheduleAppointment(reschedulingAppointment.id, newTime);
    } catch (e) {}

    const currentQueue = queueService.getLocalQueue();
    const updated = currentQueue.map(x => x.id === reschedulingAppointment.id ? { ...x, scheduled: newTime } : x);
    queueService.setLocalQueue(updated);

    if (trackingAppointment && trackingAppointment.id === reschedulingAppointment.id) {
      setTrackingAppointment({ ...trackingAppointment, scheduled: newTime });
    }
    setReschedulingAppointment(null);
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-[#00e599] selection:text-black flex flex-col">
      {page !== "management-dashboard" && (
        <Navbar onLogoClick={goHome} onNavigate={(p) => setPage(p as PageRoute)} />
      )}

      {page === "landing" && (
        <LandingPage onNavigate={(p) => setPage(p as PageRoute)} />
      )}

      {page === "patient-login" && (
        <div className="flex-1 flex items-center justify-center px-4 py-16">
          <PatientLogin
            onSuccess={(email) => { setCurrentUserEmail(email); setPage("patient-dashboard"); }}
            onBack={goHome}
          />
        </div>
      )}

      {page === "patient-dashboard" && (
        <PatientDashboard
          userEmail={currentUserEmail}
          onNew={() => setPage("patient-flow")}
          onTrack={(apt) => { setTrackingAppointment(apt); setPage("patient-tracker"); }}
          onCancel={handleCancelAppointment}
          onReschedule={handleRescheduleAppointment}
          onLogout={() => { setCurrentUserEmail(""); goHome(); }}
        />
      )}

      {page === "patient-flow" && (
        <PatientFlow
          initialPhone={currentUserEmail}
          onBackToHome={() => setPage("patient-dashboard")}
          onComplete={() => setPage("patient-dashboard")}
        />
      )}

      {page === "patient-tracker" && trackingAppointment && (
        <LiveTracker
          appointment={trackingAppointment}
          userEmail={currentUserEmail}
          onBack={() => setPage("patient-dashboard")}
          onCancel={() => handleCancelAppointment(trackingAppointment.id)}
          onReschedule={() => handleRescheduleAppointment(trackingAppointment.id)}
        />
      )}

      {page === "staff-login" && (
        <div className="flex-1 flex items-center justify-center px-4 py-16">
          <StaffLogin
            onSuccess={() => setPage("management-dashboard")}
            onBack={goHome}
          />
        </div>
      )}

      {page === "management-dashboard" && (
        <ReceptionistDashboard onBack={goHome} />
      )}

      {page === "doctor-login" && (
        <div className="flex-1 flex items-center justify-center px-4 py-16">
          <DoctorLogin
            onSuccess={() => setPage("doctor-dashboard")}
            onBack={goHome}
          />
        </div>
      )}

      {page === "doctor-dashboard" && (
        <DoctorDashboard onBack={goHome} />
      )}

      {page !== "management-dashboard" && <Footer />}

      {/* Global Modals */}
      {reschedulingAppointment && (
        <RescheduleModal
          appointment={reschedulingAppointment}
          onClose={() => setReschedulingAppointment(null)}
          onConfirm={confirmReschedule}
        />
      )}
    </div>
  );
}
