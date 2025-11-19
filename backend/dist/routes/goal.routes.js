"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
// Helper to convert BigInt to string for JSON serialization
const bigintReplacer = (key, value) => {
    if (typeof value === 'bigint') {
        return value.toString();
    }
    return value;
};
const formatResponse = (data) => {
    return JSON.parse(JSON.stringify(data, bigintReplacer));
};
// Create goal
router.post('/', async (req, res) => {
    try {
        if (!req.userId)
            return res.status(401).json({ error: 'Unauthorized' });
        const { title, description, targetAmount, targetDate } = req.body;
        const goal = await prisma.goal.create({
            data: {
                title,
                description,
                targetAmount: BigInt(targetAmount),
                targetDate: new Date(targetDate),
                type: 'INDIVIDUAL',
                createdBy: req.userId,
            },
            include: {
                transactions: true,
            },
        });
        res.json(formatResponse(goal));
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create goal' });
    }
});
// Get user goals
router.get('/', async (req, res) => {
    try {
        if (!req.userId)
            return res.status(401).json({ error: 'Unauthorized' });
        const goals = await prisma.goal.findMany({
            where: {
                createdBy: req.userId,
            },
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
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        res.json(formatResponse(goals));
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch goals' });
    }
});
// Get goal by ID
router.get('/:id', async (req, res) => {
    try {
        if (!req.userId)
            return res.status(401).json({ error: 'Unauthorized' });
        const goal = await prisma.goal.findUnique({
            where: { id: req.params.id },
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
                },
                sharedGoal: {
                    include: {
                        members: {
                            include: {
                                user: {
                                    select: { id: true, name: true, email: true },
                                },
                            },
                        },
                    },
                },
            },
        });
        if (!goal) {
            return res.status(404).json({ error: 'Goal not found' });
        }
        res.json(formatResponse(goal));
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch goal' });
    }
});
// Update goal
router.put('/:id', async (req, res) => {
    try {
        if (!req.userId)
            return res.status(401).json({ error: 'Unauthorized' });
        const { title, description, targetAmount, targetDate } = req.body;
        // Check ownership
        const goal = await prisma.goal.findUnique({ where: { id: req.params.id } });
        if (!goal || goal.createdBy !== req.userId) {
            return res.status(403).json({ error: 'Not authorized to update this goal' });
        }
        const updatedGoal = await prisma.goal.update({
            where: { id: req.params.id },
            data: {
                title,
                description,
                targetAmount: BigInt(targetAmount),
                targetDate: new Date(targetDate),
            },
            include: {
                transactions: true,
            },
        });
        res.json(formatResponse(updatedGoal));
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update goal' });
    }
});
// Delete goal
router.delete('/:id', async (req, res) => {
    try {
        if (!req.userId)
            return res.status(401).json({ error: 'Unauthorized' });
        const goal = await prisma.goal.findUnique({ where: { id: req.params.id } });
        if (!goal || goal.createdBy !== req.userId) {
            return res.status(403).json({ error: 'Not authorized to delete this goal' });
        }
        await prisma.goal.delete({ where: { id: req.params.id } });
        res.json({ message: 'Goal deleted successfully' });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete goal' });
    }
});
// Add transaction
router.post('/:id/transactions', async (req, res) => {
    try {
        if (!req.userId)
            return res.status(401).json({ error: 'Unauthorized' });
        const { amount, type, note } = req.body;
        const goalId = req.params.id;
        const goal = await prisma.goal.findUnique({ where: { id: goalId } });
        if (!goal) {
            return res.status(404).json({ error: 'Goal not found' });
        }
        // Check access
        const hasAccess = goal.createdBy === req.userId ||
            (await prisma.sharedGoal.findFirst({
                where: {
                    goalId,
                    members: {
                        some: { userId: req.userId },
                    },
                },
            })) !== null;
        if (!hasAccess) {
            return res.status(403).json({ error: 'Not authorized to add transaction' });
        }
        const transaction = await prisma.transaction.create({
            data: {
                goalId,
                userId: req.userId,
                amount: BigInt(amount),
                type,
                note,
            },
        });
        // Update goal current amount
        const amountChange = type === 'INCOME' ? BigInt(amount) : -BigInt(amount);
        await prisma.goal.update({
            where: { id: goalId },
            data: {
                currentAmount: {
                    increment: amountChange,
                },
            },
        });
        res.json(formatResponse(transaction));
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to add transaction' });
    }
});
exports.default = router;
//# sourceMappingURL=goal.routes.js.map