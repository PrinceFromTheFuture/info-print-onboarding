"use client";
import React from "react";
import { motion } from "framer-motion";
import AccountSetUp from "./_components/account-set-up";
import Image from "next/image";

function onBoarding() {
  return (
    <motion.div
      key="accountSetUp"
      initial={{ opacity: 0, y: 10, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.97 }}
      transition={{ duration: 0.2 }}
      className="min-h-screen w-full lg:grid lg:grid-cols-7 relative"
    >
      {/* Logo/Brand */}
      <div className="flex items-center justify-center p-8 py-8 sm:p-12 sm:py-4 lg:p-12 lg:py-12 col-span-4 2xl:py-4 bg-background">
        <div className="w-full h-full">
          <AccountSetUp />
        </div>
      </div>
      <div className="relative hidden col-span-3 lg:block bg-muted overflow-hidden">
        <Image src="/account-set-up.png" alt="Banner" fill className="object-cover" />
      </div>
    </motion.div>
  );
}

export default onBoarding;
