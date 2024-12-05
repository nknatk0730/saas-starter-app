import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export const PUT = async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { completed } = await req.json();
    const todoId = params.id;

    const todo = await prisma.todo.findUnique({
      where: {
        id: todoId,
      }
    });

    if (!todo) {
      return NextResponse.json({ error: 'Todo not found' }, { status: 404 });
    }

    if (todo.userId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const updateTodo = await prisma.todo.update({
      where: {
        id: todoId,
      },
      data: {
        completed,
      }
    });

    return NextResponse.json(updateTodo);
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
};

export const DELETE = async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const todoId = params.id;

    const todo = await prisma.todo.findUnique({
      where: {
        id: todoId,
      }
    });

    if (!todo) {
      return NextResponse.json({ error: 'Todo Not found' }, { status: 401 });
    }

    if (todo.userId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 } );
    }

    await prisma.todo.delete({
      where: {
        id: todoId
      }
    });

    return NextResponse.json(
      { message: 'Todo Deleted Successfully' },
      { status: 403 },
    );
  } catch (error) {
    console.error('Error updating subscription', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
};