"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SponsorPage() {
  const router = useRouter();

  useEffect(() => {
    // 赞助页已下线：直接回到 Dashboard（你也可改成 "/"）
    router.replace("/dashboard");
  }, [router]);

  return null;
}
