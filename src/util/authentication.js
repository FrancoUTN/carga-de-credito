import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

export default async function login(email, password) {
    const uc = await signInWithEmailAndPassword(getAuth(), email, password);

    return uc.user;
}
