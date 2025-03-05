"use client";

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import YandexAuthButton from '@/components/ui/yandexauthbutton';
import { signIn, useSession } from 'next-auth/react';
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSeparator,
    InputOTPSlot,
} from "@/components/ui/input-otp";
import { REGEXP_ONLY_DIGITS } from "input-otp"
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { IoArrowBackSharp } from "react-icons/io5";
import { FormEvent, useEffect, useState } from 'react';
import { Toast_Custom } from '@/components/ui/toast_custom';
import Step1 from '@/components/ui/steps_registration/step1';
import Step2 from '@/components/ui/steps_registration/step2';
import Step3 from '@/components/ui/steps_registration/step3';
import Step4 from '@/components/ui/steps_registration/step4';

export default function SignIn() {

    const { data: session, update } = useSession();
    const [email, setEmail] = useState<string>("");
    const [fullname, setFullname] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const [isRegistered, setIsRegistered] = useState<boolean>(false);
    const [step, setStep] = useState<number>(1);
    const [code, setCode] = useState<string>("");

    useEffect(() => {
        if (isRegistered) {
            router.push("/");
        }
    }, [isRegistered, router]);

    useEffect(() => {
        if (code.length === 6) {
            verifyCode();
        }
    }, [code]);

    const sendCode = async () => {
        const res = await fetch("/api/sendcode", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
        });
        const data = await res.json();
        if (res.ok) {
            Toast_Custom({ errormessage: data.message, setError: setError, type: 'success' });
            setStep(2);
        }
        Toast_Custom({ errormessage: data.message, setError: setError, type: 'success' });
    };

    const verifyCode = async () => {
        const res = await fetch("/api/verifycode", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ fullname, email, code, password }),
        });
        const data = await res.json();
        if (res.ok) {
            setStep(3);
        } else {
            Toast_Custom({ errormessage: data.message, setError: setError, type: 'error' });
            setStep(1);
        }
    };

    const continueRegistration = () => {
        sendCode();
    }

    const finalregistration = () => {
        signIn('credentials', {redirect: false, email, password});
        router.push("/");
    }

    return (
        <div className="h-[100vh] flex items-center justify-center px-4">
            <div className="border shadow-xl w-full sm:w-[500px] md:w-[600px] h-[50%] bg-white inline-flex justify-center rounded-xl">
                <button className='h-12' onClick={() => setStep((prev) => (prev - 1))}><IoArrowBackSharp className='text-2xl' /></button>
                {step === 1 && (<Step1 continueRegistration={continueRegistration} fullname={fullname} setFullname={setFullname} email={email} setEmail={setEmail} password={password} setPassword={setPassword} />)}
                {step === 2 && (<Step2 setCode={setCode} />)}
                {step === 3 && (<Step3 setFullname={setFullname} setStep={setStep}/>)}
                {step === 4 && (<Step4 finalregistration={finalregistration} setPassword={setPassword}/>)}
            </div>
        </div>
    )
}