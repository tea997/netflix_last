import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { useAuthStore } from '../store/authStore';
import { toast } from 'react-hot-toast';

const SignIn = () => {

  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { login, isLoading, error } = useAuthStore();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await login({ username, password });
      toast.success(response.message || "Logged in successfully");
      navigate("/");
    } catch (error) {
      console.log("Login error", error);
    }
  };

  return (
    <div
      className='min-h-screen flex items-center justify-center px-5 md:px-5 py-5'
      style={{
        backgroundImage: "linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(/background_banner.jpg)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat"
      }}>

      <div className='bg-black max-w-[450px] w-full rounded-2xl py-13 px-8 mx-auto '>
        <h1 className='text-3xl font-medium text-white mb-7'>Sign In</h1>

        <form className='flex flex-col space-y-5' onSubmit={handleLogin}>
          <input
            type="text"
            placeholder='Email or mobile number'
            className='w-full h-[50px] bg-[#333] text-white px-5 text-sm rounded bg-opacity-70 border border-transparent focus:border-[#8c8c8c] outline-none transition duration-200 placeholder-[#8c8c8c]'
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <input
            type="password"
            placeholder='Password'
            className='w-full h-[50px] bg-[#333] text-white px-5 text-sm rounded bg-opacity-70 border border-transparent focus:border-[#8c8c8c] outline-none transition duration-200 placeholder-[#8c8c8c]'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && <p className='text-red-500 font-semibold text-sm'>{error}</p>}

          <button
            type='submit'
            className='w-full bg-[#E50914] text-white font-medium py-3 rounded mt-4 hover:bg-[#C11119] transition duration-200 disabled:opacity-50'
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : "Sign In"}
          </button>

        </form>

        <div className='mt-8 text-[#737373] text-sm'>
          New to Netflix?
          <Link to="/signup" className='text-white hover:underline ml-1'>
            Sign up now.
          </Link>
        </div>

      </div>

    </div>
  )
}

export default SignIn