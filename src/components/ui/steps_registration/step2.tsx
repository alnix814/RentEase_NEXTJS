import Image from "next/image";
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSeparator,
    InputOTPSlot,
} from "@/components/ui/input-otp";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface Step2Props {
    setCode: (code: string) => void;
    classname?: string;
}

export default function Step2({ setCode, classname }: Step2Props) {
    return (
        <>
            <div className={cn("w-full flex justify-center ", classname)}>
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
                    <p className='text-muted-foreground'>Введите код полученный на email</p>
                    <div className='flex items-center justify-center mt-14'>
                        <InputOTP maxLength={6} pattern={REGEXP_ONLY_DIGITS} onChange={(value) => setCode(value)}>
                            <InputOTPGroup>
                                <InputOTPSlot index={0} />
                                <InputOTPSlot index={1} />
                                <InputOTPSlot index={2} />
                            </InputOTPGroup>
                            <InputOTPSeparator />
                            <InputOTPGroup>
                                <InputOTPSlot index={3} />
                                <InputOTPSlot index={4} />
                                <InputOTPSlot index={5} />
                            </InputOTPGroup>
                        </InputOTP>
                    </div>
                </div>
            </div>
        </>
    )
}