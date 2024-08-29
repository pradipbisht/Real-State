import React, { useState } from "react";
import { AiFillEyeInvisible, AiFillEye } from "react-icons/ai";
import { Link, useNavigate } from "react-router-dom";
import AllButton from "../components/AllButton";
import {
  createUserWithEmailAndPassword,
  getAuth,
  updateProfile,
} from "firebase/auth";
import { db } from "../Firebase";
import { serverTimestamp, setDoc } from "@firebase/firestore";
import { toast } from "react-toastify";

export default function SignUp() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  const { fullName, email, password } = formData;
  const navigate = useNavigate();

  function onChange(e) {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.id]: e.target.value,
    }));
  }

  async function onSubmit(e) {
    e.preventDefault();

    try {
      const auth = getAuth();
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      updateProfile(auth.currentUser, {
        displayName: fullName,
      });

      const user = userCredential.user;
      const formDataCopy = { ...formData };
      delete formDataCopy.password;
      formDataCopy.timestamp = serverTimestamp();

      await setDoc(doc(db, "users", user.uid), formDataCopy);
      navigate("/");
    } catch (error) {
      toast.error("Something went wrong");
    }
  }

  return (
    <section>
      <h1 className="text-3xl text-center mt-6 font-bold">Sign Up</h1>
      <div className="flex justify-center flex-wrap items-center px-4 py-12 max-w-7xl mx-auto">
        <div className="md:w-[67%] lg:w-[50%] md:mb-6">
          <img src="signup.jpg" alt="key" className="w-full rounded-2xl " />
        </div>
        <div className="w-full md:w-[67%] lg:w-[40%] lg:ml-20">
          <form onSubmit={onSubmit}>
            <input
              type="text"
              id="fullName"
              placeholder="Full Name"
              value={fullName}
              onChange={onChange}
              className="w-full px-4 py-2 mb-6 text-xl text-gray-700 bg-white border-gray-300 rounded-md transition ease-in-out"
            />
            <input
              type="email"
              id="email"
              placeholder="Email Address"
              value={email}
              onChange={onChange}
              className="w-full px-4 py-2 mb-6 text-xl text-gray-700 bg-white border-gray-300 rounded-md transition ease-in-out"
            />
            <div className="relative mb-6">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                placeholder="Password"
                value={password}
                onChange={onChange}
                className="w-full px-4 py-2 text-xl text-gray-700 bg-white border-gray-300 rounded-md transition ease-in-out"
              />
              {showPassword ? (
                <AiFillEyeInvisible
                  className="absolute right-3 top-3 text-xl cursor-pointer"
                  onClick={() => setShowPassword((prevState) => !prevState)}
                />
              ) : (
                <AiFillEye
                  className="absolute right-3 top-3 text-xl cursor-pointer"
                  onClick={() => setShowPassword((prevState) => !prevState)}
                />
              )}
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white text-xl font-medium uppercase px-7 py-3 rounded-lg 
              shadow-md shadow-gray-600 hover:bg-blue-800 transition duration-150 ease-in-out active:bg-blue-900">
              Sign Up
            </button>
            <div className="flex justify-between whitespace-nowrap text-sm sm:text-lg">
              <p className="mb-6">
                Already have an account?
                <Link
                  to="/sign-in"
                  className="text-red-500 hover:text-green-600 transition duration-200 ease-in-out ml-1">
                  Sign-In
                </Link>
              </p>
            </div>
            <div
              className="flex items-center my-4 before:border-t before:flex-1 before:border-gray-400
            after:border-t after:flex-1 after:border-gray-400">
              <p className="text-center font-bold text-2xl mx-4">OR</p>
            </div>
            <AllButton />
          </form>
        </div>
      </div>
    </section>
  );
}
