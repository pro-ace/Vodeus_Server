import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { ConfigService } from 'nestjs-config';
import { google, Auth } from 'googleapis';
import appleSignin from 'apple-signin-auth'
import { UsersEntity } from '../entities/users.entity';
import { AuthService } from '../auth/auth.service'
import AppleTokenVerificationDto from './dto/appleTokenVerification.dto';
import * as jwt from 'jsonwebtoken';
import FacebookTokenVerificationDto from './dto/facebookTokenVerification.dto';

@Injectable()
export class GoogleAuthenticationService {
  oauthClient: Auth.OAuth2Client;
  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
    private readonly authservice: AuthService
  ) {
    const clientID = this.configService.get('app.google_auth_client_id');
    const clientSecret = this.configService.get('app.google_auth_client_secret');
    this.oauthClient = new google.auth.OAuth2(
      clientID,
      clientSecret
    );
  }

  async getUserData(token: string) {
    const userInfoClient = google.oauth2('v2').userinfo;

    this.oauthClient.setCredentials({
      access_token: token
    })

    const userInfoResponse = await userInfoClient.get({
      auth: this.oauthClient
    });

    return userInfoResponse.data;
  }

  //   async getCookiesForUser(user: UsersEntity) {
  //     const accessTokenCookie = this.authservice.getCookieWithJwtAccessToken(user.id);
  //     const {
  //       cookie: refreshTokenCookie,
  //       token: refreshToken
  //     } = this.authservice.getCookieWithJwtRefreshToken(user.id);

  //     await this.authservice.setCurrentRefreshToken(refreshToken, user.id);

  //     return {
  //       accessTokenCookie,
  //       refreshTokenCookie
  //     }
  //   }

  async handleRegisteredUser(user: UsersEntity) {
    if (!user.isRegisteredWithGoogle) {
      throw new UnauthorizedException();
    }

    const response = await this.authservice.login("", user);
    return response;
  }

  async registerUser(token: string, email: string) {
    // const userData = await this.getUserData(token);
    // const name = userData.name;
    const user = await this.authservice.registerWithGoogle(email);

    return user;
  }

  async authenticate(token: string) {
    const tokenInfo = await this.oauthClient.getTokenInfo(token);
    const email = tokenInfo.email;
    if (!tokenInfo.email_verified) {
      throw new BadRequestException("Email is Not Verified");
    }

    const user = await this.usersService.findOneByEmail(email);
    if (user) {
      return {
        user,
        isRegister: false
      };
    }
    else {
      return {
        user: await this.registerUser(token, email),
        isRegister: true
      }
    }
  }

  async appleAuthenticate(info: AppleTokenVerificationDto) {
    const appleInfo = jwt.decode(info.identityToken+'');
    const sub = appleInfo.sub+'';
    const user = await this.usersService.findOneByEmail(sub);
    if (user) {
      return {
        user,
        isRegister: false
      }
    }
    else {
      return {
        user: await this.registerUser(info.identityToken, sub),
        isRegister: true
      }
    }
  }

  async facebookAuthenticate(info: FacebookTokenVerificationDto) {
    const sub = info.facebookId+'';
    const user = await this.usersService.findOneByEmail(sub);
    if (user) {
      return {
        user,
        isRegister: false
      }
    }
    else {
      return {
        user: await this.registerUser('', sub),
        isRegister: true
      }
    }
  }
}