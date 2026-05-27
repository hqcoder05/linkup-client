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
};

export type PostDto = {
  id: number;
  user: UserDto;
  caption: string | null;
  imageUrl: string | null;
  videoUrl: string | null;
  likesCount: number;
  commentsCount: number;
  likedByCurrentUser: boolean;
  createdAt: string;
  updatedAt: string;
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
  type: string;
  originalFilename: string;
  fileSize: number;
  createdAt: string;
};

export type ResumeDto = {
  id: number;
  url: string;
  originalFilename: string;
  contentType: string;
  fileSize: number;
  createdAt: string;
};

export type ConnectionDto = {
  requester: UserDto;
  addressee: UserDto;
  status: string;
  createdAt: string;
  respondedAt: string | null;
};

export type NotificationDto = {
  id: number;
  type: string;
  title: string;
  content: string;
  url: string | null;
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
  createdAt: string;
  deleted: boolean;
  read: boolean;
  readAt: string | null;
  mine: boolean;
};
