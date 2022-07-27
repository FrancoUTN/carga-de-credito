import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import Button from '../ui/Button';
import FlatButton from '../ui/FlatButton';
import Input from './Input';

function AuthForm({ onSubmit, credentialsInvalid }) {
  const [enteredEmail, setEnteredEmail] = useState('');
  const [enteredPassword, setEnteredPassword] = useState('');

  const {
    email: emailIsInvalid,
    password: passwordIsInvalid
  } = credentialsInvalid;

  function updateInputValueHandler(inputType, enteredValue) {
    switch (inputType) {
      case 'email':
        setEnteredEmail(enteredValue);
        break;
      case 'password':
        setEnteredPassword(enteredValue);
        break;
    }
  }

  function submitHandler() {
    onSubmit({
      email: enteredEmail,
      password: enteredPassword
    });
  }

  function accesoAdminHandler() {
    setEnteredEmail('admin@admin.com');
    setEnteredPassword('111111');
  }

  function accesoInvitadoHandler() {
    setEnteredEmail('invitado@invitado.com');
    setEnteredPassword('222222');
  }

  function accesoUsuarioHandler() {
    setEnteredEmail('usuario@usuario.com');
    setEnteredPassword('333333');
  }

  function accesoAnonimoHandler() {
    setEnteredEmail('anonimo@anonimo.com');
    setEnteredPassword('444444');
  }

  function accesoTesterHandler() {
    setEnteredEmail('tester@tester.com');
    setEnteredPassword('555555');
  }

  return (
    <View style={styles.form}>
      <View>
        <Input
          label="Correo electrónico"
          onUpdateValue={updateInputValueHandler.bind(this, 'email')}
          value={enteredEmail}
          keyboardType="email-address"
          isInvalid={emailIsInvalid}
        />
        <Input
          label="Contraseña"
          onUpdateValue={updateInputValueHandler.bind(this, 'password')}
          secure
          value={enteredPassword}
          isInvalid={passwordIsInvalid}
        />
        <View style={styles.buttons}>
          <Button onPress={submitHandler}>
            Iniciar sesión
          </Button>
        </View>

        <View style={styles.buttons}>
          <FlatButton onPress={accesoAdminHandler}>
            Acceso admin
          </FlatButton>
        </View>
        <View style={styles.buttons}>
          <FlatButton onPress={accesoInvitadoHandler} >
            Acceso invitado
          </FlatButton>
        </View>
        <View style={styles.buttons}>
          <FlatButton onPress={accesoUsuarioHandler} >
            Acceso usuario
          </FlatButton>
        </View>        
        <View style={styles.buttons}>
          <FlatButton onPress={accesoAnonimoHandler} >
            Acceso anónimo
          </FlatButton>
        </View>
        <View style={styles.buttons}>
          <FlatButton onPress={accesoTesterHandler} >
            Acceso tester
          </FlatButton>
        </View>

      </View>
    </View>
  );
}

export default AuthForm;

const styles = StyleSheet.create({
  buttons: {
    marginTop: 12,
  },
});
