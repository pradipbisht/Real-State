import { useState, useEffect } from "react"; // Import hooks for managing state and side effects
import { getAuth, updateProfile } from "firebase/auth"; // Import Firebase auth functions
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  updateDoc,
  where,
} from "firebase/firestore"; // Import Firestore functions
import { useNavigate, Link } from "react-router-dom"; // Import navigation and routing functions
import { toast } from "react-toastify"; // Import toast notifications
import { db } from "../Firebase";
import { FcHome } from "react-icons/fc"; // Import home icon for UI
import ListingItem from "../components/ListingItem"; // Import ListingItem component

export default function Profile() {
  const auth = getAuth(); // Initialize Firebase authentication
  const navigate = useNavigate(); // Hook for programmatic navigation
  const [changeDetail, setChangeDetail] = useState(false); // State to toggle edit mode
  const [listings, setListings] = useState(null); // State to hold user listings
  const [loading, setLoading] = useState(true); // State to handle loading status
  const [formData, setFormData] = useState({
    name: auth.currentUser.displayName, // Set initial name from Firebase auth
    email: auth.currentUser.email, // Set initial email from Firebase auth
  });

  const { name, email } = formData; // Destructure formData for convenience

  // Function to handle user logout
  function onLogout() {
    auth.signOut(); // Sign out the current user
    navigate("/"); // Redirect to the home page
  }

  // Function to handle input changes in the form
  function onChange(e) {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.id]: e.target.value, // Update formData state with new input value
    }));
  }

  // Function to handle profile update
  async function onSubmit() {
    try {
      if (auth.currentUser.displayName !== name) {
        // Update display name in Firebase auth
        await updateProfile(auth.currentUser, {
          displayName: name,
        });

        // Update name in Firestore
        const docRef = doc(db, "users", auth.currentUser.uid);
        await updateDoc(docRef, {
          name,
        });
      }
      toast.success("Profile details updated"); // Show success notification
    } catch (error) {
      toast.error("Could not update the profile details"); // Show error notification
    }
  }

  // Fetch user listings from Firestore
  useEffect(() => {
    async function fetchUserListings() {
      const listingRef = collection(db, "listings"); // Reference to the listings collection
      const q = query(
        listingRef,
        where("userRef", "==", auth.currentUser.uid), // Filter listings by the current user
        orderBy("timestamp", "desc") // Order listings by timestamp in descending order
      );
      const querySnap = await getDocs(q); // Fetch documents that match the query
      let listings = [];
      querySnap.forEach((doc) => {
        listings.push({
          id: doc.id, // Get document ID
          data: doc.data(), // Get document data
        });
      });
      setListings(listings); // Update state with fetched listings
      setLoading(false); // Set loading to false once data is fetched
    }
    fetchUserListings(); // Call the function to fetch listings
  }, [auth.currentUser.uid]); // Dependency array to re-fetch listings when user ID changes

  // Function to handle listing deletion
  async function onDelete(listingID) {
    if (window.confirm("Are you sure you want to delete?")) {
      await deleteDoc(doc(db, "listings", listingID)); // Delete the listing from Firestore
      const updatedListings = listings.filter(
        (listing) => listing.id !== listingID // Filter out the deleted listing
      );
      setListings(updatedListings); // Update state with the remaining listings
      toast.success("Successfully deleted the listing"); // Show success notification
    }
  }

  // Function to handle listing editing
  function onEdit(listingID) {
    navigate(`/edit-listing/${listingID}`); // Navigate to the edit listing page
  }

  return (
    <>
      <section className="max-w-6xl mx-auto flex justify-center items-center flex-col">
        <h1 className="text-3xl text-center mt-6 font-bold">My Profile</h1>
        <div className="w-full md:w-1/2 mt-6 px-3">
          <form>
            {/* Name Input */}
            <input
              type="text"
              id="name"
              value={name}
              disabled={!changeDetail} // Disable input unless in edit mode
              onChange={onChange} // Handle input changes
              className={`mb-6 w-full px-4 py-2 text-xl text-gray-700 border border-gray-300 rounded transition ease-in-out focus:ring-2 focus:ring-blue-500 ${
                changeDetail ? "bg-red-200 focus:bg-red-100" : "bg-white"
              }`}
            />

            {/* Email Input */}
            <input
              type="email"
              id="email"
              value={email}
              disabled // Email input is always disabled
              className="mb-6 w-full px-4 py-2 text-xl text-gray-700 bg-white border border-gray-300 rounded"
            />

            <div className="flex justify-between items-center whitespace-nowrap text-sm sm:text-lg mb-6">
              <p className="flex items-center">
                Do you want to change your name?
                <span
                  onClick={() => {
                    changeDetail && onSubmit(); // Apply changes if in edit mode
                    setChangeDetail((prev) => !prev); // Toggle edit mode
                  }}
                  className={`ml-2 cursor-pointer ${
                    changeDetail
                      ? "text-red-700 hover:text-red-800"
                      : "text-red-600 hover:text-red-700"
                  } transition duration-200`}>
                  {changeDetail ? "Apply change" : "Edit"}
                </span>
              </p>
              <p
                onClick={onLogout}
                className="text-blue-600 hover:text-blue-700 cursor-pointer transition duration-200">
                Sign out
              </p>
            </div>
          </form>
          <button
            type="button"
            className="w-full bg-blue-600 text-white uppercase px-7 py-3 text-sm font-medium rounded shadow-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 transition duration-150 ease-in-out">
            <Link
              to="/create-listing"
              className="flex items-center justify-center">
              <FcHome className="mr-2 text-3xl p-1 border-2 rounded-full" />
              Sell or rent your home
            </Link>
          </button>
        </div>
      </section>
      <div className="max-w-6xl px-3 mt-6 mx-auto">
        {!loading && listings.length > 0 && (
          <>
            <h2 className="text-2xl text-center font-semibold mb-6">
              My Listings
            </h2>
            <ul className="sm:grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
              {listings.map((listing) => (
                <ListingItem
                  key={listing.id}
                  id={listing.id}
                  listing={listing.data}
                  onDelete={() => onDelete(listing.id)} // Pass delete handler
                  onEdit={() => onEdit(listing.id)} // Pass edit handler
                />
              ))}
            </ul>
          </>
        )}
      </div>
    </>
  );
}
