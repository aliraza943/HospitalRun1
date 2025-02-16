import React, { useState } from "react";
import axios from "axios";

const Header = () => (
    <header className="bg-blue-600 text-white py-4 text-center text-xl font-semibold">
        Welcome to Our Website
    </header>
);

const Footer = () => (
    <footer className="bg-gray-800 text-white py-3 text-center text-sm mt-8">
        &copy; 2025 All Rights Reserved.
    </footer>
);

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMessage(""); // Clear previous errors
    
        try {
            const response = await axios.post("http://localhost:8080/api/auth/login", {
                email,
                password,
            });
    
            // If login is successful
            localStorage.setItem("token", response.data.token); // Store token
            alert(`Login Successful! Token: ${response.data.token}`);
            setLoading(false);
        } catch (error) {
            setLoading(false);
            if (error.response) {
                setErrorMessage(error.response.data.message); // Show server-side error
            } else {
                setErrorMessage("An error occurred. Please try again.");
            }
        }
    };
    

    return (
        <div className="flex flex-col min-h-screen bg-gray-100">
            <Header />
            <div className="flex-grow flex justify-center items-center">
                <div className="bg-white shadow-lg rounded-2xl p-8 w-96">
                    <h2 className="text-2xl font-semibold text-center text-gray-700 mb-4">Login</h2>
                    {errorMessage && <p className="text-red-500 text-sm text-center mb-3">{errorMessage}</p>}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-gray-600 text-sm font-medium">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email"
                                required
                                className="w-full px-4 py-2 mt-1 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-600 text-sm font-medium">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your password"
                                required
                                className="w-full px-4 py-2 mt-1 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition disabled:bg-gray-400"
                        >
                            {loading ? "Logging in..." : "Login"}
                        </button>
                    </form>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default Login;
