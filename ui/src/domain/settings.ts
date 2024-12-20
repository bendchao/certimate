export const SETTINGS_NAME_EMAILS = "emails" as const;
export const SETTINGS_NAME_NOTIFYTEMPLATES = "notifyTemplates" as const;
export const SETTINGS_NAME_NOTIFYCHANNELS = "notifyChannels" as const;
export const SETTINGS_NAME_SSLPROVIDER = "sslProvider" as const;
export const SETTINGS_NAMES = Object.freeze({
  EMAILS: SETTINGS_NAME_EMAILS,
  NOTIFY_TEMPLATES: SETTINGS_NAME_NOTIFYTEMPLATES,
  NOTIFY_CHANNELS: SETTINGS_NAME_NOTIFYCHANNELS,
  SSL_PROVIDER: SETTINGS_NAME_SSLPROVIDER,
} as const);

export interface SettingsModel<T> extends BaseModel {
  name: string;
  content: T;
}

// #region Settings: Emails
export type EmailsSettingsContent = {
  emails: string[];
};
// #endregion

// #region Settings: NotifyTemplates
export type NotifyTemplatesSettingsContent = {
  notifyTemplates: NotifyTemplate[];
};

export type NotifyTemplate = {
  subject: string;
  message: string;
};

export const defaultNotifyTemplate: NotifyTemplate = {
  subject: "您有 {COUNT} 张证书即将过期",
  message: "有 {COUNT} 张证书即将过期，域名分别为 {DOMAINS}，请保持关注！",
};
// #endregion

// #region Settings: NotifyChannels
export type NotifyChannelsSettingsContent = {
  /*
    注意：如果追加新的类型，请保持以 ASCII 排序。
    NOTICE: If you add new type, please keep ASCII order.
  */
  [key: string]: ({ enabled?: boolean } & Record<string, unknown>) | undefined;
  bark?: BarkNotifyChannelConfig;
  dingtalk?: DingTalkNotifyChannelConfig;
  email?: EmailNotifyChannelConfig;
  lark?: LarkNotifyChannelConfig;
  serverchan?: ServerChanNotifyChannelConfig;
  telegram?: TelegramNotifyChannelConfig;
  webhook?: WebhookNotifyChannelConfig;
};

export type BarkNotifyChannelConfig = {
  deviceKey: string;
  serverUrl: string;
  enabled?: boolean;
};

export type EmailNotifyChannelConfig = {
  smtpHost: string;
  smtpPort: number;
  smtpTLS: boolean;
  username: string;
  password: string;
  senderAddress: string;
  receiverAddress: string;
  enabled?: boolean;
};

export type DingTalkNotifyChannelConfig = {
  accessToken: string;
  secret: string;
  enabled?: boolean;
};

export type LarkNotifyChannelConfig = {
  webhookUrl: string;
  enabled?: boolean;
};

export type ServerChanNotifyChannelConfig = {
  url: string;
  enabled?: boolean;
};

export type TelegramNotifyChannelConfig = {
  apiToken: string;
  chatId: string;
  enabled?: boolean;
};

export type WebhookNotifyChannelConfig = {
  url: string;
  enabled?: boolean;
};

export type NotifyChannel = {
  type: string;
  name: string;
};

export const notifyChannelsMap: Map<NotifyChannel["type"], NotifyChannel> = new Map(
  [
    ["email", "common.notifier.email"],
    ["dingtalk", "common.notifier.dingtalk"],
    ["lark", "common.notifier.lark"],
    ["telegram", "common.notifier.telegram"],
    ["serverchan", "common.notifier.serverchan"],
    ["bark", "common.notifier.bark"],
    ["webhook", "common.notifier.webhook"],
  ].map(([type, name]) => [type, { type, name }])
);
// #endregion

// #region Settings: SSLProvider
export type SSLProvider = "letsencrypt" | "zerossl" | "gts";

export type SSLProviderSetting = {
  provider: SSLProvider;
  config: {
    [key: string]: {
      [key: string]: string;
    };
  };
};
// #endregion
