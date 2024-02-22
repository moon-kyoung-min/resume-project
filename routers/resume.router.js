import express from "express";
import { PrismaClient } from "@prisma/client";
import jwtwebToken from "jsonwebtoken";
import jwtValidate from "../middleware/jwt-auth-middleware.js";

const router = express.Router();
const prisma = new PrismaClient();

router.get('/', async (req, res) => {
    const orderKey = req.query.orderKey ?? 'resumeId';
    const orderValue = req.query.orderValue ?? 'desc';

    if (!['resumeId', 'status'].includes(orderKey)) {
        return res.status(400).json({
            success: false,
            message: 'orderkey 가 올바르지 않습니다.'
        })
    }

    if (!['asc', 'desc'].includes(drderValue.toLowerCase())) {
        return res.status(400).json({
            success: false,
            message: 'orderValue 가 올바르지 않습니다.'
        })
    }

    const resumes = await prisma.resume.findMany({
        select: {
            resumeId: true,
            title: true,
            content: true,
            user: {
                select: {
                    name: true,
                }
            },
            createdAt: true,
        },
        orderBy: [
            {
                [orderkey]: orderValue.toLowerCase(),
            }
        ]
    })

    resumes.forEach(resume => {
        resume.name = resume.user.name;
        delete resume.user;
    })

    return res.json({ data: resumes });
})

router.get('/:resumeId', async (req, res) => {
    const resumeId = req.params.resumeId;
    if (!resumeId) {
        return res.status(400).json({
            success: false,
            message: 'resumeId를 입력해주세요.'
        })
    }

    const resume = await prisma.resume.findFirst({
        where: {
            resumeId: Number(resumeId)
        },
        select: {
            resumeId: true,
            title: true,
            content: true,
            user: {
                select: {
                    name: true,
                }
            },
            createdAt: true,
        }
    })

    return res.json({ data: resume });
})

router.post('/', jwtValidate, async (req, res) => {
    const user = res.locals.user;
    const { title, content } = req.body;
    if (!title) {
        return res.status(400).json({
            success: false,
            message: '제목을 입력해 주세요.'
        })
    }
    if (!content) {
        return res.status(400).json({
            success: false,
            message: '자기소개내용을 입력해 주세요.'
        })

    }

    await prisma.resume.create({
        data: {
            title,
            content,
            status: 'APPLY',
            userId: user.userId,
        }

    })
    return res.status(201).json({});
})

router.patch('/:resumeId', jwtValidate, async (req, res) => {
    const user = res.locals.user;
    const resumeId = req.params.resumeId;
    const { title, content, status } = req.body;
    if (!resumeId) {
        return res.status(400).json({
            success: false,
            message: 'resumeId는 필수값입니다.',
        })
    }
    if (!title) {
        return res.status(400).json({
            success: false,
            message: '이력서 제목을 입력해주세요.',
        })
    }
    if (!content) {
        return res.status(400).json({
            success: false,
            message: '자기소개는 필수값입니다.',
        })
    }
    if (!status) {
        return res.status(400).json({
            success: false,
            message: '상태값은 필수값입니다.',
        })
    }
    if (!['APPLY', 'DROP', 'PASS', 'INTERVIEW1', 'INTERVIEW2', 'FINAL_PASS'].includes(status)) {
        return res.status(400).json({
            success: false,
            message: '올바르지 않은 상태값 입니다.',
        })
    }

    const resume = await prisma.resume.findFirst({
        where: {
            resumeId: Number(resumeId),
        }
    });

    if (!resume) {
        return res.status(400).json({
            success: false,
            message: '존재하지 않는 이력서 입니다.',
        })
    }
    if (resume.userId !== user.userId) {
        return res.status(400).json({
            success: false,
            message: '올바르지않는 요청입니다.',
        })
    }

    await prisma.resume.update({
        where: {
            resumeId: Number(resumeId),
        },
        data: {
            title,
            content,
            status
        }
    })
    return res.status(201).end();
});

router.delete('/:resumeId', jwtValidate, async (req, res) => {
    const user = res.locals.user;
    const resumeId = req.params.resumeId;

    if (!resumeId) {
        return res.status(400).json({
            success: false,
            message: 'resumeId는 필수값입니다.',
        })
    }
    const resume = await prisma.resume.findFirst({
        shere: {
            resumeId: Number(resumeId),
        }
    });

    if (!resume) {
        return res.status(400).json({
            success: false,
            message: '존재하지 않는 이력서입니다.',
        })
    }

    if (resume.userId !== user.userId) {
        return res.status(400).json({
            success: false,
            message: '올바르지않는 요청입니다.',
        })
    }

    await prisma.resume.delete({
        where: {
            resumeId: Number(resumeId),
        },
    })
    return res.status(201).end();
})
export default router;