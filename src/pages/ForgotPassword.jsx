import React, { useState } from "react";
import { Link } from "react-router-dom";
import AllButton from "../components/AllButton";
import { toast } from "react-toastify";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");

  function onChange(e) {
    setEmail(e.target.value);
  }

  async function onSubmit(e) {
    e.preventDefault();

    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    try {
      const auth = getAuth();
      await sendPasswordResetEmail(auth, email);
      toast.success("Email was Sent");
      setEmail("");
    } catch (error) {
      toast.error("Something Went Wrong");
    }
  }

  return (
    <section>
      <h1 className="text-3xl text-center mt-6 font-bold">Forgot Password</h1>
      <div className="flex justify-center flex-wrap items-center px-4 py-12 max-w-7xl mx-auto">
        <div className="md:w-[67%] lg:w-[50%] md:mb-6">
          <img
            src="forgot.jpg"
            alt="Forgot Password"
            className="w-full rounded-2xl"
          />
        </div>
        <div className="w-full md:w-[67%] lg:w-[40%] lg:ml-20">
          <form onSubmit={onSubmit}>
            <input
              type="email"
              id="email"
              placeholder="Email Address"
              value={email}
              onChange={onChange}
              className="w-full px-4 py-2 mb-6 text-xl text-gray-700 bg-white border-gray-300 rounded-md transition ease-in-out"
            />
            <button
              className="w-full bg-blue-600 text-white text-xl font-medium uppercase px-7 py-3 rounded-lg 
              shadow-md shadow-gray-600 hover:bg-blue-800 transition duration-150 ease-in-out active:bg-blue-900">
              Send Reset Link
            </button>
            <div
              className="flex items-center my-4 before:border-t before:flex-1 before:border-gray-400
            after:border-t after:flex-1 after:border-gray-400">
              <p className="text-center font-bold text-2xl mx-4">OR</p>
            </div>
            <AllButton />
            <div className="flex justify-between whitespace-nowrap text-sm sm:text-lg mt-6">
              <p className="mb-6">
                Remember your password?
                <Link
                  to="/sign-in"
                  className="text-red-500 hover:text-green-600 transition duration-200 ease-in-out ml-1">
                  Sign-In
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
