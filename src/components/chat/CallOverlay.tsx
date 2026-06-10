import { Mic, MicOff, Phone, PhoneOff, Video, VideoOff } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Avatar } from '@/components/common/Avatar';
import { useCallStore } from '@/stores/callStore';
import { displayName } from '@/utils/format';

export function CallOverlay({
  onAccept,
  onReject,
  onCancel,
  onEnd,
  onToggleAudio,
  onToggleVideo,
}: {
  onAccept: () => void;
  onReject: () => void;
  onCancel: () => void;
  onEnd: () => void;
  onToggleAudio: () => void;
  onToggleVideo: () => void;
}) {
  const { t } = useTranslation();
  const { status, peer, callType, localStream, remoteStream } = useCallStore();
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  if (status === 'idle') return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md">
      <div className="relative flex h-full w-full max-w-4xl flex-col items-center justify-center p-6 sm:h-[80vh] sm:rounded-3xl sm:border sm:border-white/10 sm:bg-black sm:shadow-2xl">
        
        {/* Main Content (Remote Video or Avatar) */}
        <div className="relative flex flex-1 w-full items-center justify-center overflow-hidden rounded-2xl bg-neutral-900">
          {status === 'active' && callType === 'video' && remoteStream ? (
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="h-full w-full object-contain"
            />
          ) : (
            <div className="flex flex-col items-center gap-6">
              <Avatar user={peer} size="xl" />
              <div className="text-center">
                <h2 className="text-3xl font-black tracking-tight text-white">{displayName(peer ?? undefined)}</h2>
                <p className="mt-2 text-sm font-bold uppercase tracking-[0.2em] text-white/40">
                  {status === 'ringing' ? t('chat.incoming_call') : 
                   status === 'dialing' ? t('chat.dialing') : 
                   t('chat.active_call')}
                </p>
              </div>
            </div>
          )}

          {/* Local Video Preview (Miniature) */}
          {callType === 'video' && localStream && (
            <div className="absolute bottom-6 right-6 h-32 w-24 overflow-hidden rounded-xl border border-white/20 bg-black shadow-xl sm:h-48 sm:w-36">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="h-full w-full object-cover"
              />
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="mt-8 flex items-center gap-6 pb-4">
          {status === 'ringing' ? (
            <>
              <button
                onClick={onReject}
                className="flex h-16 w-16 items-center justify-center rounded-full bg-red-600 text-white shadow-lg transition-all hover:bg-red-700 active:scale-95"
                aria-label="Reject"
              >
                <PhoneOff className="h-7 w-7" />
              </button>
              <button
                onClick={onAccept}
                className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg transition-all hover:bg-emerald-700 active:scale-95"
                aria-label="Accept"
              >
                <Phone className="h-7 w-7" />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => {
                  setAudioEnabled(!audioEnabled);
                  onToggleAudio();
                }}
                className={`flex h-14 w-14 items-center justify-center rounded-full transition-all active:scale-95 ${
                  audioEnabled ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-white text-black'
                }`}
              >
                {audioEnabled ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6" />}
              </button>
              
              {callType === 'video' && (
                <button
                  onClick={() => {
                    setVideoEnabled(!videoEnabled);
                    onToggleVideo();
                  }}
                  className={`flex h-14 w-14 items-center justify-center rounded-full transition-all active:scale-95 ${
                    videoEnabled ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-white text-black'
                  }`}
                >
                  {videoEnabled ? <Video className="h-6 w-6" /> : <VideoOff className="h-6 w-6" />}
                </button>
              )}

              <button
                onClick={status === 'dialing' ? onCancel : onEnd}
                className="flex h-16 w-16 items-center justify-center rounded-full bg-red-600 text-white shadow-lg transition-all hover:bg-red-700 active:scale-95"
                aria-label="End Call"
              >
                <PhoneOff className="h-7 w-7" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
