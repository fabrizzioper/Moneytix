"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();

  useEffect(() => {
    // Reemplaza la ruta actual sin dejar historial para “/”
    router.replace("/login");
  }, [router]);

  return null;
}
