import Knex from 'knex';

export async function seed(knex: Knex) {
    await knex('items').insert([
        {title: 'Lâmpadas', image: 'lampadas.svg'},
        {title: 'Pilhas e baterias', image: 'baterias.svg'},
        {title: 'Papeis e Papelão', image: 'papeis-papelao.svg'},
        {title: 'Resóduos Eletronicos', image: 'eletronicos.svg'},
        {title: 'Resóduos Organicos', image: 'organicos.svg'},
        {title: 'Óleo de cozinha', image: 'oleo.svg'},
    ])
}
