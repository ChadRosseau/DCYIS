import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';

@Component({
  selector: 'app-firebase-button',
  templateUrl: './firebase-button.component.html',
  styleUrls: ['./firebase-button.component.css']
})
export class FirebaseButtonComponent implements OnInit {

  constructor(private db: AngularFirestore) {
    const things = db.collection('users').valueChanges();
    things.subscribe(console.log);
  }

  ngOnInit(): void {
  }

  addUser() {

  }

}
