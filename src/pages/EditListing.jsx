import { useEffect, useState } from "react"; // Import useState and useEffect hooks.
import { useNavigate, useParams } from "react-router-dom"; // Import useNavigate for routing and useParams to get URL parameters.
import { getAuth } from "firebase/auth"; // Import getAuth for Firebase authentication.
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage"; // Import Firebase Storage functions.
import {
  addDoc,
  collection,
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore"; // Import Firestore functions for document management.

import Spinner from "../components/Spinner"; // Import Spinner component for loading indication.
import { toast } from "react-toastify"; // Import toast for notifications.
import { db } from "../Firebase";

export default function EditListing() {
  const [loading, setLoading] = useState(false); // State for loading indication.
  const [formData, setFormData] = useState({
    // State to manage form data.
    type: "rent",
    name: "",
    bedrooms: 1,
    bathrooms: 1,
    parking: false,
    furnished: false,
    address: "",
    description: "",
    offer: false,
    regularPrice: 0,
    discountedPrice: 0,
    images: [],
  });

  const {
    type,
    name,
    bedrooms,
    bathrooms,
    parking,
    furnished,
    address,
    description,
    offer,
    regularPrice,
    discountedPrice,
    images,
  } = formData; // Destructure formData for easier access.

  const params = useParams(); // Get URL parameters for the listing ID.
  const navigate = useNavigate(); // Initialize useNavigate for routing.
  const auth = getAuth(); // Get Firebase authentication instance.

  useEffect(() => {
    async function fetchListing() {
      setLoading(true); // Start loading indicator.
      try {
        const docRef = doc(db, "listings", params.listingId); // Get the listing document reference.
        const docSnap = await getDoc(docRef); // Fetch the document snapshot.

        if (docSnap.exists()) {
          setFormData({
            ...docSnap.data(),
            images: [], // Clear images field since it will be handled separately.
          });
        } else {
          toast.error("Listing does not exist"); // Show error if listing is not found.
        }
      } catch (error) {
        toast.error("Error fetching listing"); // Show error if there’s an issue fetching the listing.
      }
      setLoading(false); // Stop loading indicator.
    }

    fetchListing();
  }, [params.listingId]); // Depend on listingId to fetch correct listing.

  function onChange(e) {
    let boolean = null; // Initialize boolean for true/false string conversion.
    if (e.target.value === "true") {
      boolean = true; // Convert "true" string to boolean true.
    }
    if (e.target.value === "false") {
      boolean = false; // Convert "false" string to boolean false.
    }
    if (e.target.files) {
      setFormData((prevState) => ({
        ...prevState,
        images: e.target.files, // Update images field with selected files.
      }));
    } else {
      setFormData((prevState) => ({
        ...prevState,
        [e.target.id]: boolean ?? e.target.value, // Update other fields.
      }));
    }
  }

  async function onSubmit(e) {
    e.preventDefault(); // Prevent default form submission.
    setLoading(true); // Start loading indicator.

    if (+discountedPrice >= +regularPrice) {
      setLoading(false); // Validate discounted price and show error if invalid.
      toast.error("Discounted Price must be less than regular price");
      return;
    }

    if (images.length > 6) {
      setLoading(false); // Validate image count and show error if too many.
      toast.error("Max limit of 6 images reached");
      return;
    }

    const imgUrls = await Promise.all(
      [...images].map((image) => storeImage(image))
    ).catch(() => {
      setLoading(false);
      toast.error("Error uploading images"); // Show error if image upload fails.
      return [];
    });

    if (imgUrls.length === 0) return; // Stop if no images were uploaded.

    const formDataCopy = {
      ...formData, // Copy form data.
      imgUrls, // Add uploaded image URLs.
      timestamp: serverTimestamp(), // Add server timestamp.
      userRef: auth.currentUser.uid, // Add current user reference.
    };

    delete formDataCopy.images; // Remove images field from formDataCopy.
    if (!offer) delete formDataCopy.discountedPrice; // Remove discountedPrice if no offer.

    try {
      const docRef = doc(db, "listings", params.listingId); // Get the document reference for update.
      await updateDoc(docRef, formDataCopy); // Update the document in Firestore.
      setLoading(false);
      toast.success("Listing updated successfully"); // Show success message.
      navigate(`/profile`); // Navigate to the updated listing page.
    } catch (error) {
      setLoading(false);
      toast.error("Error updating listing"); // Show error if update fails.
    }
  }

  async function storeImage(image) {
    return new Promise((resolve, reject) => {
      const storage = getStorage(); // Get Firebase Storage instance.
      const filename = `${auth.currentUser.uid}-${image.name}-${Date.now()}`; // Generate unique filename.
      const storageRef = ref(storage, `images/${filename}`); // Create storage reference.
      const uploadTask = uploadBytesResumable(storageRef, image); // Start upload task.

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          // Optional: Handle upload progress here.
        },
        (error) => {
          reject(error); // Reject promise if upload fails.
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            resolve(downloadURL); // Resolve promise with download URL.
          });
        }
      );
    });
  }

  if (loading) {
    return <Spinner />; // Show loading spinner if loading.
  }

  return (
    <main className="max-w-lg mx-auto p-8 bg-white shadow-lg rounded-lg">
      <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">
        Edit Listing
      </h1>
      <form onSubmit={onSubmit}>
        {/* Sell/Rent Selector */}
        <div className="flex justify-center space-x-4 mb-6">
          <button
            type="button"
            id="type"
            value="sale"
            onClick={onChange}
            className={`px-6 py-2 font-semibold rounded-lg text-sm uppercase 
          shadow-md focus:shadow-lg active:shadow-lg 
          transition duration-150 ease-in-out transform hover:scale-105 
          ${
            type === "rent"
              ? "bg-slate-300 text-gray-800 hover:bg-slate-400"
              : "bg-blue-500 text-white hover:bg-blue-700"
          }`}>
            Sell
          </button>
          <button
            type="button"
            id="type"
            value="rent"
            onClick={onChange}
            className={`px-6 py-2 font-semibold rounded-lg text-sm uppercase 
          shadow-md focus:shadow-lg active:shadow-lg 
          transition duration-150 ease-in-out transform hover:scale-105 
          ${
            type === "sale"
              ? "bg-slate-300 text-gray-800 hover:bg-slate-400"
              : "bg-blue-500 text-white hover:bg-blue-700"
          }`}>
            Rent
          </button>
        </div>

        {/* Property Name */}
        <div className="mb-6">
          <label className="block text-gray-700 uppercase text-sm font-bold mb-2">
            Name
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={onChange}
            placeholder="Enter property name"
            maxLength="32"
            minLength="10"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg 
          transition duration-150 ease-in-out focus:outline-none 
          focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Bedrooms and Bathrooms */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Bedrooms
            </label>
            <input
              type="number"
              id="bedrooms"
              value={bedrooms}
              onChange={onChange}
              placeholder="e.g. 3"
              max="20"
              min="1"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg 
            focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Bathrooms
            </label>
            <input
              type="number"
              id="bathrooms"
              value={bathrooms}
              onChange={onChange}
              placeholder="e.g. 2"
              max="10"
              min="1"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg 
            focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Parking Spot */}
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Parking Spot
          </label>
          <div className="flex space-x-4">
            <button
              type="button"
              id="parking"
              value={true}
              onClick={onChange}
              className={`px-4 py-2 font-semibold rounded-lg shadow-md 
            focus:outline-none focus:ring-2 focus:ring-blue-500 
            transition transform hover:scale-105 
            ${
              parking
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-gray-300 text-gray-700 hover:bg-gray-400"
            }`}>
              Yes
            </button>
            <button
              type="button"
              id="parking"
              value={false}
              onClick={onChange}
              className={`px-4 py-2 font-semibold rounded-lg shadow-md 
            focus:outline-none focus:ring-2 focus:ring-gray-400 
            transition transform hover:scale-105 
            ${
              !parking
                ? "bg-blue-500 text-white hover:bg-blue-700"
                : "bg-gray-300 text-gray-700 hover:bg-gray-400"
            }`}>
              No
            </button>
          </div>
        </div>

        {/* Furnished */}
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Furnished
          </label>
          <div className="flex space-x-4">
            <button
              type="button"
              id="furnished"
              value={true}
              onClick={onChange}
              className={`px-4 py-2 font-semibold rounded-lg shadow-md 
            focus:outline-none focus:ring-2 focus:ring-blue-500 
            transition transform hover:scale-105 
            ${
              furnished
                ? "bg-blue-500 text-white hover:bg-blue-700"
                : "bg-gray-300 text-gray-700 hover:bg-gray-400"
            }`}>
              Yes
            </button>
            <button
              type="button"
              id="furnished"
              value={false}
              onClick={onChange}
              className={`px-4 py-2 font-semibold rounded-lg shadow-md 
            focus:outline-none focus:ring-2 focus:ring-gray-400 
            transition transform hover:scale-105 
            ${
              !furnished
                ? "bg-blue-500 text-white hover:bg-blue-700"
                : "bg-gray-300 text-gray-700 hover:bg-gray-400"
            }`}>
              No
            </button>
          </div>
        </div>

        {/* Address */}
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Address
          </label>
          <input
            type="text"
            id="address"
            value={address}
            onChange={onChange}
            placeholder="Enter address"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg 
    focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150 ease-in-out"
          />
        </div>

        {/* Description */}
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={onChange}
            placeholder="Enter a detailed description of the property"
            required
            className="w-full h-32 px-4 py-2 border border-gray-300 rounded-lg 
          focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none 
          transition duration-150 ease-in-out"
          />
        </div>

        {/* Offers */}
        <p className="text-lg font-semibold text-gray-800 mb-2">Offer</p>
        <div className="flex mb-6 space-x-4">
          <button
            type="button"
            id="offer"
            value={true}
            onClick={onChange}
            className={`px-6 py-3 font-medium text-sm uppercase rounded-lg shadow-md 
          transition duration-150 ease-in-out w-full 
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 
          ${
            offer
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}>
            Yes
          </button>
          <button
            type="button"
            id="offer"
            value={false}
            onClick={onChange}
            className={`px-6 py-3 font-medium text-sm uppercase rounded-lg shadow-md 
          transition duration-150 ease-in-out w-full 
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 
          ${
            !offer
              ? "bg-blue-500 text-white hover:bg-blue-700"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}>
            No
          </button>
        </div>

        <div className="flex items-center mb-6">
          <div className="w-full">
            <p className="text-lg font-semibold text-gray-800">Regular Price</p>
            <div className="flex justify-between items-center space-x-6">
              <input
                type="number"
                id="regularPrice"
                value={regularPrice}
                onChange={onChange}
                min="50"
                max="400000000"
                required
                className="w-full px-4 py-2 text-xl text-gray-800 bg-white border border-gray-300 rounded-lg transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 text-center shadow-sm"
              />
              {type === "rent" && (
                <p className="text-md text-gray-600 whitespace-nowrap">
                  $ / Month
                </p>
              )}
            </div>
          </div>
        </div>

        {offer && (
          <div className="flex items-center mb-6">
            <div className="w-full">
              <p className="text-lg font-semibold text-gray-800">
                Discounted Price
              </p>
              <div className="flex justify-between items-center space-x-6">
                <input
                  type="number"
                  id="discountedPrice"
                  value={discountedPrice}
                  onChange={onChange}
                  min="50"
                  max="400000000"
                  required={offer}
                  className="w-full px-4 py-2 text-xl text-gray-800 bg-white border border-gray-300 rounded-lg transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 text-center shadow-sm"
                />
                {type === "rent" && (
                  <p className="text-md text-gray-600 whitespace-nowrap">
                    $ / Month
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Images */}
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Upload Images
          </label>
          <input
            type="file"
            id="images"
            onChange={onChange}
            accept=".jpg,.png,.jpeg"
            multiple
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg 
          focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150 ease-in-out"
          />
        </div>

        <button
          type="submit"
          className="w-full py-3 mt-6 font-semibold text-white bg-blue-600 rounded-lg shadow-md 
        hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition 
        transform hover:scale-105">
          Edit Listing
        </button>
      </form>
    </main>
  );
}
