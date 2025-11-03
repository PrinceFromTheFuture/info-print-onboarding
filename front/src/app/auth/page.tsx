"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { LoginForm } from "./_components/login-form";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import AccountSetUp from "./_components/account-set-up";
import { useSession } from "@/lib/auth/auth-client";
import LoadingSpinner from "@/components/loading-spinner";
import Logout from "@/components/Logout";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/lib/routes";

export default function LoginPage() {
  const [mode, setMode] = useState<"auth" | "pendingVerification">("auth");
  const [isLogin, setIsLogin] = useState(true);
  const { data, isPending } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!data?.user) return setMode("auth");
    if (data?.user?.role === "admin") return router.push(ROUTES.admin.dashboard);
    if (data?.user?.isApproved) return router.push(ROUTES.customer.root);
    return setMode("pendingVerification");
  }, [data]);

  if (isPending) {
    return <LoadingSpinner title="Loading user data..." />;
  }

  const setModeHandler = (mode: "auth" | "pendingVerification") => {
    setMode(mode);
  };

  return (
    <div className=" overflow-hidden ">
      {mode !== "auth" && (
        <div className=" absolute top-4 right-4 z-50">
          <Logout />
        </div>
      )}
      {mode !== "auth" && (
        <div className="absolute top-6 left-4 lg:top-8 lg:left-8 flex gap-2 items-center justify-center z-10">
          <a href="https://infofloprint.com" target="_blank" className="inline-flex items-center gap-2">
            <Image src="/logo.png" alt="Logo" width={35} height={35} className="lg:w-[45px] lg:h-[45px]" />
            <span className="text-base lg:text-lg font-bold">InfoFloPrint</span>
          </a>
        </div>
      )}
      <AnimatePresence mode="wait">
        {mode === "auth" ? (
          <motion.div
            key="auth"
            initial={{ opacity: 0, y: 10, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.97 }}
            transition={{ duration: 0.2 }}
            className=""
          >
            <div className="min-h-screen w-full lg:grid lg:grid-cols-5 relative">
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
                  {isLogin && <LoginForm setModeHandler={setModeHandler} />}
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          mode === "pendingVerification" && (
            <motion.div
              key="pendingVerification"
              initial={{ opacity: 0, y: 10, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.97 }}
              transition={{ duration: 0.2 }}
              className="min-h-screen w-full flex items-center justify-center bg-background"
            >
              <div className="w-full max-w-md p-6 space-y-6">
                {/* Logo */}

                {/* Pending Icon */}
                <div className="flex justify-center">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-10 h-10 text-amber-600 dark:text-amber-500"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-amber-500 dark:bg-amber-600 flex items-center justify-center">
                      <span className="text-white text-xs font-bold">!</span>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="space-y-4 text-center">
                  <h1 className="text-2xl font-bold tracking-tight">Account Pending Verification</h1>
                  <p className="text-muted-foreground">
                    Your account has been created successfully and is currently awaiting approval from an administrator.
                  </p>
                  <div className="bg-muted rounded-lg p-4 space-y-2 text-sm">
                    <p className="font-medium">What happens next?</p>
                    <ul className="space-y-1 text-left text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <span className="text-amber-600 mt-0.5">•</span>
                        <span>An administrator will review your account</span>
                      </li>

                      <li className="flex items-start gap-2">
                        <span className="text-amber-600 mt-0.5">•</span>
                        <span>This process typically takes 1-2 business days</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      // Refresh session to check if approved
                      window.location.reload();
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-4 h-4 mr-2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
                      />
                    </svg>
                    Check Approval Status
                  </Button>
                  <p className="text-xs text-center text-muted-foreground">
                    Having issues? Contact support at{" "}
                    <a href="mailto:support@infofloprint.com" className="text-primary hover:underline">
                      support@infofloprint.com
                    </a>
                  </p>
                </div>
              </div>
            </motion.div>
          )
        )}
      </AnimatePresence>
    </div>
  );
}
