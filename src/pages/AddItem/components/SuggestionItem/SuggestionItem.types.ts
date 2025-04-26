import { SuggestionItemType } from "../WantedItemForm/WantedItemForm.types";

export interface SuggestionItemPropsTypes {
  data: SuggestionItemType[];
  loading: boolean;
  handleSuggestionSelect: (arg0: SuggestionItemType) => void;
  title: string;
  showSuggestion: boolean;
}
