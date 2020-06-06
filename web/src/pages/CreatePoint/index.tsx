import React, {ChangeEvent, FormEvent, useEffect, useState} from 'react';
import {useHistory} from "react-router-dom"

import "./style.css";
import logo from '../../assets/logo.svg';
import {Link} from 'react-router-dom';
import {FiArrowLeft} from 'react-icons/all';
import {Map, Marker, TileLayer} from 'react-leaflet';
import api from '../../services/api';
import Axios from 'axios';
import {LeafletMouseEvent} from 'leaflet';
import Dropzone from '../../components/Dropzone';

interface Item {
    id: number,
    title: string,
    imgUrl: string,
}

interface IBGEUFResponse {
    sigla: string,
}

interface IBGECityResponse {
    nome: string,
}

const CreatePoint = () => {
    const [items, setItems] = useState<Item[]>([]);
    const [ufs, setUfs] = useState<string[]>([]);
    const [cities, setCities] = useState<string[]>([]);

    const [initialPoisition, setInitialPoisition] = useState<[number, number]>([0, 0]);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        whatsapp: '',
    })

    const [selectedUf, setSelectedUf] = useState<string>("");
    const [selectedCity, setSelectedCity] = useState<string>("");
    const [selectedItems, setSelectedItems] = useState<number[]>([]);
    const [selectedPoisition, setSelectedPoisition] = useState<[number, number]>([0, 0]);
    const [selectedFile, setSelectedFile] = useState<File>();

    const history = useHistory();

    useEffect(() => {
        api.get('items').then(response => {
            setItems(response.data);
        });
    }, []);

    useEffect(() => {
        Axios.get<IBGEUFResponse[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados')
            .then(response => {
                const ufInitials = response.data.map(uf => uf.sigla);
                setUfs(ufInitials);
            })
    }, [])

    useEffect(() => {
        if (!selectedUf) return;

        Axios.get<IBGECityResponse[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios`)
            .then(response => {
                const citiesName = response.data.map(city => city.nome);
                setCities(citiesName);
            })
    }, [selectedUf]);

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(position => {
            const {latitude, longitude} = position.coords;

            setInitialPoisition([latitude, longitude])
        })
    });

    function handleSelectedUf(event: ChangeEvent<HTMLSelectElement>) {
        setSelectedUf(event.target.value)
    }

    function handleSelectedCity(event: ChangeEvent<HTMLSelectElement>) {
        setSelectedCity(event.target.value)
    }

    function handleMapClick(event: LeafletMouseEvent) {
        setSelectedPoisition([
            event.latlng.lat,
            event.latlng.lng,
        ])
    }

    function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
        const {name, value} = event.target;

        setFormData({
            ...formData,
            [name]: value
        })
    }

    function handleSelectedItem(id: number) {
        const alreadySelected = selectedItems.indexOf(id);

        if (alreadySelected > -1) {
            const filtredItems = selectedItems.filter(item => item != id);
            setSelectedItems(filtredItems);
        } else {
            setSelectedItems([...selectedItems, id]);
        }
    }

    function handleSubmit(event: FormEvent) {
        event.preventDefault();

        const {name, email, whatsapp} = formData;
        const uf = selectedUf;
        const city = selectedCity;
        const [latitude, longitude] = selectedPoisition;
        const items = selectedItems;
        const image = selectedFile;

        const data = new FormData();
        data.append('name', name);
        data.append('email', email);
        data.append('whatsapp', whatsapp);
        data.append('uf', uf);
        data.append('city', city);
        data.append('latitude', String(latitude));
        data.append('longitude', String(longitude));
        data.append('items', items.join(','));

        if (image) {
            data.append('image', image);
        }

        api.post('points', data).then(() => {
            alert('Cadastrado com sucesso!')
            history.push('/')
        })
    }

    return (
        <div id="page-create-point">
            <header>
                <img src={logo} alt="Ecoleta"/>
                <Link to="/">
                    <FiArrowLeft/>
                </Link>
            </header>

            <form onSubmit={handleSubmit}>
                <h1>Cadastro do <br/> ponto de coleto</h1>

                <Dropzone onFileUploaded={setSelectedFile}/>

                <fieldset>
                    <legend>
                        <h2>Dados</h2>
                    </legend>

                    <div className="field">
                        <label htmlFor="name">Nome da entidade</label>
                        <input type="text" id="name" name="name" onChange={handleInputChange}/>
                    </div>

                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="email">Email</label>
                            <input type="email" id="email" name="email" onChange={handleInputChange}/>
                        </div>

                        <div className="field">
                            <label htmlFor="whatsapp">Whatsapp</label>
                            <input type="text" id="whatsapp" name="whatsapp" onChange={handleInputChange}/>
                        </div>
                    </div>
                </fieldset>

                <fieldset>
                    <legend>
                        <h2>Endereço</h2>
                        <span>Selecione o endereço no mapa</span>
                    </legend>

                    <Map center={initialPoisition} zoom={15} onClick={handleMapClick}>
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution="&copy; <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
                        />
                        <Marker position={selectedPoisition}/>
                    </Map>

                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="uf">Estado (UF)</label>
                            <select id="uf" name="uf" value={selectedUf} onChange={handleSelectedUf}>
                                <option value="">Selecione uma UF</option>
                                {ufs.map(uf => (
                                    <option key={uf} value={uf}>{uf}</option>
                                ))}
                            </select>
                        </div>
                        <div className="field">
                            <label htmlFor="cidade">Cidade</label>
                            <select name="cidade" id="cidade" value={selectedCity} onChange={handleSelectedCity}>
                                <option value="">Selecione uma cidade</option>
                                {cities.map(city => (
                                    <option key={city} value={city}>{city}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </fieldset>

                <fieldset>
                    <legend>
                        <h2>Ítens de coleta</h2>
                        <span>Selecione um ou mais itens abaixo</span>
                    </legend>

                    <ul className="items-grid">
                        {items.map(item => (
                            <li key={item.id} onClick={() => handleSelectedItem(item.id)} className={selectedItems.includes(item.id) ? "selected" : ''}>
                                <img src={item.imgUrl} alt={item.title}/>
                                <span>{item.title}</span>
                            </li>
                        ))}
                    </ul>
                </fieldset>

                <button type="submit">
                    Cadastrar ponto de coleta
                </button>
            </form>
        </div>
    )
}

export default CreatePoint;
