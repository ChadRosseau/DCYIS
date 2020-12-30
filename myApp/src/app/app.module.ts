import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

// Firebase
import { environment } from '../environments/environment';
import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireDatabaseModule } from '@angular/fire/database';
import { AngularFireStorageModule } from '@angular/fire/storage';
import { AngularFireAuthModule } from '@angular/fire/auth';

// Login
import { AuthService } from "./services/auth.service";

// Components
import { HomeComponent } from './components/home/home.component';
import { FirebaseButtonComponent } from './components/home/firebase-button/firebase-button.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { LoginComponent } from './components/navbar/login/login.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    FirebaseButtonComponent,
    NavbarComponent,
    LoginComponent
  ],
  imports: [
    AngularFireModule.initializeApp(environment.firebaseConfig), // Firebase
    AngularFirestoreModule, // Firestore
    AngularFireDatabaseModule, // Firebase Realtime DB
    AngularFireAuthModule, // Firebase auth
    // AngularFireStorageModule, // Firebase storage
    BrowserModule,
    AppRoutingModule
  ],
  providers: [AuthService],
  bootstrap: [AppComponent]
})
export class AppModule { }
