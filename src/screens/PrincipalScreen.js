import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, ActivityIndicator, Button, Pressable, Image } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';

import { Colors } from '../constants/styles';
import { getFirestore, getDoc, doc, updateDoc, onSnapshot } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import LoadingOverlay from '../components/ui/LoadingOverlay';


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
    return <LoadingOverlay>Verificando permisos...</LoadingOverlay>;
  }
  if (hasPermission === false) {
    return <Text>Sin acceso a la cámara.</Text>;
  }

  function escanearPressHandler() {
    setError('');
    setScanned(false);
  }

  function cancelarEscanearPressHandler() {
    setScanned(true);
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
            color={Colors.muyOscuro}
          />
          :
          <Text style={styles.creditoTexto}>
            $ {credito}
          </Text>
        }
      </View>

      <View style={styles.errorContainer}>
        <Text style={styles.errorTexto}>
          { error }        
        </Text>
      </View>

      <View style={styles.botonContainerContainer}>
        <View style={styles.botonContainer}>
          <Pressable
            onPress={escanearPressHandler}
            style={
              ({pressed}) => {
                return pressed && { opacity: 0.7 }
              }
            }
          >
            <View style={styles.boton}>
              <Image
                style={styles.imagenBoton}
                source={require('../../assets/qr-code.png')}
              />
              <Text style={styles.textoBoton}>
                Escanear QR
              </Text>
            </View>
          </Pressable>
        </View>
      </View>

      {
        !scanned &&
        <>
          {/* <View style={styles.escanerContainer}> */}
            <BarCodeScanner
              onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
              // style={StyleSheet.absoluteFillObject}
              style={styles.escaner}
            />
          {/* </View> */}
          {/* <View */}
          <View style={styles.escanerContainer}>

          </View>
          <View style={styles.botonEscanerContainer}>
            <Pressable
              onPress={cancelarEscanearPressHandler}
              style={
                ({pressed}) => {
                  return [styles.botonEscanerPressable , pressed && { opacity: 0.7 }]
                }
              }
            >
              <Text style={styles.botonEscaner}>
                Cancelar
              </Text>
            </Pressable>
          </View>
        </>
      }
      
    </View>
  );
}

const styles = StyleSheet.create({
  escanerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,

    backgroundColor: 'black',
  },
  escaner: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,

    zIndex: 1,
  },
  botonEscanerContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  botonEscanerPressable: {
    flex: 1,
    zIndex: 2,
    // backgroundColor: Colors.claro,
  },
  botonEscaner: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,

    fontFamily: 'Monda_400Regular',
    zIndex: 3,
    color: Colors.muyOscuro,
    textAlign: 'center',
    fontSize: 22
  },
  container: {
    flex: 1,
    justifyContent: 'space-around',
    // padding: 30
  },
  creditoContainer: {
    justifyContent: 'space-evenly',
    alignItems: 'center',
    // backgroundColor: '#FFF9FB',
    backgroundColor: Colors.muyClaro,
    borderRadius: 15,
    flex: 2.5,
    margin: 30,
    elevation: 4,
  },
  errorContainer: {
    // backgroundColor: Colors.error100,
    justifyContent: 'center',
    alignItems: 'center',
    flex: 0.5,
    borderRadius: 5,
    margin: 0
  },
  anularContainer: {
    flex: 0.5,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    margin: 30,
  },
  errorTexto: {
    fontFamily: 'Monda_700Bold',
    color: Colors.error500,
    fontSize: 18
  },
  creditoTexto: {
    fontFamily: 'Monda_400Regular',
    // color: Colors.oscuro,
    color: Colors.muyOscuro,
    fontSize: 64
  },
  creditoTitulo: {
    fontFamily: 'Monda_400Regular',
    color: Colors.muyOscuro,
    fontSize: 50
  },
  imagenBoton: {
    width: 35,
    height: 35
  },
  botonContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.muyOscuro,
    borderRadius: 15,
    paddingVertical: 15,
  },
  botonContainerContainer: {
    flex: 1,
    paddingHorizontal: 50,
    margin: 30
  },
  boton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textoBoton: {
    fontFamily: 'Monda_400Regular',
    color: Colors.muyClaro,
    margin: 10,
    fontSize: 18
  },
  scannerContainer: {
    flex: 0.5
  }

}); 