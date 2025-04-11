import express from 'express';
import adminController from '../../controller/adminController/adminController.js';
const router =express.Router()

router.post('/adminLogin',adminController.Adminlogin)

export default router