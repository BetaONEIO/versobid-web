import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useState, useCallback, useRef, useEffect } from "react";
import { useOnClickOutside } from "usehooks-ts";

import {
  QuestionMarkCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";

import { storageService } from "../../../../services/storage/storageService";

import { useUser } from "../../../../contexts/UserContext";
import { useNotification } from "../../../../contexts/NotificationContext";

import { categories } from "../../../../utils/constants";

import { searchProductsByQuery } from "../../../../services/shopping/mockData";

import SuggestionItem from "../SuggestionItem";
import DeliveryOption from "../DeliveryOption";

import { InputsType, SuggestionItemType } from "./WantedItemForm.types";
import { isEmpty, isNil } from "ramda";
import { itemService } from "../../../../services/itemService";
import { Item, ShippingOption } from "../../../../types";

const WantedItemForm = () => {
  const navigate = useNavigate();
  
  const { auth } = useUser();
  const { addNotification } = useNotification();
  
  const ref = useRef(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    formState: { errors },
  } = useForm<InputsType>({
    defaultValues: {
      title: "",
      image_url: "",
      image: null,
      shipping_type: [],
      shipping_cost: 0,
    },
  });

  const { title, image_url, image, shipping_type } = watch();

  const [loading, setLoading] = useState<boolean>(false);
  const [showSuggestion, setShowSuggestion] = useState<boolean>(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SuggestionItemType[]>([]);

  const handleSuggestionSelect = (data: SuggestionItemType) => {
    setShowSuggestion(false);
    setValue("title", data.title);
    setValue('description', data.description);
    setValue('minPrice', Math.floor(data.price * 0.9));
    setValue('maxPrice', Math.ceil(data.price * 1.1));
  };

  const searchSuggestion = useCallback(async() => {
    if (!isEmpty(title)) {
      setIsSearching(true);
      try {
        const result = await searchProductsByQuery(title);
        setSearchResults(result as SuggestionItemType[]);
      } finally {
        setIsSearching(false);
      }
    } else {
      setSearchResults([]);
    }
  }, [title]);

  useEffect(() => {
    searchSuggestion();
  }, [searchSuggestion]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("image_url", { message: "Image size must be less than 5MB" });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setValue("image_url", reader.result as string);
        setValue("image", file);
      };
      reader.readAsDataURL(file);
    }
  };

  const submitHandler = async (data: InputsType) => {
    setLoading(true);

    try {
      let imageUrl = data.image_url;
      if (image && auth.user?.id) {
        // Upload image and get URL
        imageUrl = await storageService.uploadImage(image, auth.user.id);
      }

      // Prepare the item data for the backend
      const itemToSave: Omit<Item, 'id' | 'createdAt'> = {
        title: data.title,
        description: data.description,
        minPrice: data.minPrice,
        maxPrice: data.maxPrice,
        category: data.category,
        shippingOptions: data.shipping_type as unknown as ShippingOption[], // or map if needed
        status: "active",
        buyerId: auth.user?.id as string,
        imageUrl: imageUrl || "",
      };
      await itemService.createItem(itemToSave);
      addNotification("success", "Wanted item posted successfully!");
      navigate("/listings");
    } catch (error) {
      addNotification("error", "Failed to post item");
    } finally {
      setLoading(false);
    }
  };

  useOnClickOutside(ref, () => setShowSuggestion(false));

  if (!auth.user) {
    navigate('/signin');
    return null;
  }

  return (
    <div className="min-w-2xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Post a Wanted Item
      </h2>
      <form
        onSubmit={handleSubmit(submitHandler)}
        className="flex flex-col gap-4"
      >
        <div className="relative">
          <label
            htmlFor="title"
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            What are you looking for?
          </label>
          <input
            id="title"
            type="text"
            {...register("title", {
              required: "Title required",
              onChange: () => {
                setShowSuggestion(true);
              },
            })}
            className="pl-1 mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
            placeholder="Start typing to see suggestions..."
          />
          {errors.title && (
            <span className="text-red-500 text-xs">{errors.title.message}</span>
          )}
          <SuggestionItem
            loading={isSearching}
            data={searchResults}
            handleSuggestionSelect={handleSuggestionSelect}
            title={title}
            showSuggestion={showSuggestion}
            ref={ref}
          />
        </div>
        <div>
          <label
            htmlFor="title"
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Your Budget Range
          </label>
          <div className="flex gap-2">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 h-6 flex items-center">
                <span className="text-gray-500 text-sm h-full flex items-center">
                  £
                </span>
              </div>
              <input
                type="number"
                min="0"
                step="0.01"
                {...register("minPrice", {
                  required: "Minimum Price is required",
                })}
                placeholder="Minimum Price"
                className="pl-7 block w-full h-6 rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
              />
              {errors.minPrice && (
                <span className="text-red-500 text-xs">
                  {errors.minPrice.message}
                </span>
              )}
            </div>
            <span>-</span>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 h-6 flex items-center">
                <span className="text-gray-500 text-sm h-full flex items-center">
                  £
                </span>
              </div>
              <input
                type="number"
                min="0"
                step="0.01"
                {...register("maxPrice", {
                  required: "Maximum Price is required",
                })}
                placeholder="Maximum Price"
                className="pl-7 block w-full h-6 rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
              />
              {errors.maxPrice && (
                <span className="text-red-500 text-xs">
                  {errors.maxPrice.message}
                </span>
              )}
            </div>
          </div>
        </div>
        <div>
          <div className="flex items-center gap-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Upload an Image
            </label>
            <div className="relative group">
              <QuestionMarkCircleIcon className="h-5 w-5 text-gray-400 hover:text-gray-500 cursor-help" />
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 p-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                If you have an image of the item you're looking for, it may help
                our sellers identify it
              </div>
            </div>
          </div>
          <div className="mt-1 flex items-center space-x-4">
            <button
              type="button"
              onClick={() => {
                if (fileInputRef.current) {
                  fileInputRef.current.value = "";
                  fileInputRef.current.click();
                }
              }}
              disabled={!isNil(image)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600 disabled:opacity-50"
            >
              Choose Image
            </button>
            {image && (
              <span className="flex gap-1 align-middle justify-center text-sm text-gray-500 dark:text-gray-400">
                {image?.name}
                <XCircleIcon
                  className="h-5 w-5 text-gray-400 hover:text-gray-500 cursor-pointer"
                  onClick={() => {
                    setValue("image_url", "");
                    setValue("image", null);
                  }}
                />
              </span>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </div>
          {image_url && (
            <div className="mt-2">
              <img
                src={image_url}
                alt="Uploaded preview"
                className="h-32 w-32 object-contain rounded-lg border border-gray-200 dark:border-gray-700"
              />
            </div>
          )}
        </div>
        <div className="flex flex-col">
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Additional Details
          </label>
          <textarea
            id="description"
            rows={4}
            {...register("description", {
              required: "Description is required",
            })}
            className="pl-2 mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
            placeholder="Specify condition, brand preferences, or any other requirements"
          />
        </div>
        <div>
          <label
            htmlFor="category"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Category
          </label>
          <select
            id="category"
            required
            {...register("category", {
              required: "Category is required",
            })}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
        <DeliveryOption
          shippingData={shipping_type}
          setValue={setValue}
          register={register}
        />
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            disabled={loading}
            onClick={() => navigate("/listings")}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700"
          >
            Post Item
          </button>
        </div>
      </form>
    </div>
  );
};

export default WantedItemForm;
