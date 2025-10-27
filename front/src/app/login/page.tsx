"use client";

import { useState } from "react";
import Image from "next/image";
import { LoginForm } from "./_components/login-form";
import { SignupForm } from "./_components/signup-form";

export const dynamic = "force-dynamic";
export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen w-full lg:grid lg:grid-cols-5">
      {/* Left Side - Banner Image */}
      <div className="relative hidden col-span-2 grid-cols-2 lg:block bg-muted m-8 rounded-xl overflow-hidden">
        <Image src="/banner.png" alt="Banner" fill className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-12 text-white">
          <h1 className="text-4xl font-bold mb-4">Welcome to InfoFloPrint</h1>
          <p className="text-lg opacity-90">Streamline your workflow with our comprehensive form management system</p>
        </div>
      </div>

      {/* Right Side - Auth Forms */}
      <div className="flex items-center justify-center p-6 col-span-3 lg:p-12 bg-background">
        <div className="w-full max-w-md">
          {/* Logo/Brand */}
          <div className="mb-8 text-center">
            <a href="https://infofloprint.com" target="_blank" className="inline-flex flex-col items-center gap-2">
              <Image src="/logo.png" alt="Logo" width={62} height={62} />
              <span className="text-2xl font-bold">InfoFloPrint OnBoarding</span>
            </a>
          </div>

          {/* Forms */}
          {isLogin ? <LoginForm onSwitchToSignup={() => setIsLogin(false)} /> : <SignupForm onSwitchToLogin={() => setIsLogin(true)} />}
        </div>
      </div>
    </div>
  );
}
