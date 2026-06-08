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
  privateAccount: boolean;
  role: string;
  followersCount?: number;
  followingCount?: number;
  followedByCurrentUser?: boolean;
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
  followedByCurrentUser?: boolean;
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
