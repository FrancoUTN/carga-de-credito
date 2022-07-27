import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';

import Button from '../components/ui/Button';
import { Colors } from '../constants/styles';
import { getFirestore, getDoc, getDocs, where, doc, get } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

export default function PrincipalScreen() {
  const auth = getAuth();
  const uid = auth.currentUser.uid;
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
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
    // const qrSimulado = '8c95def646b6127282ed50454b73240300dccabc';
    const qrSimulado = 'ae338e4e0cbb4e4bcffaf9ce5b409feb8edd5172';

    // console.log(uid);
    const db = getFirestore();
    const userRef = doc(db, 'usuarios', uid);
    const userSnap = await getDoc(userRef);

    console.log(userSnap.data());


    const usuario = userSnap.data();

    if (usuario.perfil !== 'admin') {
      const creditos = usuario.creditos;

      let clave = '';

      
      if (qrSimulado === '8c95def646b6127282ed50454b73240300dccabc') {
        clave = 'diez';
      }
      else if (qrSimulado === 'ae338e4e0cbb4e4bcffaf9ce5b409feb8edd5172') {
        clave = 'cincuenta';
      }

      console.log(creditos[clave]);
      // console.log(creditos['diez']);
    }

    // const doc = await colRef.doc(uid).get();

    // console.log(doc);

    // const querySnapshot = await getDocs(colRef);

    // querySnapshot.forEach((doc) => {
    //   console.log(`${doc.id} => ${doc.data().creditos?.diez}`);
    // });
  }

  return (
    <View style={styles.container}>
      <View style={styles.creditoContainer}>
        <Text>
          Crédito
        </Text>
        <Text>
          $150
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