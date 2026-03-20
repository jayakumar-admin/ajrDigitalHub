import { Injectable, signal } from '@angular/core';
import { auth, db } from './firebase';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userSignal = signal<User | null>(null);
  private isAdminSignal = signal<boolean>(false);

  user = this.userSignal.asReadonly();
  isAdmin = this.isAdminSignal.asReadonly();

  constructor() {
    onAuthStateChanged(auth, async (user) => {
      this.userSignal.set(user);
      if (user) {
        await this.checkAdminStatus(user.uid);
      } else {
        this.isAdminSignal.set(false);
      }
    });
  }

  private async checkAdminStatus(uid: string) {
    // Check if user is the default admin or has admin role in Firestore
    const isDefaultAdmin = auth.currentUser?.email === 'jkjaikumar555@gmail.com';
    
    if (isDefaultAdmin) {
      this.isAdminSignal.set(true);
      return;
    }

    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists() && userDoc.data()['role'] === 'admin') {
        this.isAdminSignal.set(true);
      } else {
        this.isAdminSignal.set(false);
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
      this.isAdminSignal.set(false);
    }
  }

  async login() {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  }

  async logout() {
    await signOut(auth);
  }
}
