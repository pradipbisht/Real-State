import { doc, getDoc } from "@firebase/firestore";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import { db } from "../firebase";
import Spinner from "../components/Spinner";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, EffectFade, Autoplay, Navigation } from "swiper/modules";
import "swiper/css";
import { FaShare } from "react-icons/fa";

export default function Listing() {
  const params = useParams(); // Correctly get the URL parameters
  const [listing, setListing] = useState(null); // State for storing listing data
  const [loading, setLoading] = useState(true); // State for loading indicator
  const [shareLink, setShareLink] = useState(false);

  useEffect(() => {
    async function fetchListing() {
      // Access the correct collection and document ID
      const docRef = doc(db, "listings", params.listingId);
      const docSnap = await getDoc(docRef); // Fetch the document

      if (docSnap.exists()) {
        setListing(docSnap.data()); // Store the listing data
        setLoading(false); // Set loading to false once data is fetched
      } else {
        console.error("No such document!"); // Log error if document does not exist
      }
    }

    fetchListing();
  }, [params.listingId]); // Dependency array with the correct parameter

  //   Share Link Feature
  const handleShare = () => {
    const url = window.location.href;
  };

  // Loading state
  if (loading) {
    return (
      <div>
        <Spinner />
      </div>
    ); // Display loading indicator
  }

  // Render listing data
  return (
    <main className="container mx-auto p-6">
      {/* Swiper Component for Images */}
      <Swiper
        slidesPerView={1}
        navigation
        pagination={{ clickable: "progressbar" }}
        effect="fade"
        autoplay={{ delay: 3000, disableOnInteraction: false }}
        modules={[Pagination, EffectFade, Autoplay, Navigation]}
        className="mb-6">
        {listing.imgUrls.map((url, index) => (
          <SwiperSlide key={index}>
            <img
              src={url}
              alt={`Listing Image ${index + 1}`}
              className="w-full h-[400px] object-cover rounded-md"
            />
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Share  */}
      <div
        onClick={() => {
          navigator.clipboard.writeText(window.location.href);
          setShareLink(true);
          setTimeout(() => {
            setShareLink(false);
          }, 2000);
          alert("Link copied to clipboard");
        }}
        className="fixed top-[13%] right-[3%] z-10 bg-white cursor-pointer
      p-2 rounded-md shadow-md">
        <FaShare className="text-l" />
      </div>

      {/* Additional Listing Details */}
      <div className="space-y-10">
        {/* Title */}
        <h1 className="text-5xl font-extrabold text-gray-800 mb-8 border-b-4 border-blue-600 pb-4">
          {listing.name}
        </h1>

        {/* Grid Container */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left Column */}
          <div className="lg:col-span-1 bg-gradient-to-r from-blue-100 via-blue-50 to-white p-8 rounded-xl shadow-xl border border-gray-300">
            <div className="space-y-6">
              {/* Type */}
              <div className="flex items-center mb-4">
                <span className="inline-block bg-blue-500 p-2 rounded-full text-white">
                  🏷️
                </span>
                <p className="ml-3 text-xl font-semibold text-gray-800">
                  <span className="text-blue-600">Type:</span>{" "}
                  <span className="text-gray-700">
                    {listing.listtype === "rent" ? "Rent" : "Sale"}
                  </span>
                </p>
              </div>
              {/* Bedrooms */}
              <div className="flex items-center mb-4">
                <span className="inline-block bg-blue-500 p-2 rounded-full text-white">
                  🛏️
                </span>
                <p className="ml-3 text-xl font-semibold text-gray-800">
                  <span className="text-blue-600">Bedrooms:</span>{" "}
                  <span className="text-gray-700">{listing.bedrooms}</span>
                </p>
              </div>
              {/* Bathrooms */}
              <div className="flex items-center mb-4">
                <span className="inline-block bg-blue-500 p-2 rounded-full text-white">
                  🛁
                </span>
                <p className="ml-3 text-xl font-semibold text-gray-800">
                  <span className="text-blue-600">Bathrooms:</span>{" "}
                  <span className="text-gray-700">{listing.bathrooms}</span>
                </p>
              </div>
              {/* Parking */}
              <div className="flex items-center mb-4">
                <span className="inline-block bg-blue-500 p-2 rounded-full text-white">
                  🚗
                </span>
                <p className="ml-3 text-xl font-semibold text-gray-800">
                  <span className="text-blue-600">Parking:</span>{" "}
                  <span className="text-gray-700">
                    {listing.parking ? "Available" : "Not Available"}
                  </span>
                </p>
              </div>
              {/* Furnished */}
              <div className="flex items-center">
                <span className="inline-block bg-blue-500 p-2 rounded-full text-white">
                  🛋️
                </span>
                <p className="ml-3 text-xl font-semibold text-gray-800">
                  <span className="text-blue-600">Furnished:</span>{" "}
                  <span className="text-gray-700">
                    {listing.furnished ? "Yes" : "No"}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-2 bg-white p-8 rounded-lg shadow-lg border border-gray-300">
            <div className="mb-4">
              <p className="text-xl font-semibold text-gray-800">
                <span className="text-blue-500">Address:</span>{" "}
                <span className="text-gray-700">{listing.address}</span>
              </p>
            </div>
            <div className="mb-4">
              <p className="text-xl font-semibold text-gray-800">
                <span className="text-blue-500">Description:</span>{" "}
                <span className="text-gray-700">{listing.description}</span>
              </p>
            </div>
            <div className="mb-4">
              <p className="text-xl font-semibold text-gray-800">
                <span className="text-blue-500">Regular Price:</span>{" "}
                <span className="text-gray-700">${listing.regularPrice}</span>
              </p>
            </div>
            {listing.offer && (
              <div className="mt-4">
                <p className="text-xl font-semibold text-red-600">
                  <span className="text-blue-500">Discounted Price:</span>{" "}
                  <span className="text-red-500">
                    ${listing.discountedPrice}
                  </span>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Owner */}
      <button
        // onClick={}
        className="mt-6 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-700 text-white font-semibold rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-300 ease-in-out hover:from-blue-600 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50">
        Contact Owner
      </button>

      {/* Contact Form */}
    </main>
  );
}
