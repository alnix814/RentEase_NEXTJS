import Image from "next/image"
import { Input } from "../input"
import { Button } from "../button"
import Link from "next/link"
import { cn } from "@/lib/utils";

interface Step1Props {
    continueRegistration: () => void;
    fullname: string;
    setFullname: (fullname: string) => void;
    email: string;
    setEmail: (email: string) => void;
    password: string;
    setPassword: (password: string) => void;
    classname?: string;
}


export default function Step1({ continueRegistration, fullname, setFullname, email, setEmail, password, setPassword, classname }: Step1Props
) {
    return (
        < >
            <div className={cn('w-[50%]', classname)}>
                <div className='text-center'>
                    <div className='flex justify-center mt-3'>
                        <Image
                            src="/logo.svg"
                            alt="logo"
                            width={60}
                            height={60}
                        />
                    </div>
                    <div className='text-2xl mt-3'>
                        <h1>Регистрация</h1>
                    </div>
                </div>
                <div className='h-[360px]'>
                    <p>Email</p>
                    <Input value={email} onChange={(e) => setEmail(e.target.value)} id="email" type="text" name="email" placeholder="Email"></Input>

                    <Button onClick={() => continueRegistration()}>Далее</Button>
                </div>
            </div>
            <div className="w-[50%]">
                <div className='flex justify-center'>
                    <Image
                        src="/registration-house.png"
                        alt="registration"
                        width={300}
                        height={300}
                    />
                </div>
            </div>
        </>
    )
}