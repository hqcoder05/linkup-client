import { Outlet } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { CallOverlay } from '@/components/chat/CallOverlay';
import { useCalling } from '@/hooks/useCalling';
import { useCallStore } from '@/stores/callStore';
import { hydrateTheme } from '@/stores/themeStore';

hydrateTheme();

export function AppLayout() {
  const { acceptCall, rejectCall, endCall, cleanup } = useCalling();
  const localStream = useCallStore((state) => state.localStream);

  const toggleAudio = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-900 dark:bg-black dark:text-slate-100 dark:selection:bg-blue-500/30 dark:selection:text-blue-100 transition-colors duration-500">
      <Navbar />
      <main className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6">
        <Outlet />
      </main>
      
      <CallOverlay
        onAccept={acceptCall}
        onReject={rejectCall}
        onCancel={cleanup}
        onEnd={endCall}
        onToggleAudio={toggleAudio}
        onToggleVideo={toggleVideo}
      />
    </div>
  );
}
