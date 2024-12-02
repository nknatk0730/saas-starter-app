import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

const itemsPerPage = 10;

export const GET = async (req: NextRequest) => {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 },
    );
  }

  const { searchParams } = new URL(req.url);
  const page = searchParams.get('page');
  const search = searchParams.get('search');

  try {
    await prisma.todo.findMany({
      where: {
        userId,
        title: {
          contains: search,
          mode: 'insensitive',
        },
      }
    });
  } catch (error) {
    
  }
}