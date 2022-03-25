import { Injectable } from '@angular/core';
import {io}  from 'socket.io-client';
import { Observable } from 'rxjs/Observable';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import {TokenStorageService} from './token-storage.service';
@Injectable()
export class WebsocketService {
  private socket = io(environment.SOCKET_HOST, {
    transportOptions: {
      polling : {
        extraHeaders : {
          authorization : this.tokenStorage.getToken()
        }
      }
    }
  });

  constructor(private http: HttpClient,  private tokenStorage: TokenStorageService) {
    this.socket.on('connection', () => {
      const engine = this.socket.io.engine;
      console.log(engine.transport.name); // in most cases, prints "polling"

      engine.once('upgrade', () => {
        // called when the transport is upgraded (i.e. from HTTP long-polling to WebSocket)
        console.log(engine.transport.name); // in most cases, prints "websocket"
      });
    });
  }
  joinRoom(data) {
    this.socket.emit('createChatRoom', data);
  }
  readMsg(data) {
    this.socket.emit('read-message', data);
  }
  check() {
    this.socket.emit('check-socket', 'devtest');
  }

  sendMessage(data) {
    this.socket.emit('messages', data);
  }
  checkUnreadMsgFirsttime(data) {
    this.socket.emit('check-unread-msg-count', data);
  }
  newMessageReceived() {
    return this.socket;
  }

  typing(data) {
    this.socket.emit('typing', data);
  }

  receivedTyping() {
    const observable = new Observable<{ isTyping: boolean , roomid: string}>(observer =>  {
      this.socket.on('typing', data => {
        observer.next(data);
      });
      return () => {
        this.socket.disconnect();
      };
    });
    return observable;
  }

  newChatReceived() {
    const observable = new Observable<{ newChat: Object }>(observer => {
      this.socket.on('chat-created', data => {
        observer.next(data);
      });
      return () => {
        this.socket.disconnect();
      };
    });
    return observable;
  }

  updateChatRooms(body) {
    return this.http.post<any>(
      `${environment.API_URL}/chats/updateChatRooms`,
      body
    );
  }
  getChatRooms() {
    return this.http.get<any>(`${environment.API_URL}/chats/rooms`);
  }
  getMessagesByRoom(room) {
    return this.http.get<any>(`${environment.API_URL}/chats/${room}`);
  }
}
