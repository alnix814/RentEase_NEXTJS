import { AiOutlineLoading } from "react-icons/ai";

export default function Loading() {
  return (
    <div className="w-screen h-screen flex items-center justify-center">
      <div className="animate-spin">
        <AiOutlineLoading size={70}/>
      </div>
    </div>
  );
}