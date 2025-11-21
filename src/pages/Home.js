import React, { useState, useEffect } from 'react';
import { AiOutlineEye, AiOutlineEyeInvisible, AiOutlineMail, AiOutlineLock } from 'react-icons/ai';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [floatingIcons, setFloatingIcons] = useState([]);

  // Generate floating mail icons
  useEffect(() => {
    const icons = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 2,
      size: Math.random() * 24 + 16,
    }));
    setFloatingIcons(icons);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Replace with real auth logic
    console.log('Login attempt', { email, password });
    alert(`Welcome back! Submitted: ${email}`);
    setIsLoading(false);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 relative overflow-hidden px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <Helmet>
        <title>Sign in — MailFlow</title>
        <meta name="description" content="Sign in to your MailFlow dashboard" />
      </Helmet>

      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden">
        {floatingIcons.map((icon) => (
          <motion.div
            key={icon.id}
            className="absolute text-white/10"
            initial={{
              x: `${icon.x}vw`,
              y: `${icon.y}vh`,
              scale: 0,
              rotate: Math.random() * 360
            }}
            animate={{
              y: [`${icon.y}vh`, `${icon.y - 20}vh`, `${icon.y}vh`],
              rotate: [0, 180, 360],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: 8 + Math.random() * 4,
              delay: icon.delay,
              repeat: Infinity,
              repeatType: 'loop',
              ease: 'easeInOut'
            }}
            style={{
              fontSize: `${icon.size}px`
            }}
          >
            ✉️
          </motion.div>
        ))}
      </div>

      {/* Floating gradient orbs */}
      <motion.div
        aria-hidden
        initial={{ x: -80, y: -80, scale: 0.8 }}
        animate={{ 
          x: [-80, -60, -80], 
          y: [-80, -100, -80],
          scale: [0.8, 1.05, 0.8]
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -left-36 -top-36 w-64 sm:w-80 md:w-96 h-64 sm:h-80 md:h-96 rounded-full bg-gradient-to-r from-yellow-400/20 to-pink-400/20 blur-3xl"
      />

      <motion.div
        aria-hidden
        initial={{ x: 80, y: 80, scale: 0.7 }}
        animate={{ 
          x: [80, 100, 80], 
          y: [80, 60, 80],
          scale: [0.7, 1, 0.7]
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -right-36 -bottom-36 w-72 sm:w-96 md:w-[36rem] h-72 sm:h-96 md:h-[36rem] rounded-full bg-gradient-to-r from-purple-400/20 to-blue-400/20 blur-3xl"
      />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 w-full max-w-md sm:max-w-lg md:max-w-2xl px-6 sm:px-8 md:px-12 py-8 sm:py-10 md:py-12 bg-white/95 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl"
      >
        {/* Animated logo */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col items-center mb-8"
        >
          <motion.div
            whileHover={{ scale: 1.05, rotate: [-2, 2, -2] }}
            transition={{ duration: 0.5 }}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-yellow-400 to-pink-500 flex items-center justify-center shadow-lg mb-4"
          >
            <motion.div
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
              </svg>
            </motion.div>
          </motion.div>
          <motion.h1 
            variants={itemVariants}
            className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 text-center"
          >
            Welcome to MailFlow
          </motion.h1>
          <motion.p 
            variants={itemVariants}
            className="text-sm sm:text-base text-gray-600 text-center mt-2 max-w-xl"
          >
            Streamline your communication, amplify your productivity
          </motion.p>
        </motion.div>

        <form onSubmit={handleSubmit}>
          <motion.div variants={itemVariants}>
            <label className="block mb-6">
              <span className="text-sm font-medium text-gray-700 mb-2 block">Email Address</span>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <AiOutlineMail className="text-gray-400" />
                </div>
                <motion.input
                  whileFocus={{ scale: 1.02 }}
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-12 pr-4 py-3 sm:py-4 bg-white/50 border border-gray-200 rounded-2xl placeholder-gray-400 text-gray-900 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400 transition-all duration-200"
                  placeholder="you@company.com"
                />
              </div>
            </label>
          </motion.div>

          <motion.div variants={itemVariants}>
            <label className="block mb-8">
              <span className="text-sm font-medium text-gray-700 mb-2 block">Password</span>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <AiOutlineLock className="text-gray-400" />
                </div>
                <motion.input
                  whileFocus={{ scale: 1.02 }}
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-12 pr-12 py-3 sm:py-4 bg-white/50 border border-gray-200 rounded-2xl placeholder-gray-400 text-gray-900 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400 transition-all duration-200"
                  placeholder="Enter your password"
                />
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-gray-700 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={showPassword ? 'visible' : 'hidden'}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      {showPassword ? <AiOutlineEyeInvisible size={20} /> : <AiOutlineEye size={20} />}
                    </motion.div>
                  </AnimatePresence>
                </motion.button>
              </div>
            </label>
          </motion.div>

          <motion.div variants={itemVariants}>
            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: isLoading ? 1 : 1.02 }}
              whileTap={{ scale: isLoading ? 1 : 0.98 }}
              className="w-full py-3 sm:py-4 rounded-2xl bg-gradient-to-r from-yellow-400 to-pink-500 font-semibold text-gray-900 shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden text-sm sm:text-base"
            >
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center justify-center"
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full mr-2"
                    />
                    Signing in...
                  </motion.div>
                ) : (
                  <motion.span
                    key="text"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    Sign in to MailFlow
                  </motion.span>
                )}
              </AnimatePresence>
              
              {/* Button shine effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12"
                initial={{ x: '-100%' }}
                whileHover={{ x: '200%' }}
                transition={{ duration: 0.8 }}
              />
            </motion.button>
          </motion.div>
        </form>

        <motion.div variants={itemVariants} className="mt-8 text-center">
          <p className="text-gray-600 text-sm">
            New to MailFlow?{' '}
            <motion.a
              whileHover={{ scale: 1.05 }}
              className="text-yellow-600 font-semibold hover:text-yellow-700 transition-colors cursor-pointer"
            >
              Create an account
            </motion.a>
          </p>
          
          <motion.a
            whileHover={{ scale: 1.05 }}
            className="inline-block mt-4 text-gray-500 text-sm hover:text-gray-700 transition-colors cursor-pointer"
          >
            Forgot your password?
          </motion.a>
        </motion.div>
      </motion.div>
    </div>
  );
}
