import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

export async function POST(request: NextRequest) {
  try {

    const {propertyId, url} = await request.json();

    const uploadimage = await cloudinary.uploader.upload(url, {
      folder: 'RentEase/propertyImages',
    })

    await prisma.propertyImage.create({
      data: {
        propertyId: propertyId,
        url: uploadimage.secure_url,
      }
    });

    return NextResponse.json(
      {
        message: 'Изображение успешно загружено',
        url: uploadimage.secure_url,
      },
      { status: 201 }
    );

  } catch (error) {
    return NextResponse.json(
      { message: 'Ошибка при загрузке изображения', error: error },
      { status: 500 }, 
    );
  }
}
