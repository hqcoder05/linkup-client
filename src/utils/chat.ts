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
