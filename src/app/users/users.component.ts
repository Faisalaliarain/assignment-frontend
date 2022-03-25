import { Component, OnInit } from '@angular/core';
import {AuthService} from '../_services/auth.service';
import {TokenStorageService} from '../_services/token-storage.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {

  isLoggedIn = false;
  currentUser: any;
  users: any;
  selectedUser: any;
  username: any;
  constructor(private authService: AuthService, private tokenStorage: TokenStorageService, public router: Router) { }

  ngOnInit(): void {
    if (this.tokenStorage.getToken()) {
      this.isLoggedIn = true;
      this.currentUser = this.tokenStorage.getUser();
    }
  }
  search(username: string): void {
    console.log(username);
    this.authService.searchUser(username).subscribe(
      data => {
        this.users = data;
        console.log(data);
      }
    );
  }
  chat(user): void {
    console.log(user);
    this.router.navigate(['/chat'], {state : { receiver : user }});
  }

}
