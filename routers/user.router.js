import express from "express";
import { PrismaClient } from "@prisma/client";
const router = express.Router();
const prisma = new PrismaClient();


router.post('/sign-up', async (req, res) => {
    const { email, password, passwordconfirm, name } = req.body;
    if (!email) {
        return res.status(400).json({ success: false, message: '이메일을 입력해주세요.' })
    }
    if (!password) {
        return res.status(400).json({ success: false, message: '비밀번호를 입력해주세요.' })
    }
    if (!passwordconfirm) {
        return res.status(400).json({ success: false, message: '비밀번호 확인창을 입력해주세요.' })
    }
    if (password !== passwordconfirm) {
        return res.status(400).json({ success: false, message: '비밀번호와 비밀번호확인이 일치하지 않습니다.' })
    }
    if (password < 6) {
        return res.status(400).json({ success: false, message: '비밀번호는 6자 이상입력해야합니다.' })
    }
    if (!name) {
        return res.status(400).json({ success: false, message: '이름을 입력해주세요.' })
    }

    const sameemail = await prisma.user.findFirst({
        where: {
            email: email
        }
    })
    if (sameemail) {
        return res.status(400).json({ success: false, message: '이미 사용중인 이메일입니다.' })
    }

    await prisma.user.create({
        data: {
            email: email,
            password: password,
            passwordconfirm: passwordconfirm,
            name: name,
        }
    });
    return res.status(201).json({
        email,
        name,
        massage: '회원가입에 성공하였습니다.'
    })
});

export default router;
