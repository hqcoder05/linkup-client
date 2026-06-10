import { create } from 'zustand';
import type { UserDto } from '@/types/api';

export type CallStatus = 'idle' | 'ringing' | 'dialing' | 'active' | 'ended';

interface CallState {
  status: CallStatus;
  callId: string | null;
  conversationId: number | null;
  callType: 'audio' | 'video' | null;
  peer: UserDto | null;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  
  // Actions
  setIncomingCall: (callId: string, conversationId: number, peer: UserDto, callType: 'audio' | 'video') => void;
  setOutgoingCall: (callId: string, conversationId: number, peer: UserDto, callType: 'audio' | 'video') => void;
  setCallActive: (remoteStream: MediaStream) => void;
  setLocalStream: (stream: MediaStream | null) => void;
  resetCall: () => void;
}

export const useCallStore = create<CallState>((set) => ({
  status: 'idle',
  callId: null,
  conversationId: null,
  callType: null,
  peer: null,
  localStream: null,
  remoteStream: null,

  setIncomingCall: (callId, conversationId, peer, callType) => 
    set({ status: 'ringing', callId, conversationId, peer, callType }),

  setOutgoingCall: (callId, conversationId, peer, callType) =>
    set({ status: 'dialing', callId, conversationId, peer, callType }),

  setCallActive: (remoteStream) =>
    set({ status: 'active', remoteStream }),

  setLocalStream: (localStream) => set({ localStream }),

  resetCall: () => set({
    status: 'idle',
    callId: null,
    conversationId: null,
    callType: null,
    peer: null,
    localStream: null,
    remoteStream: null,
  }),
}));
