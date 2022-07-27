import { collection, getFirestore } from 'firebase/firestore';

export default collection(getFirestore(), 'usuarios');
