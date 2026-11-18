/**
 * CommercialShell.tsx
 * يغلّف مساحة العمل: الزر العائم + شيت المساعد + بطاقة النشر
 */
import { useState, type ReactNode } from 'react';
import { MessageCircle } from 'lucide-react';
import AIChatSheet from './AIChatSheet';
import PublishBottomSheet from './PublishBottomSheet';

type Props = {
  children: ReactNode;
  aiFloatVisible?: boolean;
  whatsappNumber?: string;
  publishOpen?: boolean;
  onPublishClose?: () => void;
  onPublishApprove?: () => void;
  carTitle?: string;
  publicUrl?: string;
  onAssistantSend?: (text: string) => Promise<string> | string;
};

export default function CommercialShell({
  children,
  aiFloatVisible = true,
  whatsappNumber = '',
  publishOpen = false,
  onPublishClose,
  onPublishApprove,
  carTitle,
  publicUrl,
  onAssistantSend,
}: Props) {
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <>
      {children}

      {aiFloatVisible && (
        <button
          type="button"
          className="ai-float-btn"
          onClick={() => setChatOpen(true)}
          aria-label="مساعد مشكور"
        >
          <MessageCircle size={22} />
        </button>
      )}

      <AIChatSheet
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        onSend={onAssistantSend}
      />

      <PublishBottomSheet
        open={publishOpen}
        carTitle={carTitle}
        whatsappNumber={whatsappNumber}
        publicUrl={publicUrl}
        onApprove={() => onPublishApprove?.()}
        onClose={() => onPublishClose?.()}
      />
    </>
  );
}
