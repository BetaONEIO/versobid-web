import { Item } from "../../../types"

export const MockItemListDetail: Item = {
  id: "qwer",
  sellerId: "qwerty",
  status: "active",
  createdAt: "2025-04-21T11:19:48.201243+00:00",
  sellerUsername: "Patrick",
  archivedReason: "",
  archivedAt: "",
  title: "iPhone 15 Pro",
  imageUrl:
    "https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/iphone-15-pro-black-titanium-select?wid=940&hei=1112&fmt=png-alpha",
  description: "",
  minPrice: 100,
  maxPrice: 1000,
  category: "Electronics",
  shippingOptions: [
    {
      type: "shipping",
      cost: 10,
      location: { postcode: "2344PO", town: "Any town", maxDistance: 100 },
    },
  ],
  condition: "new",
  type: "item",
  serviceDetails: null,
}