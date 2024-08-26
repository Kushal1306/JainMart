import express from 'express';
import UserRouter from './UserRoutes.js';
// import TestRouter from './TestRoute.js';

const mainRouter=express.Router();

mainRouter.use("/user",UserRouter);

// mainRouter.use("/test",TestRouter);


export default mainRouter;