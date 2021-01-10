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
  currentPortfolioId: Observable<string>;
  currentPortfolioStonks: boolean;
  currentStocks = {};

  constructor(
    private afAuth: AngularFireAuth,
    public db: AngularFireDatabase,
    public router: Router
  ) {
    sessionStorage.clear();
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
    this.currentPortfolioId = null;
    this.currentPortfolioStonks = false;
  }

  async googleSignIn() {
    const provider = new firebase.auth.GoogleAuthProvider();
    const credential = await this.afAuth.signInWithPopup(provider);
    return this.updateUserData(credential.user);
  }

  async signOut() {
    await this.afAuth.signOut();
    this.user$ = null;
    this.router.navigate(['/']);
    return location.reload();
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

    return location.reload();
  }
  // Set tracking variables

  async updateUserBalance(uid: string, balance: number) {
    const dbUserBalRef = await this.db.database.ref(`portfolios/${uid}/balance`);
    dbUserBalRef.set(balance);
  }
}
