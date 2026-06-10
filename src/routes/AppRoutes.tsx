import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { AppLayout } from '@/layouts/AppLayout';
import { AuthLayout } from '@/layouts/AuthLayout';
import { useBootstrapAuth } from '@/hooks/useBootstrapAuth';
import { ProtectedRoute } from '@/routes/ProtectedRoute';

const HomePage = lazy(() => import('@/pages/feed/HomePage').then((module) => ({ default: module.HomePage })));
const FeedPage = lazy(() => import('@/pages/feed/FeedPage').then((module) => ({ default: module.FeedPage })));
const SavedPostsPage = lazy(() =>
  import('@/pages/feed/SavedPostsPage').then((module) => ({ default: module.SavedPostsPage })),
);
const ExplorePage = lazy(() => import('@/pages/feed/ExplorePage').then((module) => ({ default: module.ExplorePage })));
const PostDetailPage = lazy(() =>
  import('@/pages/feed/PostDetailPage').then((module) => ({ default: module.PostDetailPage })),
);
const HashtagPage = lazy(() => import('@/pages/feed/HashtagPage').then((module) => ({ default: module.HashtagPage })));
const StoryDetailPage = lazy(() =>
  import('@/pages/feed/StoryDetailPage').then((module) => ({ default: module.StoryDetailPage })),
);
const SearchPage = lazy(() => import('@/pages/search/SearchPage').then((module) => ({ default: module.SearchPage })));
const LoginPage = lazy(() => import('@/pages/auth/LoginPage').then((module) => ({ default: module.LoginPage })));
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage').then((module) => ({ default: module.RegisterPage })));
const ProfilePage = lazy(() => import('@/pages/profile/ProfilePage').then((module) => ({ default: module.ProfilePage })));
const ConnectionsPage = lazy(() =>
  import('@/pages/connections/ConnectionsPage').then((module) => ({ default: module.ConnectionsPage })),
);
const ConnectionListPage = lazy(() =>
  import('@/pages/connections/ConnectionListPage').then((module) => ({ default: module.ConnectionListPage })),
);
const ChatPage = lazy(() => import('@/pages/chat/ChatPage').then((module) => ({ default: module.ChatPage })));
const SettingsPage = lazy(() =>
  import('@/pages/settings/SettingsPage').then((module) => ({ default: module.SettingsPage })),
);
const NotificationsPage = lazy(() =>
  import('@/pages/settings/NotificationsPage').then((module) => ({ default: module.NotificationsPage })),
);

function RouteFallback() {
  return <Card className="mx-auto max-w-xl rounded-lg p-5 text-sm text-slate-500">Loading...</Card>;
}

export function AppRoutes() {
  useBootstrapAuth();

  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>
        <Route element={<AppLayout />}>
          <Route index element={<HomePage />} />
          <Route path="/profile/:id" element={<ProfilePage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/feed" element={<FeedPage />} />
            <Route path="/explore" element={<ExplorePage />} />
            <Route path="/saved" element={<SavedPostsPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/hashtags/:name" element={<HashtagPage />} />
            <Route path="/posts/:postId" element={<PostDetailPage />} />
            <Route path="/stories/:storyId" element={<StoryDetailPage />} />
            <Route path="/profile/me" element={<ProfilePage me />} />
            <Route path="/connections" element={<ConnectionsPage />} />
            <Route path="/connections/followers" element={<ConnectionListPage />} />
            <Route path="/connections/following" element={<ConnectionListPage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/chat/:conversationId" element={<ChatPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
