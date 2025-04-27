// import { Injectable } from '@angular/core';
// import { Auth, createUserWithEmailAndPassword } from '@angular/fire/auth';
// import { User } from '../models/user.model';
// import firebase from 'firebase/compat/app';


// @Injectable({
//   providedIn: 'root'
// })
// export class AuthService {
//   constructor(private auth: Auth) {}

//   async registerUser(user: User): Promise<void> {
//     // Return Firebase's createUserWithEmailAndPassword promise
//     try {
//           const userCredential = await createUserWithEmailAndPassword(this.auth, user.email, user.password);
//           // Optionally, update profile details here
//           const firebaseUser = userCredential.user;
//           console.log('User created successfully:', firebaseUser);
//       } catch (error) {
//           console.error('Registration error:', error);
//           throw error; // Rethrow to handle errors in the component
//       }

//   }
// }

import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import firebase from 'firebase/compat/app';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  user$: Observable<firebase.User | null>;

  constructor(private afAuth: AngularFireAuth, private router: Router) {
    this.user$ = afAuth.authState;
  }

//   async signIn(email: string, password: string): Promise<void> {
//     try {
//       await this.afAuth.signInWithEmailAndPassword(email, password);
//     } catch (error) {
//       console.error('Sign In Error:', error);
//     }
//   }


  async signIn(email: string, password: string): Promise<void> {
    try {
      const userCredential = await this.afAuth.signInWithEmailAndPassword(email, password);
      if (userCredential) {
        localStorage.setItem("email", email.toString());
        // Redirect to the dashboard after successful sign-in
        this.router.navigate(['/dashboard']);
      }
    } catch (error) {
      console.error('Sign In Error: ', error);
      throw error;  // Rethrow error to handle it in the login component
    }
  }

  async signOut(): Promise<void> {
    try {
      await this.afAuth.signOut();
      localStorage.clear(); 
      this.router.navigate(['/page/login']);

    } catch (error) {
      console.error('Sign Out Error:', error);
    }
  }

  async register(email: string, password: string): Promise<void> {
    try {
      await this.afAuth.createUserWithEmailAndPassword(email, password);
    } catch (error) {
      console.error('Registration Error:', error);
      throw error;  // Rethrow error to handle in component
    }
  }
  
  
  getCurrentUser(): Promise<firebase.User | null> {
    return this.afAuth.currentUser;
  }

  async deleteCurrentUser(): Promise<void> {
    const user = await this.afAuth.currentUser;
    if (user) {
      await user.delete();
    }
  }
}
