import { Bid } from "../../../types";

export const MockBidList: Bid[] = [
  {
    id: "qwer_bid",
    item_id: "qwer",
    bidder_id: "1234",
    amount: 100,
    // counter_amount?: numberstring,
    // message?: string | nullstring,
    status: "pending",
    created_at: "2025-04-21T11:19:48.201243+00:00",
    bidder: {
      username: "Patricia",
    },
    item: {
      id: "qwer",
      title: "iPhone 15 Pro",
      description: "",
      minPrice: 100,
      maxPrice: 1000,
      seller_id: "0987",
      category: "Electronics",
      status: "pending",
      created_at: "2025-04-21T11:19:48.201243+00:00",
    },
  },
];
