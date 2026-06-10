import { Circle, MessageCircle, Search, X } from 'lucide-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Avatar } from '@/components/common/Avatar';
import { ChatPopup } from '@/components/chat/ChatPopup';
import { Card } from '@/components/ui/Card';
import { chatApi } from '@/api/chat';
import { followApi } from '@/api/follow';
import { useAuthStore } from '@/stores/authStore';
import { displayName } from '@/utils/format';
import type { ConversationDto, UserDto } from '@/types/api';

type ContactSidebarProps = {
  desktop?: boolean;
  floating?: boolean;
  embedded?: boolean;
};

export function ContactSidebar({ desktop = true, floating = true, embedded = false }: ContactSidebarProps) {
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const [activeChat, setActiveChat] = useState<ConversationDto | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [keyword, setKeyword] = useState('');

  const contacts = useQuery({
    queryKey: ['following', user?.id],
    queryFn: () => followApi.getFollowing(user!.id),
    enabled: Boolean(user?.id),
    retry: false,
  });

  const openConversation = useMutation({
    mutationFn: (contact: UserDto) => chatApi.createConversation([contact.id]),
    onSuccess: (conversation) => {
      setActiveChat(conversation);
      setDrawerOpen(false);
    },
  });

  const filteredContacts = useMemo(() => {
    const normalized = keyword.trim().toLowerCase();
    if (!normalized) return contacts.data ?? [];
    return (contacts.data ?? []).filter((contact) =>
      `${contact.fullName} ${contact.email}`.toLowerCase().includes(normalized),
    );
  }, [contacts.data, keyword]);

  if (!user) return null;

  return (
    <>
      {desktop &&
        (embedded ? (
          <Card className="rounded-lg p-4 shadow-sm">
            <ContactPanel
              contacts={filteredContacts.slice(0, 10)}
              keyword={keyword}
              setKeyword={setKeyword}
              isLoading={contacts.isLoading}
              isEmpty={contacts.data?.length === 0}
              isError={contacts.isError || openConversation.isError}
              isPending={openConversation.isPending}
              onOpen={(contact) => openConversation.mutate(contact)}
            />
          </Card>
        ) : (
          <aside className="hidden xl:block">
            <Card className="sticky top-20 rounded-lg p-4 shadow-sm">
              <ContactPanel
                contacts={filteredContacts.slice(0, 10)}
                keyword={keyword}
                setKeyword={setKeyword}
                isLoading={contacts.isLoading}
                isEmpty={contacts.data?.length === 0}
                isError={contacts.isError || openConversation.isError}
                isPending={openConversation.isPending}
                onOpen={(contact) => openConversation.mutate(contact)}
              />
            </Card>
          </aside>
        ))}
      {floating && (
        <button
          type="button"
          className="fixed bottom-5 right-5 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-slate-950 text-white shadow-xl transition-transform active:scale-95 xl:hidden"
          aria-label={t('feed.contacts')}
          onClick={() => setDrawerOpen(true)}
        >
          <MessageCircle className="h-5 w-5" />
        </button>
      )}
      {drawerOpen && floating && (
        <div className="fixed inset-0 z-[65] xl:hidden">
          <button
            type="button"
            aria-label="Close contacts"
            className="absolute inset-0 bg-black/30"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="absolute bottom-0 right-0 top-0 w-full max-w-[360px] overflow-y-auto bg-white p-4 shadow-2xl">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-950">{t('feed.contacts')}</h2>
              <button
                type="button"
                className="rounded-full p-2 text-slate-700 hover:bg-slate-100"
                onClick={() => setDrawerOpen(false)}
                aria-label="Close contacts"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          <ContactPanel
            contacts={filteredContacts}
            keyword={keyword}
            setKeyword={setKeyword}
            isLoading={contacts.isLoading}
            isEmpty={contacts.data?.length === 0}
            isError={contacts.isError || openConversation.isError}
            isPending={openConversation.isPending}
            onOpen={(contact) => openConversation.mutate(contact)}
          />
          </div>
        </div>
      )}
      {activeChat && <ChatPopup conversation={activeChat} currentUser={user} onClose={() => setActiveChat(null)} />}
    </>
  );
}

function ContactPanel({
  contacts,
  keyword,
  setKeyword,
  isLoading,
  isEmpty,
  isError,
  isPending,
  onOpen,
}: {
  contacts: UserDto[];
  keyword: string;
  setKeyword: (value: string) => void;
  isLoading: boolean;
  isEmpty: boolean;
  isError: boolean;
  isPending: boolean;
  onOpen: (contact: UserDto) => void;
}) {
  const { t } = useTranslation();

  return (
    <>
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-slate-950">{t('feed.contacts')}</h2>
        <Link to="/chat" className="text-xs font-semibold text-slate-500 hover:text-slate-950">
          {t('feed.view_all')}
        </Link>
      </div>
      <label className="mt-3 flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 text-slate-500">
        <Search className="h-4 w-4" />
        <input
          className="w-full bg-transparent text-sm outline-none"
          placeholder={t('feed.search_messages')}
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
        />
      </label>
      <div className="mt-4 space-y-1">
        {contacts.map((contact) => (
          <button
            key={contact.id}
            type="button"
            onClick={() => onOpen(contact)}
            className="flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-slate-50 disabled:cursor-wait disabled:opacity-60"
            disabled={isPending}
          >
            <div className="relative">
              <Avatar user={contact} size="sm" />
              <span className="absolute bottom-0 right-0 rounded-full bg-white p-0.5">
                <Circle className="h-2.5 w-2.5 fill-emerald-500 text-emerald-500" />
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-900">{displayName(contact)}</p>
              <p className="truncate text-xs text-slate-500">{contact.email}</p>
            </div>
          </button>
        ))}
        {isLoading && <p className="px-2 py-3 text-sm text-slate-500">{t('feed.loading_contacts')}</p>}
        {isEmpty && <p className="px-2 py-3 text-sm text-slate-500">{t('feed.no_contacts')}</p>}
        {!isEmpty && !isLoading && contacts.length === 0 && (
          <p className="px-2 py-3 text-sm text-slate-500">{t('feed.no_contact_results')}</p>
        )}
        {isError && <p className="px-2 py-3 text-sm text-slate-500">{t('feed.contacts_unavailable')}</p>}
      </div>
    </>
  );
}
