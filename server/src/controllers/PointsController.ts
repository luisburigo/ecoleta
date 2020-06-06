import connection from '../database/connection';
import {Request, Response} from 'express';

class PointsController {
    async index(request: Request, response: Response) {
        const {city, uf, items} = request.query;

        const parsedItems = String(items)
            .split(',')
            .map(item => Number(item.trim()));

        console.log(parsedItems)

        const points = await connection('points')
            .join('point_items', 'points.id', '=', 'point_items.point_id')
            .whereIn('point_items.item_id', parsedItems)
            .where('city', String(city))
            .where('uf', String(uf))
            .distinct()
            .select('points.*');

        const serializedPoints = points.map(point => ({...point, imgUrl: `http://192.168.0.6:3333/uploads/${point.image}`}))

        return response.json(serializedPoints);
    }

    async show(request: Request, response: Response) {
        const {id} = request.params;

        const point = await connection('points').where('id', id).first();

        if (!point) {
            return response.status(400).json({message: 'Point not found.'})
        }

        const items = await connection('items')
            .join('point_items', 'items.id', '=', 'point_items.item_id')
            .where('point_items.point_id', id)
            .select('items.title');

        const serializedPoint = {...point, imgUrl: `http://192.168.0.6:3333/uploads/${point.image}`}

        return response.json({point: serializedPoint, items});
    }

    async create(request: Request, response: Response) {
        const {
            name,
            email,
            whatsapp,
            latitude,
            longitude,
            city,
            uf,
            items,
        } = request.body;

        const trx = await connection.transaction();

        const point = {
            image: request.file.filename,
            name,
            email,
            whatsapp,
            latitude,
            longitude,
            city,
            uf
        };

        const ids = await trx('points').insert(point);

        const point_id = ids[0];

        const pointItems = items
            .split(',')
            .map((item: string) => Number(item.trim()))
            .map((item_id: number) => ({item_id, point_id}))

        await trx('point_items').insert(pointItems);

        await trx.commit();

        return response.json({...point, id: point_id})
    }
}

export default new PointsController;
