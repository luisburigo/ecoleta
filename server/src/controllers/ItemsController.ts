import {Request, Response} from 'express';
import connection from '../database/connection';

class ItemsController {
    async index(request: Request, response: Response) {
        const items = await connection('items').select('*');

        const serialized = items.map(item => ({...item, imgUrl: `http://192.168.0.6:3333/uploads/${item.image}`}));

        return response.json(serialized)
    }
}

export default new ItemsController;
