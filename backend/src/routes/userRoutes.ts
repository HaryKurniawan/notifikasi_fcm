import { Router } from 'express';
import { registerToken, getUsers, deleteUser } from '../controllers/userController';

const router = Router();

router.post('/register', registerToken);
router.get('/', getUsers);
router.delete('/:id', deleteUser);

export default router;
