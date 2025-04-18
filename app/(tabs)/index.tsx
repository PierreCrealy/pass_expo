import {ActivityIndicator, Button, Image, StyleSheet, View,} from 'react-native';
import React, {useCallback, useEffect} from "react";

import {HelloWave} from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import {ThemedText} from '@/components/ThemedText';
import {ThemedView} from '@/components/ThemedView';
import CategorySection from "@/components/CategorySection";

import {User} from "@/entities/User";
import {Order} from "@/entities/Order";

import {Categories} from "@/constants/Categories";

import * as SecureStore from "expo-secure-store";

import MapView, {Marker} from "react-native-maps";
import Ionicons from "@expo/vector-icons/Ionicons";
import OrderProgress from "@/components/OrderProgress";
import {useFocusEffect} from "expo-router";

export default function HomeScreen() {

    const [categories, setCategories] = React.useState<string[]>([]);
    const [user, setUser] = React.useState<User>();
    const [location, setLocation] = React.useState();
    const [order, setOrder] = React.useState<Order>();
    const [token, setToken] = React.useState<string>();

    const [loading, setLoading] = React.useState(false);

    useFocusEffect(
        useCallback(() => {

        }, [user?.id])
    );
    useFocusEffect(
        useCallback(() => {
            const loadUser = async () => {
                const tokenSec = await SecureStore.getItemAsync('userToken');
                const userInfo = await SecureStore.getItemAsync('userInfo');

                const userSec = JSON.parse(userInfo as string);
                setUser(userSec);
                setToken((tokenSec) as string);

                latestProgressUserOrder();
            };

            const loadLocation = async () => {
                const locationSec = await SecureStore.getItemAsync('location');
                // @ts-ignore
                setLocation(locationSec);
            };
            const latestProgressUserOrder = async () => {
                setLoading(true);

                await fetch(`https://pass-api.pierre-dev-app.fr/api/v1/order/${user?.id}/PROGRESS/latest`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                })
                    .then((response) => response.json())
                    .then(data => {
                        setOrder(data.orders);
                        setLoading(false);
                    })
                    .catch((e) => console.log('error : ' + e.message));
            };

            loadLocation();
            loadUser();

            setCategories(Categories);

            return () => {
                // cleanup (opt)
            };
        }, [user?.id])
    );


    return (
        <ParallaxScrollView
            headerBackgroundColor={{light: '#A1CEDC', dark: '#1D3D47'}}
            headerImage={
                <Image
                    source={require('@/assets/images/bar.png')}
                    style={styles.reactLogo}
                />
            }>
            <ThemedView style={styles.titleContainer}>
                <ThemedText type="title">Bienvenue {user?.name}</ThemedText>
                <HelloWave/>
            </ThemedView>

            <ThemedText type="default">Vous êtes en {location}</ThemedText>


            { loading ? (
                <ActivityIndicator size="large" color="#B3D8DE" />
            ) : (
                <OrderProgress order={order}/>
            )}


            <ThemedView style={styles.sectionContainer}>
                <ThemedText type="title">Catégories</ThemedText>
                <Ionicons name="filter" size={28} color="black" />
            </ThemedView>

            <ThemedView style={styles.stepContainer}>
                <CategorySection categories={categories} />
            </ThemedView>


        </ParallaxScrollView>
    );
}

const styles = StyleSheet.create({
    sectionContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 25,
    },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    stepContainer: {
        gap: 8,
        marginBottom: 8,
    },
    reactLogo: {
        width: '100%',
        height: '100%',
        // height: 178,
        // width: 290,
        // bottom: 0,
        // left: 0,
        // position: 'absolute',
    },
});
