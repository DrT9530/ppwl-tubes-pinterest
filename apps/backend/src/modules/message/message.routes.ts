// modules/message/message.routes.ts
import { Elysia, t } from "elysia";
import { prisma } from "../../lib/prisma";
import { jwtPlugin, authGuard } from "../../middleware/auth";
import { sendNewMessage } from "../../lib/realtime.service";

export const messageRoutes = new Elysia({ prefix: "/messages" })
  .use(jwtPlugin)
  .use(authGuard)

  // Search users for new conversation
  .get("/users/search", async ({ query, user, set }) => {
    const q = query.q as string;
    if (!q || q.trim() === "") return { success: true, data: [] };

    // Memecah query menjadi kata-kata, mengabaikan spasi, underscore, atau titik
    const words = q.split(/[\s_.-]+/).filter(Boolean);
    
    // Jika kata-kata kosong, fallback
    if (words.length === 0) return { success: true, data: [] };

    const andConditions = words.map((word) => ({
      OR: [
        { username: { contains: word, mode: "insensitive" as const } },
        { email: { contains: word, mode: "insensitive" as const } },
      ],
    }));

    const users = await prisma.user.findMany({
      where: {
        AND: andConditions,
      },
      select: {
        id: true,
        username: true,
        avatarUrl: true,
      },
      take: 10,
    });

    return { success: true, data: users };
  })

  // Get all conversations
  .get("/conversations", async ({ user }) => {
    const participants = await prisma.conversationParticipant.findMany({
      where: { userId: user.id },
      include: {
        conversation: {
          include: {
            participants: {
              where: { userId: { not: user.id } },
              include: {
                user: {
                  select: { id: true, username: true, avatarUrl: true },
                },
              },
            },
            messages: {
              orderBy: { createdAt: 'desc' },
              take: 1,
            },
          },
        },
      },
      orderBy: {
        conversation: { updatedAt: 'desc' }
      }
    });

    const data = participants.map((p) => {
      const otherParticipant = p.conversation.participants[0]?.user;
      const lastMessage = p.conversation.messages[0];
      return {
        id: p.conversation.id,
        updatedAt: p.conversation.updatedAt,
        unreadCount: 0, // Placeholder
        otherUser: otherParticipant,
        lastMessage,
      };
    });

    return { success: true, data };
  })

  // Get a specific conversation and its messages
  .get("/conversations/:id", async ({ params: { id }, user, set }) => {
    // Verify access
    const p = await prisma.conversationParticipant.findUnique({
      where: { conversationId_userId: { conversationId: id, userId: user.id } },
    });
    if (!p) {
      set.status = 403;
      return { success: false, message: "Akses ditolak" };
    }

    const conversation = await prisma.conversation.findUnique({
      where: { id },
      include: {
        participants: {
          include: {
            user: { select: { id: true, username: true, avatarUrl: true } },
          },
        },
        messages: {
          orderBy: { createdAt: 'asc' },
          include: {
            sender: { select: { id: true, username: true, avatarUrl: true } },
            sharedPost: { select: { id: true, imageUrl: true, caption: true, creator: { select: { username: true } } } },
          },
        },
      },
    });

    return { success: true, data: conversation };
  })

  // Create or get existing conversation
  .post("/conversations", async ({ body, user, set }) => {
    const { targetUserId } = body as { targetUserId: string };
    
    // Check if conversation already exists
    const existing = await prisma.conversation.findFirst({
      where: {
        AND: [
          { participants: { some: { userId: user.id } } },
          { participants: { some: { userId: targetUserId } } }
        ]
      },
      include: {
        participants: {
          include: { user: { select: { id: true, username: true, avatarUrl: true } } }
        }
      }
    });

    if (existing) {
      return { success: true, data: existing };
    }

    // Create new
    const participantsData = user.id === targetUserId 
      ? [{ userId: user.id }]
      : [{ userId: user.id }, { userId: targetUserId }];

    const conversation = await prisma.conversation.create({
      data: {
        participants: {
          create: participantsData
        }
      },
      include: {
        participants: {
          include: { user: { select: { id: true, username: true, avatarUrl: true } } }
        }
      }
    });

    return { success: true, data: conversation };
  }, {
    body: t.Object({
      targetUserId: t.String()
    })
  })

  // Send a message
  .post("/conversations/:id", async ({ params: { id }, body, user, set }) => {
    const { content, sharedPostId } = body as { content?: string, sharedPostId?: string };

    const p = await prisma.conversationParticipant.findUnique({
      where: { conversationId_userId: { conversationId: id, userId: user.id } },
    });
    if (!p) {
      set.status = 403;
      return { success: false, message: "Akses ditolak" };
    }

    const message = await prisma.message.create({
      data: {
        conversationId: id,
        senderId: user.id,
        content: content || null,
        sharedPostId: sharedPostId || null
      },
      include: {
        sender: { select: { id: true, username: true, avatarUrl: true } },
        sharedPost: { select: { id: true, imageUrl: true, caption: true, creator: { select: { username: true } } } },
      },
    });

    // Update conversation updatedAt
    await prisma.conversation.update({
      where: { id },
      data: { updatedAt: new Date() }
    });

    // Get other participants to notify via WebSockets
    const otherParticipants = await prisma.conversationParticipant.findMany({
      where: { 
        conversationId: id,
        userId: { not: user.id }
      }
    });

    for (const other of otherParticipants) {
      // Push via WebSocket
      await sendNewMessage(other.userId, {
        conversationId: id,
        message
      });
    }

    return { success: true, data: message };
  }, {
    body: t.Object({
      content: t.Optional(t.String()),
      sharedPostId: t.Optional(t.String())
    })
  });
