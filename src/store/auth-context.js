import { createContext, useState } from 'react';

export const AuthContext = createContext({
  email: '',
  authenticate: (email) => {},
  logout: () => {},
});

function AuthContextProvider({ children }) {
  const [email, setEmail] = useState();

  function authenticate(email) {
    setEmail(email);
  }

  function logout() {
    setEmail(null);
  }

  const value = {
    email: email,
    authenticate: authenticate,
    logout: logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthContextProvider;
