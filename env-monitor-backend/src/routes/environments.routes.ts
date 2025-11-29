import { Router, Request, Response } from 'express';
import { environmentDb } from '../db/database';
import { CreateEnvironmentDto, UpdateEnvironmentDto } from '../models/environment.model';

const router = Router();

// GET /api/environments - Get all environments
router.get('/', (req: Request, res: Response) => {
  try {
    const environments = environmentDb.getAll();
    res.json(environments);
  } catch (error) {
    console.error('Error getting environments:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/environments/:id - Get single environment
router.get('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const environment = environmentDb.getById(id);

    if (!environment) {
      return res.status(404).json({ error: 'Environment not found' });
    }

    res.json(environment);
  } catch (error) {
    console.error('Error getting environment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/environments - Create new environment
router.post('/', (req: Request, res: Response) => {
  try {
    const data: CreateEnvironmentDto = req.body;

    // Validation
    if (!data.url || !data.status) {
      return res.status(400).json({ error: 'URL and status are required' });
    }

    if (!['working', 'degraded', 'down'].includes(data.status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    const newEnvironment = environmentDb.create(data);
    res.status(201).json(newEnvironment);
  } catch (error) {
    console.error('Error creating environment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/environments/:id - Update environment
router.put('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data: UpdateEnvironmentDto = req.body;

    // Validation
    if (data.status && !['working', 'degraded', 'down'].includes(data.status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    const updatedEnvironment = environmentDb.update(id, data);

    if (!updatedEnvironment) {
      return res.status(404).json({ error: 'Environment not found' });
    }

    res.json(updatedEnvironment);
  } catch (error) {
    console.error('Error updating environment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/environments/:id - Delete environment
router.delete('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = environmentDb.delete(id);

    if (!deleted) {
      return res.status(404).json({ error: 'Environment not found' });
    }

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting environment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
