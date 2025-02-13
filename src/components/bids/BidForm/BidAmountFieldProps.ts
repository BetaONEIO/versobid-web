export interface BidAmountFieldProps {
  amount: number;
  onChange: (amount: number) => void;
  minPrice?: number;
  maxPrice?: number;
}