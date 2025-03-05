"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { signIn } from "next-auth/react";

interface YandexAuthButtonProps {
  className?: string;
  onClick?: () => void;
}

export default function YandexAuthButton({
  className,
  onClick,
}: YandexAuthButtonProps) {
  return (
    <div className={cn("", className)}>
      <button onClick={onClick}>
        <Image src="/yandex_icon.svg.png" width={50} height={50} alt="yandex" />
      </button>
    </div>
  );
}
