import { EmailTemplate } from '../types';
import { getAppUrl } from '../../../utils/email/emailUtils';

interface NewMessageParams {
  senderName: string;
  messagePreview: string;
  conversationId: string;
}

export const newMessageTemplate: EmailTemplate<NewMessageParams> = {
  name: 'new-message',
  subject: 'New Message on VersoBid',
  getParams: (data?: NewMessageParams) => ({
    sender_name: data?.senderName ?? '',
    message_preview: data?.messagePreview ?? '',
    conversation_link: data?.conversationId ? `${getAppUrl()}/messages/${data.conversationId}` : ''
  })
};