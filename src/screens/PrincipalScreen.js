import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, ActivityIndicator, Button } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';

import { Colors } from '../constants/styles';
import { getFirestore, getDoc, doc, updateDoc, onSnapshot } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';


export default function PrincipalScreen() {
  const db = getFirestore();
  
  const auth = getAuth();
  const uid = auth.currentUser.uid;
  const userRef = doc(db, 'usuarios', uid);

  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(true);
  const [credito, setCredito] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);
    
  useEffect(() => {
    const q = getDoc(userRef);

    const unsubscribe = onSnapshot(userRef, doc => {
      const usuario = doc.data();

      const creditos = usuario.creditos;

      if (creditos) {
        let acumulador = 0;

        acumulador += creditos['diez'] ? creditos['diez'] * 10 : 0;
        acumulador += creditos['cincuenta'] ? creditos['cincuenta'] * 50 : 0;
        acumulador += creditos['cien'] ? creditos['cien'] * 100 : 0;

        setCredito(acumulador);
      }
      setCargando(false);
    });

    return unsubscribe;
  }, [])

  const handleBarCodeScanned = async ({ type, data }) => {
    setScanned(true);
    setCargando(true);
    
    const codigoQR = data.trim();

    const userSnap = await getDoc(userRef);
    const usuario = userSnap.data();

    if (usuario.perfil !== 'admin') {
      let clave = '';
      let aumento = 0;
      
      if (codigoQR === '8c95def646b6127282ed50454b73240300dccabc') {
        clave = 'diez';
        aumento = 10;
      }
      else if (codigoQR == 'ae338e4e0cbb4e4bcffaf9ce5b409feb8edd5172') {
        clave = 'cincuenta';
        aumento = 50;
      }
      else if (codigoQR === '2786f4877b9091dcad7f35751bfcf5d5ea712b2f') {
        clave = 'cien';
        aumento = 100;
      }

      if (clave !== '') {
        if (!usuario.creditos || !usuario.creditos[clave]) {
          await updateDoc(userRef, {
            [`creditos.${clave}`]: 1
          });

          // setCredito(creditoAnterior => creditoAnterior + aumento);
        }
        else {
          const vecesCargado = usuario.creditos[clave];

          if (vecesCargado < 1 || !vecesCargado) {
            await updateDoc(userRef, {
              [`creditos.${clave}`]: 1
            });

            // setCredito(creditoAnterior => creditoAnterior + aumento);
          }
          else {
            setError('Error: Código ya utilizado.');
            setCargando(false);
          }
        }
      }
      else {
        setError('Error: QR inválido.');
        setCargando(false);
      }
    }
  };

  if (hasPermission === null) {
    return <Text>Requesting for camera permission</Text>;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  function escanearPressHandler() {
    setScanned(false);
  }

  async function anularPressHandler() {
    await updateDoc(userRef, {
      creditos: {}
    });
  }

  return (
    <View style={styles.container}>

      <View style={styles.botonContainer}>
        <Button
          onPress={anularPressHandler}
          title="Anular crédito"
          color="#FF0000"            
        />
      </View>

      <View style={styles.creditoContainer}>
        <Text style={styles.creditoTitulo}>
          Crédito:
        </Text>
        {
          cargando ?
          <ActivityIndicator
            size="large"
            color={Colors.primary800}
          />
          :
          <Text style={styles.creditoTexto}>
            {credito}
          </Text>
        }
      </View>

      <View style={styles.errorContainer}>
        <Text style={styles.errorTexto}>
          { error }        
        </Text>
      </View>

      <View style={styles.botonContainer}>
        <Button
          onPress={escanearPressHandler}
          title="Escanear QR"
          color="#841584"
        >
        </Button>
      </View>

      {
        !scanned &&
        <BarCodeScanner
          onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
          style={StyleSheet.absoluteFillObject}
          // style={StyleSheet.escaner}
        />
      }
      
    </View>
  );
}

const styles = StyleSheet.create({
  // escaner: {
  //   flex: 1
  // },
  container: {
    flex: 1,
    justifyContent: 'space-around',
    padding: 30
  },
  creditoContainer: {
    justifyContent: 'space-evenly',
    alignItems: 'center',
    backgroundColor: '#FFF9FB',
    borderRadius: 5,
    flex: 2
  },
  botonContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    backgroundColor: Colors.error100,
    justifyContent: 'center',
    alignItems: 'center',
    flex: 0.5,
    borderRadius: 5,
    margin: 20
  },
  errorTexto: {
    color: 'white',
    fontSize: 18
  },
  creditoTexto: {
    color: Colors.primary800,
    fontSize: 54
  },
  creditoTitulo: {
    color: Colors.primary800,
    fontSize: 40
  }

}); 