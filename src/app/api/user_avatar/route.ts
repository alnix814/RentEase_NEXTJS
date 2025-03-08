import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from 'cloudinary';
import { Prisma } from "@prisma/client";

async function uploadAvatar(file: File, email: string) {
    // Преобразование File в Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Загрузка в Cloudinary
    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
            {
                folder: 'avatars',
                public_id: `user_${email}`,
                overwrite: true,
                transformation: [
                    { width: 400, height: 400, crop: 'fill' }
                ]
            },
            async (error, result) => {
                if (error) reject(error);

                // Обновление в базе данных
                await prisma.user.update({
                    where: { email: email },
                    data: {
                        avatarUrl: result?.secure_url,
                        avatarPublicId: result?.public_id
                    } as Prisma.UserUpdateInput
                });

                resolve(result?.secure_url);
            }
        ).end(buffer);
    });
}


export async function POST(req: NextRequest) {
    const session = await getServerSession();

    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const email = formData.get('email') as string;


    if (!file) {
        return NextResponse.json({ error: 'Файл не был передан в api' }, { status: 400 });
    }

    try {
        const avatarUrl = await uploadAvatar(file, email);

        if (session.user) {
            session.user.image = avatarUrl as string;
        }

        return NextResponse.json({
            message: 'Аватар успешно загружен',
            avatarUrl
        });
    } catch (error) {
        console.log(error);
        return NextResponse.json({
            error: 'Ошибка при загрузке изображения'
        }, { status: 500 });
    }
}