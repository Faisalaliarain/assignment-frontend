import { Component, OnInit } from '@angular/core';
import {Router, Navigation} from '@angular/router';
import {TokenStorageService} from '../_services/token-storage.service';
import {WebsocketService} from '../_services/websocket.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {
  reciever: any;
  messages = [];
  unreadedMessages = [];
  isTyping = false;

  message = '';
  currentUser: any;
  rooms = [];
  activeRoom;

  constructor(private router: Router, private tokenStorage: TokenStorageService, private ws: WebsocketService) {
    const nav: Navigation = this.router.getCurrentNavigation();
    if (nav.extras) {
      this.reciever = nav.extras.state.receiver;
      console.log(this.reciever);
      this.createChat({receiver: this.reciever._id});
      this.ws.newMessageReceived().on('new message', data => {
      if (this.activeRoom._id === data.room) {
        this.messages.push(data);
      }
      this.rooms.forEach(d => {
        if (d._id === data.room) {
          d.updatedAt = data.updatedAt;
        }
      });
      if (
        data.receiver._id === this.currentUser.id &&
        this.activeRoom._id === data.room
      ) {

        this.ws.readMsg([data._id]);

      }
        this.isTyping = false;
        setTimeout(() => {
        this.scrollDown();
        }, 50);
    });

      this.ws.newChatReceived().subscribe(data => {
        this.activeRoom = data;
        this.chatOpen(this.activeRoom._id);
      });
      this.isTyping = false;
      this.ws.receivedTyping().subscribe(bool => {
                      if (bool.roomid === this.activeRoom._id) {
                        this.isTyping = bool.isTyping;
                      }

      });
    }
  }

  ngOnInit(): void {
  }

  createChat(room): void {
    this.currentUser = this.tokenStorage.getUser();
    this.ws.joinRoom({
      sender: this.currentUser.id,
      receiver: room.receiver,
    });
  }

  typing(): void {
    this.activeRoom.participants.forEach(d => {
      console.log(d);
      if (this.currentUser.id !== d._id) {
        this.ws.typing({room: d.socketId, roomid: this.activeRoom._id});
      }
    });
  }

  sendMessage(): void {
    if (this.message.trim() !== '') {
      const q = {
        room: this.activeRoom._id,
        message: this.message,
        sender: this.currentUser.id,
        receiver:
          this.activeRoom.participants[0]._id === this.currentUser.id
            ? this.activeRoom.participants[1]._id
            : this.activeRoom.participants[0]._id
      };
      console.log('q', q);
      this.ws.sendMessage(q);
      this.message = '';
      setTimeout(() => {
        this.scrollDown();
        this.isTyping = false;
      }, 50);
    }
  }

  scrollDown(): void {
    const scroll = document.getElementById('scroll');
    scroll.scrollTop = scroll.scrollHeight;
  }

  chatOpen(roomId): void {
    this.ws.getMessagesByRoom(roomId).subscribe(data => {
      this.messages = data;
    });

  }
}
