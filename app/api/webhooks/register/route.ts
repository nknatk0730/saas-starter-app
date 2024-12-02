import prisma from "@/lib/prisma";
import { WebhookEvent } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import { Webhook } from "svix";

export const POST = async (req: Request) => {
  const SIGNIN_SECRET = process.env.SIGNIN_SECRET;

  if (!SIGNIN_SECRET) {
    throw new Error('Please add webhook secret in env');
  }

  const headerPayload = await headers();

  const svixId = headerPayload.get("svix-id");
  const svixTimestamp = headerPayload.get('svix-timestamp');
  const svixSignature = headerPayload.get('svix-signature');

  if (!svixId || !svixTimestamp || !svixSignature) {
    return new Response("Error occurred - No Svix headers");
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(SIGNIN_SECRET);

  let evt: WebhookEvent;

  try {
    evt =  wh.verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as WebhookEvent;
  } catch (error) {
    console.error("Error occurred", error);
    return new Response('Error occurred', { status: 400 })
  }

  const eventType = evt.type;

  // logs

  if (eventType === 'user.created') {
    try {
      const { email_addresses, primary_email_address_id } = evt.data;
      // optional
      const primaryEmail = email_addresses.find(
        (email) => email.id === primary_email_address_id
      );

      if (!primaryEmail) {
        return new Response('No Primary email found', { status: 400 });
      }

      // create a user in neon (postgresql)
      const newUser = await prisma.user.create({
        data: {
          id: evt.data.id,
          email: primaryEmail.email_address,
          isSubscribed: false,
        },
      });

      console.log('New user created', newUser);
      
    } catch {
      return new Response('Error creating user in database', { status: 400 });
    }
  }

  return new Response('Webhook received successfully', { status: 200 });
}