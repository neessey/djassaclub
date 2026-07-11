"use client";

import { useEffect, useState } from "react";

export default function MobileOnly({ children }: { children: React.ReactNode }) {
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  useEffect(() => {
    const checkDevice = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkDevice();
    window.addEventListener("resize", checkDevice);

    return () => window.removeEventListener("resize", checkDevice);
  }, []);

  if (isMobile === null) return null;

  if (!isMobile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFFDF9]">
        <div className="text-center px-6">
          <h1 className="font-serif text-3xl text-[#4A4A37]">
            Expérience mobile uniquement
          </h1>
          <p className="mt-4 text-sm text-gray-500">
            Veuillez consulter ce site depuis un téléphone portable.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}