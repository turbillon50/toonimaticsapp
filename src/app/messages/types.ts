export type MessageChatKind = 'direct' | 'group'

export interface MessageChat {
  id: string
  kind: MessageChatKind
  name: string
  avatarUrl: string | null
  lastMessage: string
  lastMessageAt: string
  unreadCount: number
  memberCount: number
}
