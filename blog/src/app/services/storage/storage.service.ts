import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import {JwtPayload, jwtDecode} from "jwt-decode";


@Injectable({
  providedIn: 'root'
})
export class StorageService {

  private isBrowser : boolean;

  constructor(
    @Inject(PLATFORM_ID)
    private platformId: object
  ) { 
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  saveToken(key: string, value: string){
    if(this.isBrowser){
      localStorage.setItem(key, value);
    }
  }

  getItem(key: string){
    if(this.isBrowser){
      return localStorage.getItem(key);
    }
    return null;
  }

  removeItem(key: string){
    if(this.isBrowser){
      localStorage.removeItem(key);
    }
  }

  isValidToken(){
    const token = this.getItem('access');
    if(!token){
      return false;
    }
    const decodeToken = jwtDecode<JwtPayload>(token);
    if(decodeToken && decodeToken?.exp){
      const tokenDate = new Date(0);
      tokenDate.setUTCSeconds(decodeToken.exp);
      const today = new Date();
      return tokenDate.getTime() > today.getTime();      
    }
    return false;
  }
}

