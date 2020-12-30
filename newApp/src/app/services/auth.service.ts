import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import firebase from 'firebase/app';
import { AngularFireAuth } from '@angular/fire/auth';
import {
  AngularFirestore,
  AngularFirestoreDocument
} from '@angular/fire/firestore';

import {
  AngularFireDatabase,
  AngularFireObject
} from '@angular/fire/database';

import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators'
import { User } from './user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  user$: Observable<User>;
  userKey: string;

  constructor(
    private afAuth: AngularFireAuth,
    public db: AngularFireDatabase,
    private router: Router
  ) {
    this.user$ = this.afAuth.authState.pipe(
      switchMap(user => {
        if (user) {
          this.userKey = user.uid;
          return this.db.object<User>(`users/${user.uid}`).valueChanges();
        } else {
          return of(null);
        }
      })
    )
  }

  async googleSignIn() {
    const provider = new firebase.auth.GoogleAuthProvider();
    const credential = await this.afAuth.signInWithPopup(provider);
    return this.updateUserData(credential.user);
  }

  async signOut() {
    await this.afAuth.signOut();
    this.user$ = null;
    return this.router.navigate(['/']);
  }

  async updateUserData({ uid, email, displayName, photoURL }: User) {
    // Set user data
    const dbUserRef = this.db.object<User>(`users/${uid}`);
    const data = {
      uid: uid,
      email: email,
      displayName: displayName,
      photoURL: photoURL
    }
    dbUserRef.set(data);
    this.user$ = dbUserRef.valueChanges();

    this.userKey = uid;

    this.setNewUserBalance(uid);

    // location.reload();
  }

  // Set tracking variables
  setNewUserBalance(uid) {
    const dbUserBalRef = this.db.database.ref(`portfolios/${uid}/balance`);
    dbUserBalRef.once('value', (snapshot) => {
      const data = snapshot.val();
      if (data == null) {
        dbUserBalRef.set(10000);
      };
    })
  }

  async updateUserBalance(uid: string, balance: number) {
    const dbUserBalRef = await this.db.database.ref(`portfolios/${uid}/balance`);
    dbUserBalRef.set(balance);
  }
}
