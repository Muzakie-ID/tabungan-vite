import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

interface AuthRequest extends Request {
  userId?: string;
}

// Helper to convert BigInt to string for JSON serialization
const bigintReplacer = (key: string, value: any) => {
  if (typeof value === 'bigint') {
    return value.toString();
  }
  return value;
};

const formatResponse = (data: any) => {
  return JSON.parse(JSON.stringify(data, bigintReplacer));
};

// Create shared goal
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) return res.status(401).json({ error: 'Unauthorized' });

    const { title, description, targetAmount, targetDate, invitedEmails } = req.body;

    // Create goal first
    const goal = await prisma.goal.create({
      data: {
        title,
        description,
        targetAmount: BigInt(targetAmount),
        targetDate: new Date(targetDate),
        type: 'SHARED',
        createdBy: req.userId,
      },
    });

    // Create shared goal
    const sharedGoal = await prisma.sharedGoal.create({
      data: {
        goalId: goal.id,
      },
    });

    // Add creator as member
    await prisma.sharedGoalMember.create({
      data: {
        userId: req.userId,
        sharedGoalId: sharedGoal.id,
        role: 'creator',
      },
    });

    // Send invitations
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    console.log('Creating invitations for emails:', invitedEmails);

    const invitations = await Promise.all(
      invitedEmails.map((email: string) =>
        prisma.goalInvitation.create({
          data: {
            sharedGoalId: sharedGoal.id,
            invitedEmail: email,
            invitedByUserId: req.userId!,
            expiresAt,
          },
        })
      )
    );

    console.log('Invitations created:', invitations);

    res.json(formatResponse({
      goal,
      sharedGoal,
      invitations,
    }));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create shared goal' });
  }
});

// Get shared goal invitations
router.get('/invitations', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) return res.status(401).json({ error: 'Unauthorized' });

    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { email: true },
    });

    if (!user) return res.status(404).json({ error: 'User not found' });

    console.log('Fetching invitations for email:', user.email);

    const invitations = await prisma.goalInvitation.findMany({
      where: {
        invitedEmail: user.email,
        status: 'PENDING',
      },
      include: {
        sharedGoal: {
          include: {
            goal: true,
            members: {
              include: {
                user: {
                  select: { id: true, name: true, email: true },
                },
              },
            },
          },
        },
        invitedBy: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    console.log('Found invitations:', invitations.length);

    res.json(formatResponse(invitations));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch invitations' });
  }
});

// Accept invitation
router.post('/invitations/:invitationId/accept', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) return res.status(401).json({ error: 'Unauthorized' });

    const invitation = await prisma.goalInvitation.findUnique({
      where: { id: req.params.invitationId },
    });

    if (!invitation) {
      return res.status(404).json({ error: 'Invitation not found' });
    }

    if (invitation.status !== 'PENDING') {
      return res.status(400).json({ error: 'Invitation already processed' });
    }

    // Add user as member
    await prisma.sharedGoalMember.create({
      data: {
        userId: req.userId,
        sharedGoalId: invitation.sharedGoalId,
      },
    });

    // Update invitation status
    const updatedInvitation = await prisma.goalInvitation.update({
      where: { id: req.params.invitationId },
      data: {
        status: 'ACCEPTED',
        acceptedAt: new Date(),
      },
      include: {
        sharedGoal: {
          include: {
            goal: true,
            members: {
              include: {
                user: {
                  select: { id: true, name: true, email: true },
                },
              },
            },
          },
        },
        invitedBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    res.json(formatResponse(updatedInvitation));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to accept invitation' });
  }
});

// Reject invitation
router.post('/invitations/:invitationId/reject', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) return res.status(401).json({ error: 'Unauthorized' });

    const invitation = await prisma.goalInvitation.update({
      where: { id: req.params.invitationId },
      data: { status: 'REJECTED' },
    });

    res.json(formatResponse(invitation));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to reject invitation' });
  }
});

// Get user's shared goals
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) return res.status(401).json({ error: 'Unauthorized' });

    const sharedGoals = await prisma.sharedGoal.findMany({
      where: {
        members: {
          some: { userId: req.userId },
        },
      },
      include: {
        goal: {
          include: {
            transactions: {
              include: {
                goalRef: {
                  select: { id: true, title: true },
                },
                user: {
                  select: { id: true, name: true, email: true },
                },
              },
              orderBy: { createdAt: 'desc' },
            },
          },
        },
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    console.log(`User ${req.userId} has ${sharedGoals.length} shared goals`);
    sharedGoals.forEach((sg: any) => {
      console.log(`  Goal: ${sg.goal.title}, Members: ${sg.members.map((m: any) => m.user.email).join(', ')}`);
    });

    res.json(formatResponse(sharedGoals));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch shared goals' });
  }
});

export default router;
