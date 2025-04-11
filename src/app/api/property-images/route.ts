import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { randomUUID } from "crypto";
import { writeFile } from "fs/promises";
import { join } from "path";

export async function POST(request: NextRequest) {
  try {

    const formData = await request.formData();
    const propertyId = formData.get("propertyId") as string;
    const files = formData.getAll("images") as File[];

    const uploadedUrls = [];

    for (const file of files) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const tmpPath = `/tmp/${randomUUID()}.webp`;
      await writeFile(tmpPath, buffer);

      const result = await cloudinary.uploader.upload(tmpPath, {
        folder: "RentEase/propertyImages",
      });

      uploadedUrls.push(result.secure_url);
    }

    await prisma.propertyImage.createMany({
      data: uploadedUrls.map((url) => ({
        propertyId,
        url,
      }))
    });

    return NextResponse.json(
      {
        message: 'Изображения успешно загружено',
        url: uploadedUrls,
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
