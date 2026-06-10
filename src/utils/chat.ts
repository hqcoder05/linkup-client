import type { MessageDto, UserDto } from '@/types/api';

export function isMessageMine(message: MessageDto, currentUser: UserDto | null) {
  if (!currentUser) return false;
  if (message.sender.id === currentUser.id) return true;
  return Boolean(
    message.sender.email &&
      currentUser.email &&
      message.sender.email.toLowerCase() === currentUser.email.toLowerCase(),
  );
}

export function mergeMessagesChronologically(...groups: Array<MessageDto[] | undefined>) {
  const byId = new Map<number, MessageDto>();
  groups.flatMap((group) => group ?? []).forEach((message) => {
    byId.set(message.id, message);
  });

  return Array.from(byId.values()).sort((left, right) => {
    const leftTime = new Date(left.createdAt).getTime();
    const rightTime = new Date(right.createdAt).getTime();
    if (leftTime !== rightTime) return leftTime - rightTime;
    return left.id - right.id;
  });
}
