import { useEffect, useRef, useCallback } from 'react';
import type { StompSubscription } from '@stomp/stompjs';
import { wsManager } from '@/websocket/wsManager';
import { useCallStore } from '@/stores/callStore';
import { useAuthStore } from '@/stores/authStore';
import { 
  subscribeToCallSignals, 
  sendCallInvite, 
  sendCallOffer, 
  sendCallAnswer, 
  sendCallIce, 
  rejectCall as sendRejectCall, 
  endCall as sendEndCall 
} from '@/websocket/chatSocket';
import type { CallSignalDto, UserDto } from '@/types/api';

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

export function useCalling() {
  const { user } = useAuthStore();
  const { 
    status, callId, conversationId, callType, peer,
    setIncomingCall, setOutgoingCall, setCallActive, setLocalStream, resetCall 
  } = useCallStore();
  
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  const cleanup = useCallback(() => {
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }
    resetCall();
  }, [resetCall]);

  const initPeerConnection = useCallback(() => {
    const pc = new RTCPeerConnection(ICE_SERVERS);
    
    pc.onicecandidate = (event) => {
      if (event.candidate && callId && user && peer) {
        sendCallIce(wsManager.getClient(), {
          callId,
          conversationId: conversationId!,
          senderId: user.id,
          receiverId: peer.id,
          candidate: JSON.stringify(event.candidate),
        });
      }
    };

    pc.ontrack = (event) => {
      if (event.streams[0]) {
        setCallActive(event.streams[0]);
      }
    };

    pcRef.current = pc;
    return pc;
  }, [callId, conversationId, peer, user, setCallActive]);

  const startCall = useCallback(async (targetConversationId: number, targetPeer: UserDto, type: 'audio' | 'video') => {
    if (!user) return;
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: type === 'video',
      });
      
      localStreamRef.current = stream;
      setLocalStream(stream);
      
      const newCallId = `call_${Date.now()}_${user.id}`;
      setOutgoingCall(newCallId, targetConversationId, targetPeer, type);

      sendCallInvite(wsManager.getClient(), {
        callId: newCallId,
        conversationId: targetConversationId,
        callerId: user.id,
        receiverId: targetPeer.id,
        callType: type,
      });
    } catch (error) {
      console.error('Failed to start call:', error);
    }
  }, [user, setLocalStream, setOutgoingCall]);

  const acceptCall = useCallback(async () => {
    if (!user || !peer || !callId) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: callType === 'video',
      });
      
      localStreamRef.current = stream;
      setLocalStream(stream);

      const pc = initPeerConnection();
      stream.getTracks().forEach(track => pc.addTrack(track, stream));

      // Receiver initiates negotiation (Receiver-Offerer flow)
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      sendCallOffer(wsManager.getClient(), {
        callId,
        conversationId: conversationId!,
        senderId: user.id,
        receiverId: peer.id,
        sdp: JSON.stringify(offer),
      });
    } catch (error) {
      console.error('Failed to accept call:', error);
      cleanup();
    }
  }, [user, peer, callId, callType, conversationId, setLocalStream, initPeerConnection, cleanup]);

  const rejectCall = useCallback(() => {
    if (!user || !peer || !callId) return;
    sendRejectCall(wsManager.getClient(), {
      callId,
      conversationId: conversationId!,
      senderId: user.id,
      receiverId: peer.id,
    });
    cleanup();
  }, [user, peer, callId, conversationId, cleanup]);

  const endCall = useCallback(() => {
    if (!user || !peer || !callId) {
      cleanup();
      return;
    }
    sendEndCall(wsManager.getClient(), {
      callId,
      conversationId: conversationId!,
      senderId: user.id,
      receiverId: peer.id,
    });
    cleanup();
  }, [user, peer, callId, conversationId, cleanup]);

  const handleSignal = useCallback(async (signal: CallSignalDto) => {
    if (!user) return;

    switch (signal.event) {
      case 'invite':
        if (status === 'idle') {
          setIncomingCall(signal.callId, signal.conversationId, signal.sender, signal.callType as 'audio' | 'video');
        } else if (signal.callId !== callId) {
          sendRejectCall(wsManager.getClient(), {
            callId: signal.callId,
            conversationId: signal.conversationId,
            senderId: user.id,
            receiverId: signal.senderId,
          });
        }
        break;

      case 'offer':
        if (status === 'dialing' || status === 'active') {
          try {
            const pc = pcRef.current || initPeerConnection();
            
            // If caller hasn't added tracks yet (dialing), do it now
            if (localStreamRef.current && pc.getSenders().length === 0) {
              localStreamRef.current.getTracks().forEach(track => pc.addTrack(track, localStreamRef.current!));
            }

            await pc.setRemoteDescription(new RTCSessionDescription(JSON.parse(signal.sdp!)));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);

            sendCallAnswer(wsManager.getClient(), {
              callId: signal.callId,
              conversationId: signal.conversationId,
              senderId: user.id,
              receiverId: signal.senderId,
              sdp: JSON.stringify(answer),
            });
          } catch (error) {
            console.error('Error handling offer:', error);
          }
        }
        break;

      case 'answer':
        if (pcRef.current) {
          try {
            await pcRef.current.setRemoteDescription(new RTCSessionDescription(JSON.parse(signal.sdp!)));
          } catch (error) {
            console.error('Error handling answer:', error);
          }
        }
        break;

      case 'ice':
        if (pcRef.current) {
          try {
            await pcRef.current.addIceCandidate(new RTCIceCandidate(JSON.parse(signal.candidate!)));
          } catch (error) {
            console.error('Error adding ICE candidate:', error);
          }
        }
        break;

      case 'reject':
      case 'end':
        if (signal.callId === callId) {
          cleanup();
        }
        break;
    }
  }, [user, status, callId, setIncomingCall, initPeerConnection, cleanup]);

  // Global listener
  useEffect(() => {
    if (!user?.id) return;
    
    let sub: StompSubscription | null = null;
    const unactivate = wsManager.activate(() => {
      sub = subscribeToCallSignals(wsManager.getClient(), user.id, (signal) => {
        void handleSignal(signal);
      });
    });

    return () => {
      if (sub) sub.unsubscribe();
      unactivate();
    };
  }, [user?.id, handleSignal]);

  return { startCall, acceptCall, rejectCall, endCall, cleanup };
}
