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
      
      if (codigoQR === '8c95def646b6127282ed50454b73240300dccabc') {
        clave = 'diez';
      }
      else if (codigoQR == 'ae338e4e0cbb4e4bcffaf9ce5b409feb8edd5172') {
        clave = 'cincuenta';
      }
      else if (codigoQR === '2786f4877b9091dcad7f35751bfcf5d5ea712b2f') {
        clave = 'cien';
      }

      if (clave !== '') {
        if (!usuario.creditos || !usuario.creditos[clave]) {
          setError('');

          await updateDoc(userRef, {
            [`creditos.${clave}`]: 1
          });
        }
        else {
          const vecesCargado = usuario.creditos[clave];

          if (vecesCargado < 1 || !vecesCargado) {
            setError('');

            await updateDoc(userRef, {
              [`creditos.${clave}`]: 1
            });
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
    else if (usuario.perfil == 'admin') {
      let clave = '';
      
      if (codigoQR === '8c95def646b6127282ed50454b73240300dccabc') {
        clave = 'diez';
      }
      else if (codigoQR == 'ae338e4e0cbb4e4bcffaf9ce5b409feb8edd5172') {
        clave = 'cincuenta';
      }
      else if (codigoQR === '2786f4877b9091dcad7f35751bfcf5d5ea712b2f') {
        clave = 'cien';
      }

      if (clave !== '') {
        if (!usuario.creditos || !usuario.creditos[clave]) {
          setError('');

          await updateDoc(userRef, {
            [`creditos.${clave}`]: 1
          });
        }
        else {
          const cantidad = usuario.creditos[clave];

          if (cantidad < 2) {
            setError('');

            await updateDoc(userRef, {
              [`creditos.${clave}`]: cantidad + 1
            });
          }
          else {
            setError('Error: Código ya utilizado 2 veces.');
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
    setError('');
    setScanned(false);
  }

  async function anularPressHandler() {
    setError('');

    await updateDoc(userRef, {
      creditos: {}
    });
  }

  return (
    <View style={styles.container}>

      <View style={styles.anularContainer}>
        <Button
          onPress={anularPressHandler}
          title="Anular crédito"
          color="#FF0000"
        />
      </View>

      <View style={styles.creditoContainer}>
        <Text style={styles.creditoTitulo}>
          Tu crédito:
        </Text>
        {
          cargando ?
          <ActivityIndicator
            size="large"
            color="white"
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
          color={Colors.primary800}
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
    // backgroundColor: '#FFF9FB',
    backgroundColor: Colors.primary800,
    borderRadius: 5,
    flex: 2
  },
  botonContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    // backgroundColor: Colors.error100,
    justifyContent: 'center',
    alignItems: 'center',
    flex: 0.5,
    borderRadius: 5,
    margin: 20
  },
  anularContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  errorTexto: {
    color: Colors.error500,
    fontSize: 18
  },
  creditoTexto: {
    // color: Colors.primary800,
    color: 'white',
    fontSize: 54
  },
  creditoTitulo: {
    color: Colors.primary800,
    color: 'white',
    fontSize: 40
  }

}); 