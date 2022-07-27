import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';

import Button from '../components/ui/Button';
import { Colors } from '../constants/styles';
import { getFirestore, getDoc, getDocs, where, doc, get, setDoc, updateDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';


export default function PrincipalScreen() {
  const db = getFirestore();
  
  const auth = getAuth();
  const uid = auth.currentUser.uid;
  const userRef = doc(db, 'usuarios', uid);

  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [credito, setCredito] = useState(0);

  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);
  
  useEffect(() => {
    (async () => {
      const userSnap = await getDoc(userRef);
      const usuario = userSnap.data();
      const creditos = usuario.creditos;

      if (creditos) {
        let acumulador = 0;

        acumulador += creditos['diez'] ? creditos['diez'] * 10 : 0;
        acumulador += creditos['cincuenta'] ? creditos['cincuenta'] * 50 : 0;
        acumulador += creditos['cien'] ? creditos['cien'] * 100 : 0;

        setCredito(acumulador);
      }
    })();
  }, []);

  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true);
    console.log(typeof(data));
    alert(`Bar code with type ${type} and data ${data} has been scanned!`);
  };

  if (hasPermission === null) {
    return <Text>Requesting for camera permission</Text>;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }


  async function escanearPressHandler() {
    const qrSimulado = '8c95def646b6127282ed50454b73240300dccabc';
    // const qrSimulado = 'ae338e4e0cbb4e4bcffaf9ce5b409feb8edd5172';
    // const qrSimulado = '2786f4877b9091dcad7f35751bfcf5d5ea712b2f';

    // const db = getFirestore();
    // const userRef = doc(db, 'usuarios', uid);
    const userSnap = await getDoc(userRef);
    const usuario = userSnap.data();

    if (usuario.perfil !== 'admin') {
      let clave = '';
      let aumento = 0;
      
      if (qrSimulado === '8c95def646b6127282ed50454b73240300dccabc') {
        clave = 'diez';
        aumento = 10;
      }
      else if (qrSimulado === 'ae338e4e0cbb4e4bcffaf9ce5b409feb8edd5172') {
        clave = 'cincuenta';
        aumento = 50;
      }
      else if (qrSimulado === '2786f4877b9091dcad7f35751bfcf5d5ea712b2f') {
        clave = 'cien';
        aumento = 100;
      }

      if (!usuario.creditos || !usuario.creditos[clave]) {
        await updateDoc(userRef, {
          [`creditos.${clave}`]: 1
        });

        setCredito(creditoAnterior => creditoAnterior + aumento);
      }
      else {
        const vecesCargado = usuario.creditos[clave];

        if (vecesCargado < 1 || !vecesCargado) {
          await updateDoc(userRef, {
            [`creditos.${clave}`]: 1
          });

          setCredito(creditoAnterior => creditoAnterior + aumento);
        }
        else {
          console.log("No podés cargar más.")
        }
      }
    }

  }

  return (
    <View style={styles.container}>
      <View style={styles.creditoContainer}>
        <Text>
          Crédito
        </Text>
        <Text>
          {credito}
        </Text>
      </View>
      <View style={styles.botonContainer}>
        <Button
          color={{'backgroundColor': Colors.pps4a}}
          onPress={escanearPressHandler}
        >
            Escanear QR
        </Button>
      </View>
      {/* <BarCodeScanner
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        style={StyleSheet.absoluteFillObject}
      />
      {scanned && <Button title={'Tap to Scan Again'} onPress={() => setScanned(false)} />} */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-around'
  },
  creditoContainer: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  botonContainer: {
    padding: 20
  }
}); 