import Image from "next/image"
import { Input } from "../input"
import { Button } from "../button";

interface Step3Props {
    classname?: string;
    setFullname: (fullname: string) => void;
    setStep: (number: number) => void;
}

export default function Step3({setFullname, setStep, classname}: Step3Props) {
    return (
        <>
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
                <p className='text-muted-foreground'>Введите ваше имя или никнейм</p>
                <div className='flex items-center justify-center mt-14'>
                    <Input onChange={e => setFullname(e.target.value)} placeholder="Имя пользователя"/>

                    <Button onClick={() => setStep(4)}>Далее</Button>
                </div>
            </div>
        </>
    )
}