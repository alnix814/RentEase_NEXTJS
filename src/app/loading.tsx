import Image from "next/image";

export default function Loading() {
  return (
    <div className="w-screen h-screen flex items-center justify-center">
      <div className="animate-spin">
        <Image src={"logo.svg"} width={60} height={60} alt="Loading..." />
      </div>
    </div>
  );
}
