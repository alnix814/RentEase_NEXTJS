import Image from "next/image"
import { Input } from "../input"
import { Button } from "../button"

interface Step4Props {
    finalregistration: () => void;
    setPassword: (password: string) => void;
}

export default function Step4({finalregistration, setPassword}: Step4Props) {
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
                <p className='text-muted-foreground'>Придумайте пароль</p>
                <div className='flex items-center justify-center mt-14'>
                    <Input onChange={e => setPassword(e.target.value)} placeholder="Пароль" />

                    <Button onClick={finalregistration}>Далее</Button>
                </div>
            </div>
        </>
    )
}