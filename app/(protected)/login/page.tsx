"use client";

import { LoginLink } from "@kinde-oss/kinde-auth-nextjs/components";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen bg-background relative overflow-hidden">
      {/* SVG Background Pattern */}
      <div className="absolute inset-0 z-0 opacity-20">
        <svg
          className="w-full h-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="xMidYMid slice"
        >
          <pattern
            id="pattern-circles"
            x="0"
            y="0"
            width="20"
            height="20"
            patternUnits="userSpaceOnUse"
            patternContentUnits="userSpaceOnUse"
          >
            <circle
              cx="10"
              cy="10"
              r="1.6257413380501518"
              fill="currentColor"
            />
          </pattern>
          <rect
            x="0"
            y="0"
            width="100%"
            height="100%"
            fill="url(#pattern-circles)"
          />
        </svg>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="bg-card border rounded-2xl shadow-lg p-8 space-y-6">
            {/* Logo */}
            <div className="flex justify-center mb-6">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                  />
                </svg>
              </div>
            </div>

            {/* Text */}
            <div className="text-center space-y-2">
              <h1 className="text-2xl font-bold tracking-tight">
                Welcome to DailyLog
              </h1>
              <p className="text-muted-foreground">
                Sign in to access your workspace and manage your tasks
                efficiently
              </p>
            </div>

            {/* Sign In Button */}
            <Button asChild size="lg" className="w-full font-semibold">
              <LoginLink>Sign in with Kinde</LoginLink>
            </Button>

            {/* Footer */}
            <div className="text-center text-sm text-muted-foreground">
              <p>
                By signing in, you agree to our{" "}
                <a href="#" className="underline hover:text-primary">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="#" className="underline hover:text-primary">
                  Privacy Policy
                </a>
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Right Side Pattern */}
      <div className="hidden lg:block w-1/2 relative bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)",
            backgroundSize: "32px 32px",
            opacity: 0.1,
          }}
        />
      </div>
    </div>
  );
}
