import express from 'express';
import userRouter from './routers/user.router.js';
import resumeRouter from './routers/resume.router.js';
const app = express();
const port = 3306;


app.use(express.json());

app.use('/users', userRouter);
app.use('/resumes', resumeRouter);


app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})