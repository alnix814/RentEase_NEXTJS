import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    
    const {propertyId, url} = await request.json();

    const image = await prisma.propertyImage.create({
      data: {
        propertyId: propertyId,
        url: url,
      }
    });

    return NextResponse.json(
      {
        message: 'Изображение успешно загружено',
        url: image.url,
      },
      { status: 201 }
    );

  } catch (error) {
    return NextResponse.json(
      { message: 'Ошибка при загрузке изображения' },
      { status: 500 }
    );
  }
}
