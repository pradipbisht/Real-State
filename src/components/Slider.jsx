import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  where,
} from "@firebase/firestore";
import Spinner from "../components/Spinner";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectFade, Autoplay, Navigation, Pagination } from "swiper/modules";
import "swiper/css/bundle";
import { useNavigate } from "react-router";
import { db } from "../Firebase";

export default function Slider() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchListings() {
      try {
        const listingRef = collection(db, "listings");
        // Create the query
        const q = query(
          listingRef,
          where("offer", "==", true),
          orderBy("timestamp", "desc"),
          limit(5)
        );
        // Execute the query
        const querySnapshot = await getDocs(q);
        const fetchedListings = [];
        querySnapshot.forEach((doc) => {
          fetchedListings.push({
            id: doc.id,
            data: doc.data(),
          });
        });
        setListings(fetchedListings);
        setLoading(false);
      } catch (error) {
        console.log("Error fetching listings:", error);
      }
    }
    fetchListings();
  }, []);

  if (loading) {
    return <Spinner />;
  }

  if (listings.length === 0) {
    return <p>No listings found.</p>;
  }

  return (
    <div className="p-6">
      {/* Swiper Component */}
      <Swiper
        modules={[EffectFade, Autoplay, Navigation, Pagination]}
        effect="fade"
        autoplay={{ delay: 3000 }}
        navigation
        pagination={{ clickable: true }}
        className="mb-8">
        {listings.map(({ id, data }) => (
          <SwiperSlide
            key={id}
            onClick={() => navigate(`/category/${data.type}/${id}`)}>
            <div
              style={{
                background: `url(${data.imgUrls[0]}) center no-repeat`,
                backgroundSize: "cover",
              }}
              className="w-full h-[400px] rounded-lg shadow-lg overflow-hidden cursor-pointer"></div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
