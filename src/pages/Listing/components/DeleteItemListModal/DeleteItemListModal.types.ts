export interface DeleteItemListModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  hasPendingBids: boolean;
}