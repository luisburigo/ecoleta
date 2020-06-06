import React, {useEffect, useState} from 'react';
import {Image, SafeAreaView, Text, TouchableOpacity, View} from 'react-native';
import {StyleSheet} from 'react-native';
import {Feather as Icon, FontAwesome} from '@expo/vector-icons';
import {useNavigation, useRoute} from '@react-navigation/native';
import {RectButton} from "react-native-gesture-handler"
import api from '../../services/api';
import MailComposer from 'expo-mail-composer';
import {Linking} from 'expo';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 32,
        paddingTop: 20,
    },

    pointImage: {
        width: '100%',
        height: 120,
        resizeMode: 'cover',
        borderRadius: 10,
        marginTop: 32,
    },

    pointName: {
        color: '#322153',
        fontSize: 28,
        fontFamily: 'Ubuntu_700Bold',
        marginTop: 24,
    },

    pointItems: {
        fontFamily: 'Roboto_400Regular',
        fontSize: 16,
        lineHeight: 24,
        marginTop: 8,
        color: '#6C6C80'
    },

    address: {
        marginTop: 32,
    },

    addressTitle: {
        color: '#322153',
        fontFamily: 'Roboto_500Medium',
        fontSize: 16,
    },

    addressContent: {
        fontFamily: 'Roboto_400Regular',
        lineHeight: 24,
        marginTop: 8,
        color: '#6C6C80'
    },

    footer: {
        borderTopWidth: StyleSheet.hairlineWidth,
        borderColor: '#999',
        paddingVertical: 20,
        paddingHorizontal: 32,
        flexDirection: 'row',
        justifyContent: 'space-between'
    },

    button: {
        width: '48%',
        backgroundColor: '#34CB79',
        borderRadius: 10,
        height: 50,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center'
    },

    buttonText: {
        marginLeft: 8,
        color: '#FFF',
        fontSize: 16,
        fontFamily: 'Roboto_500Medium',
    },
});

interface Params {
    point_id: number;
}

interface Data {
    point: {
        image: string;
        imgUrl: string;
        name: string;
        email: string;
        whatsapp: string;
        city: string;
        uf: string;
    },
    items: {
        title: string
    }[]
}

const Detail = () => {
    const [data, setData] = useState<Data>({} as Data);
    const navigation = useNavigation();
    const route = useRoute();

    const params = route.params as Params;

    useEffect(() => {

        api.get(`points/${params.point_id}`)
            .then(response => {
                setData(response.data);
            })

    }, []);

    function hanleNavigationBack() {
        navigation.goBack();
    }

    function handleComposeEmail() {
        MailComposer.composeAsync({
            subject: 'Interesse na coleta de residuos',
            recipients: [data.point.email],

        })
    }

    function handleWhatsapp() {
        Linking.openURL(`whatsapp://send?phone=${data.point.whatsapp}&text=${"Tenho interesse na coleta de residuos"}`)
    }

    if (!data.point) {
        return null;
    }

    return (
        <SafeAreaView style={{flex: 1}}>
            <View style={styles.container}>
                <TouchableOpacity onPress={hanleNavigationBack}>
                    <Icon name="arrow-left" size={20} color="#34cb79"/>
                </TouchableOpacity>

                <Image source={{uri: data.point.imgUrl}} style={styles.pointImage}/>

                <Text style={styles.pointName}>{data.point.name}</Text>
                <Text style={styles.pointItems}>{
                    data.items
                        .map(item => item.title)
                        .join(", ")
                }</Text>

                <View style={styles.address}>
                    <Text style={styles.addressTitle}>Endereço</Text>
                    <Text style={styles.addressContent}>{data.point.city} / {data.point.uf} </Text>
                </View>
            </View>

            <View style={styles.footer}>
                <RectButton style={styles.button} onPress={() => {
                }}>
                    <FontAwesome name="whatsapp" size={20} color="#fff"/>
                    <Text style={styles.buttonText}>Whatsapp</Text>
                </RectButton>
                <RectButton style={styles.button} onPress={handleComposeEmail}>
                    <Icon name="mail" size={20} color="#fff"/>
                    <Text style={styles.buttonText}>E-mail</Text>
                </RectButton>
            </View>
        </SafeAreaView>
    )
}

export default Detail;