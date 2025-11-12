import { useState } from "react";

export default function App() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const MOCK_PASSWORD = "adminpassword";

      await new Promise(resolve => setTimeout(resolve, 1500)); 

      if (password === MOCK_PASSWORD) {
        console.log("Admin login successful!");
        
        window.alert("Login Successful! You are now logged in as Admin.");
        
        setPassword(""); 

      } else {
        setError("Invalid Admin Password. Please try again.");
      }

    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900 to-black p-4 text-white font-sans">
      <div className="max-w-md w-full space-y-8 bg-gray-900 p-10 rounded-xl shadow-[0_0_40px_rgba(252,211,77,0.3)] border border-yellow-900/50 transition-all duration-300 hover:shadow-[0_0_50px_rgba(252,211,77,0.5)]">
        <div className="text-center">
          <div className="mx-auto h-14 w-14 bg-yellow-400 rounded-full flex items-center justify-center shadow-2xl shadow-yellow-500/30">
            <svg
              className="h-8 w-8 text-gray-900"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="mt-8 text-3xl font-extrabold text-yellow-400 tracking-wider">
            Admin Login
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            Access the secure management dashboard.
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-100 mb-1"
            >
              Admin Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="mt-1 block w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg shadow-inner text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition duration-200"
              placeholder="Enter admin password (Hint: adminpassword)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <div className="text-red-400 text-sm text-center bg-red-900/30 border border-red-800 p-3 rounded-lg shadow-md transition-opacity duration-300">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-base font-bold text-gray-900 bg-yellow-400 hover:bg-yellow-300 active:bg-yellow-500 transition duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : "Sign in as Admin"}
          </button>

          <div className="text-center pt-2">
            <a
              href="#"
              className="text-sm text-yellow-400 hover:text-yellow-300 underline-offset-4 hover:underline transition duration-150"
              onClick={(e) => { e.preventDefault(); alert("Going back to home page..."); }}
            >
              Back to home
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}