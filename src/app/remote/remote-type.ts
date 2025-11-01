export interface IRemoteParams {
  accessKey: string;
  tenantId?: string;
  userId?: string;
  shortCode?: number;
}

export interface IRemoteResult<T> {
  data?: T;
  message: string;
  success: boolean;
  isHospimanAdmin?: true;
  debug?: any;
}

export interface IEmailSenderToRemote {
  subject: string;
  body: string;
  emails: string[];
  tenantId?: string;
  userId?: string;
}

export interface ISmsSenderToRemote {
  message: string;
  recipients: string[];
  tenantId: string;
  userId: string | "system_jobs";
}

export interface ISmsSendExchangeResult {
  smsMessage: string | null;
  errorMessage: string | null;
  infoMessage: string | null;
  success: boolean;
  recipients: string[];
  tenantId: string | null;
}

export interface IEmailSendExchangeResult {
  subject: string;
  errorMessage: string | null;
  success: boolean;
  emails: string[];
}
