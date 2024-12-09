import React, { useState } from 'react';
import { Send, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ComingSoon() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Placeholder for Mailchimp integration
    // Replace with actual Mailchimp API call
    setTimeout(() => {
      toast.success('Thank you for signing up! We\'ll keep you updated.');
      setEmail('');
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white/10 backdrop-blur-lg rounded-2xl p-8 md:p-12 shadow-2xl">
        <div className="text-center space-y-6">
          <div className="text-5xl md:text-6xl font-bold text-white">
            <span className="text-white">Verso</span>
            <span className="text-red-300">Bid</span>
          </div>
          
          <h2 className="text-2xl md:text-3xl font-semibold text-white/90">
            The Future of Reverse Auctions
          </h2>
          
          <p className="text-lg text-white/80 max-w-xl mx-auto">
            Where buyers set the price and sellers make it happen. A revolutionary platform connecting buyers with the perfect sellers.
          </p>

          <div className="flex items-center justify-center space-x-4">
            <div className="flex flex-col items-center">
              <div className="text-3xl font-bold text-white">Coming Soon</div>
              <div className="text-white/70">Join the waitlist</div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4">
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full px-6 py-3 rounded-full bg-white/20 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50"
              />
              <button
                type="submit"
                disabled={loading}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white text-indigo-600 rounded-full p-2 hover:bg-indigo-100 transition-colors disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>
            <p className="text-sm text-white/60">
              Be the first to know when we launch and receive exclusive early access.
            </p>
          </form>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div className="bg-white/10 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-2">For Buyers</h3>
              <p className="text-white/70">Post your desired items and let sellers compete for your business</p>
            </div>
            <div className="bg-white/10 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-2">For Sellers</h3>
              <p className="text-white/70">Find customers actively looking for your products and services</p>
            </div>
            <div className="bg-white/10 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-2">Smart Matching</h3>
              <p className="text-white/70">Our platform intelligently connects buyers with the perfect sellers</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}