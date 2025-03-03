import bcrypt from "bcryptjs";
import prisma from "./prisma";

interface User {
    email: string,
    password: string,
    name: string,
    avatar: string,
    type_autorize: string,
}

export async function Create_User(User: User){

    const hashedPassword = await bcrypt.hash(User.password, 10);

    const user = prisma.user.create({
        data: {
            email: User.email,
            password: hashedPassword,
            name: User.name,
            avatar: User.avatar,
            type_autorize: User.type_autorize,
        }
    })
}