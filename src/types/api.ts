export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
};

export type UserDto = {
  id: number;
  email: string;
  fullName: string;
  avatarUrl: string | null;
  coverUrl: string | null;
  privateAccount: boolean;
  following?: boolean;
  followedByCurrentUser: boolean;
  role: string;
  createdAt: string;
};

export type AuthResponse = {
  accessToken: string;
  refreshToken: string;
  user: UserDto;
};

export type ProfileDto = {
  id: number;
  user: UserDto;
  nickname: string | null;
  bio: string | null;
  headline: string | null;
  location: string | null;
  websiteUrl: string | null;
  postsCount: number;
  followersCount: number;
  followingCount: number;
  createdAt: string;
  updatedAt: string;
};

export type UpdateProfileRequest = {
  fullName?: string;
  nickname?: string;
  bio?: string;
  headline?: string;
  location?: string;
  websiteUrl?: string;
  privateAccount?: boolean;
  avatarUrl?: string;
  coverUrl?: string;
};

export type PostDto = {
  id: number;
  user: UserDto;
  caption: string | null;
  media: PostMediaDto[];
  taggedUsers: TaggedUserDto[];
  hashtags: string[];
  likesCount: number;
  commentsCount: number;
  likedByCurrentUser: boolean;
  savedByCurrentUser: boolean;
  createdAt: string;
  updatedAt: string;
};

export type PostMediaDto = {
  id: number;
  url: string;
  thumbnailUrl: string | null;
  type: string;
  position: number;
  width: number | null;
  height: number | null;
};

export type TaggedUserDto = {
  user: UserDto;
  mediaPosition: number;
  x: number | null;
  y: number | null;
};

export type PostMediaRequest = {
  url: string;
  thumbnailUrl?: string | null;
  type?: string;
  width?: number | null;
  height?: number | null;
};

export type StoryMediaRequest = PostMediaRequest;

export type CreateStoryRequest = {
  caption?: string;
  media?: StoryMediaRequest[];
};

export type StoryDto = {
  id: number;
  user: UserDto;
  caption: string | null;
  media: PostMediaDto[];
  createdAt: string;
  expiresAt: string;
};

export type StoryViewDto = {
  user: UserDto;
  viewedAt: string;
};

export type UserStoriesDto = {
  user: UserDto;
  stories: StoryDto[];
  hasUnseen: boolean;
  latestStoryTime: string;
};

export type CommentDto = {
  id: number;
  user: UserDto;
  content: string;
  likesCount: number;
  likedByCurrentUser: boolean;
  createdAt: string;
};

export type MediaDto = {
  id: number;
  url: string;
  thumbnailUrl: string | null;
  type: string;
  position: number;
  originalFilename: string;
  fileSize: number;
  createdAt: string;
};

export type FollowStatus = 'NONE' | 'PENDING' | 'ACCEPTED';

export type FollowDto = {
  follower: UserDto;
  following: UserDto;
  status: FollowStatus;
  createdAt: string;
  approvedAt: string | null;
};

export type SuggestionDto = {
  user: UserDto;
  mutualCount: number;
  mutualFriendNames: string[];
};

export type TrendingHashtagDto = {
  name: string;
  usageCount: number;
  trendScore: number;
};

export type NotificationDto = {
  id: number;
  type: string;
  title: string;
  content: string;
  url: string | null;
  targetId: string | null;
  lastInteractorId: number | null;
  interactionCount: number;
  read: boolean;
  createdAt: string;
};

export type ConversationDto = {
  id: number;
  name: string | null;
  group: boolean;
  members: UserDto[];
  lastMessage: MessageDto | null;
  unreadCount: number;
  createdAt: string;
};

export type MessageDto = {
  id: number;
  conversationId: number;
  sender: UserDto;
  content: string | null;
  attachmentUrl: string | null;
  sharedPostId: number | null;
  sharedStoryId: number | null;
  disappearing: boolean;
  expiresAt: string | null;
  createdAt: string;
  deleted: boolean;
  read: boolean;
  readAt: string | null;
  mine: boolean;
};

export type CallSignalEvent = 'invite' | 'offer' | 'answer' | 'ice' | 'reject' | 'end';

export type CallSignalDto = {
  event: CallSignalEvent;
  callId: string;
  conversationId: number;
  senderId: number;
  receiverId: number;
  callType: 'audio' | 'video' | string | null;
  sdp: string | null;
  candidate: string | null;
  sender: UserDto;
  createdAt: string;
};

export type CallInvitePayload = {
  callId?: string;
  conversationId: number;
  callerId: number;
  receiverId: number;
  callType: 'audio' | 'video';
};

export type CallDescriptionPayload = {
  callId: string;
  conversationId: number;
  senderId: number;
  receiverId: number;
  sdp: string;
};

export type CallIcePayload = {
  callId: string;
  conversationId: number;
  senderId: number;
  receiverId: number;
  candidate: string;
};

export type CallStatePayload = {
  callId: string;
  conversationId: number;
  senderId: number;
  receiverId: number;
};

export type AccountSettingsDto = {
  phoneNumber: string | null;
  dateOfBirth: string | null;
  emailNotificationsEnabled: boolean;
  pushNotificationsEnabled: boolean;
  autoplayVideoEnabled: boolean;
  contentVisibleToPublic: boolean;
  searchIndexingEnabled: boolean;
  twoFactorEnabled: boolean;
  active: boolean;
  deactivatedAt: string | null;
};

export type UpdateAccountSettingsRequest = {
  phoneNumber?: string | null;
  dateOfBirth?: string | null;
  emailNotificationsEnabled?: boolean;
  pushNotificationsEnabled?: boolean;
  autoplayVideoEnabled?: boolean;
  contentVisibleToPublic?: boolean;
  searchIndexingEnabled?: boolean;
  twoFactorEnabled?: boolean;
};

export type ChangePasswordRequest = {
  currentPassword: string;
  newPassword: string;
};

export type SessionDto = {
  id: number;
  createdAt: string;
  expiresAt: string;
  current: boolean;
};

