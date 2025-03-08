import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
      const { propertyId, url } = await request.json();

      const image = await prisma.propertyImage.create({
        data: {
          url,
          propertyId: propertyId,
        }
      });
      return NextResponse.json({message: 'Изображение успешно загружено'}, { status: 201 });
    } catch (error) {
      return NextResponse.json({ message: 'Не удалось загрузить изображение' }, { status: 500 });
    }
  }
  