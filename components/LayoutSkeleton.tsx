"use client";

import { motion } from "framer-motion";

export function SkeletonRow() {
  return (
    <motion.div
      initial={{ opacity: 0.5 }}
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
      className="w-full tap-target bg-gray-200 dark:bg-gray-800 rounded-xl mb-3"
      aria-hidden="true"
    />
  );
}

export default function LayoutSkeleton() {
  return (
    <div className="w-full flex w-full flex-col mt-4" aria-live="polite" aria-busy="true">
      <span className="sr-only">Loading route data...</span>
      <SkeletonRow />
      <SkeletonRow />
      <SkeletonRow />
    </div>
  );
}
