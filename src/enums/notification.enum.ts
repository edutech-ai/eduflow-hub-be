export enum NotificationType {
  // Account & Auth
  ACCOUNT_CREATED = 'ACCOUNT_CREATED',
  EMAIL_VERIFIED = 'EMAIL_VERIFIED',
  PASSWORD_CHANGED = 'PASSWORD_CHANGED',

  // Future types can be added here
  // PASSWORD_RESET = 'PASSWORD_RESET',
  // EMAIL_CHANGED = 'EMAIL_CHANGED',
}

export enum NotificationStatus {
  UNREAD = 'UNREAD',
  READ = 'READ',
}
