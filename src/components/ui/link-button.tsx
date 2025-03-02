import { cn } from "@/lib/utils";
import Link from "next/link";

interface Link_ButtonProps {
    href: string;
    text: string;
    classname?: string;
}

export default function Link_Button({href, text, classname}: Link_ButtonProps) {
    return (
        <div className="">
            <Link className={cn("btn btn-primary hover:bg-[#e7e7e9] rounded-md p-2", classname)} href={href}>{text}</Link>
        </div>
    )
}