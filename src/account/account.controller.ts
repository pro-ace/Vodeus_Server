import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Logger,
  Post,
  Put,
  Req,
  Res,
  UploadedFile,
  UseInterceptors,
  Query,
  Delete
} from "@nestjs/common";
import { AccountService } from "./account.service";
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiCreatedResponse,
  ApiOperation,
  ApiQuery,
  ApiTags, ApiUnauthorizedResponse, ApiParam, ApiResponse
} from "@nestjs/swagger";
import { CompleteRegisterDto } from "./dto/complete-register.dto";
import { FileInterceptor } from "@nestjs/platform-express";
import { AvatarDto } from "./dto/avatar.dto";
import { AccountMeResponse } from "./dto/account-me.response";
import { UsersResponse } from "../users/dto/users.response";
import { FileResponse } from "../files/dto/file.response";
import { EmailVerify } from "./dto/emailverify.dto";

@Controller("account")
@ApiBearerAuth()
@ApiTags("account")
export class AccountController {
  private readonly logger = new Logger(AccountController.name);

  constructor(private accountService: AccountService) {
  }

  @ApiQuery({ name: 'checkDevice', type: String })
  @ApiQuery({ name: 'deviceToken', type: String })
  @ApiQuery({ name: 'deviceOs', type: String })
  @ApiQuery({ name: 'fcmToken', type: String })
  @Get("me")
  @ApiCreatedResponse({
    status: HttpStatus.CREATED,
    type: AccountMeResponse,
    description: "The file has been uploaded"
  })
  @ApiUnauthorizedResponse()
  async getAccountInfo(
    @Req() req,
    @Res() res,
    @Query('checkDevice') checkDevice: string,
    @Query('deviceToken') deviceToken: string,
    @Query('deviceOs') deviceOs: string,
    @Query('fcmToken') fcmToken: string,
  ) {
    const user = req.user;
    return this.accountService.getAccountData(user, checkDevice, deviceToken, deviceOs, fcmToken)
      .then((data) => res.json(data))
      .catch(err => !err.status ? this.logger.error(err) : res.status(err.status).send(err.response));
  }

  @Get("newDay")
  @ApiCreatedResponse({
    status: HttpStatus.CREATED,
    type: AccountMeResponse,
    description: "The file has been uploaded"
  })
  @ApiUnauthorizedResponse()
  async checkNewDay(
    @Req() req,
    @Res() res,
  ) {
    const user = req.user;
    return this.accountService.checkNewDay(user)
      .then((data) => res.json(data))
      .catch(err => !err.status ? this.logger.error(err) : res.status(err.status).send(err.response));
  }

  @Get("resendcode")
  @ApiCreatedResponse({
    status: HttpStatus.CREATED,
    type: AccountMeResponse,
    description: "The file has been uploaded"
  })
  @ApiUnauthorizedResponse()
  async resendCode(
    @Req() req,
    @Res() res
  ) {
    const user = req.user;
    return this.accountService.resendCode(user)
      .then((data) => res.json(data))
      .catch(err => !err.status ? this.logger.error(err) : res.status(err.status).send(err.response));
  }

  @Put("completeregister")
  @ApiCreatedResponse({ status: HttpStatus.CREATED, type: UsersResponse, description: "The file has been uploaded" })
  @ApiUnauthorizedResponse()
  async completeRegister(
    @Req() req,
    @Res() res,
    @Body() body: CompleteRegisterDto
  ) {
    const user = req.user;
    return this.accountService.updateProfile(user, body)
      .then((data) => res.json(data))
      .catch(err => !err.status ? this.logger.error(err) : res.status(err.status).send(err.response));
  }

  @Put("lastSee")
  @ApiCreatedResponse({ status: HttpStatus.CREATED, type: UsersResponse, description: "The file has been uploaded" })
  @ApiUnauthorizedResponse()
  async updateLastSee(
    @Req() req,
    @Res() res,
  ) {
    const user = req.user;
    return this.accountService.updateLastSee(user)
      .then((data) => res.json(data))
      .catch(err => !err.status ? this.logger.error(err) : res.status(err.status).send(err.response));
  }

  @Post("changepremium")
  @ApiCreatedResponse({ status: HttpStatus.CREATED, type: UsersResponse, description: "Premium State Changed Correctly" })
  @ApiParam({ name: "premium_state", type: String, required: true })
  async changePremium(
    @Req() req,
    @Res() res,
    @Query("premium_state") premium_state: string,
  ) {
    const user = req.user;
    return this.accountService.changePremium(user, premium_state)
      .then((data) => res.json(data))
      .catch(err => !err.status ? this.logger.error(err) : res.status(err.status).send(err.response));
  }

  @Post("changeLanguage")
  @ApiCreatedResponse({ status: HttpStatus.CREATED, type: UsersResponse, description: "Premium State Changed Correctly" })
  @ApiParam({ name: "language", type: String, required: true })
  async changeLanguage(
    @Req() req,
    @Res() res,
    @Query("language") language: string,
  ) {
    const user = req.user;
    return this.accountService.changeLanguage(user, language)
      .then((data) => res.json(data))
      .catch(err => !err.status ? this.logger.error(err) : res.status(err.status).send(err.response));
  }

  @Post("changeStoryLanguage")
  @ApiCreatedResponse({ status: HttpStatus.CREATED, type: UsersResponse, description: "Premium State Changed Correctly" })
  @ApiParam({ name: "language", type: String, required: true })
  async changeStoryLanguage(
    @Req() req,
    @Res() res,
    @Query("language") language: string,
  ) {
    const user = req.user;
    return this.accountService.changeStoryLanguage(user, language)
      .then((data) => res.json(data))
      .catch(err => !err.status ? this.logger.error(err) : res.status(err.status).send(err.response));
  }

  @Post("emailverify")
  @ApiCreatedResponse({ status: HttpStatus.CREATED, description: "" })
  @ApiUnauthorizedResponse()
  async emailVerify(
    @Res() res,
    @Req() req,
    @Body() body: EmailVerify
  ) {
    const user = req.user;
    // const isSent = await this.authService.findRecoverRecord(request.email);
    return this.accountService.emailVerify(user, body)
      .then((data) => res.json(data))
      .catch(err => !err.status ? this.logger.error(err) : res.status(err.status).send(err.response));
  }


  @Post("avatar")
  @ApiConsumes("multipart/form-data")
  @ApiCreatedResponse({ status: HttpStatus.CREATED, type: FileResponse, description: "The file has been uploaded" })
  @ApiUnauthorizedResponse()
  @ApiOperation({ description: "field name: \"file\" | max item size: 4mb | file extension: jpg|jpeg|png" })
  @UseInterceptors(FileInterceptor("file"))
  async addAvatar(
    @Req() req,
    @Res() res,
    @UploadedFile() file,
    @Body() body: AvatarDto
  ) {
    const user = req.user;
    return this.accountService.addAvatar(user.id, file?.buffer, file?.originalname, body.avatarNumber)
      .then((data) => res.json(data))
      .catch(err => !err.status ? this.logger.error(err) : res.status(err.status).send(err.response));
  }

  @Post("resetpassword")
  @ApiCreatedResponse({ status: HttpStatus.OK, type: FileResponse, description: "password changed correctly" })
  @ApiParam({ name: "oldpassword", required: true, type: String })
  @ApiParam({ name: "newpassword", required: true, type: String })
  async resetPassword(
    @Req() req,
    @Res() res,
    @Query("oldpassword") oldpassword: string,
    @Query("newpassword") newpassword: string,
  ) {
    const user = req.user;
    return this.accountService.resetpassword(user, oldpassword, newpassword)
      .then((data) => res.json(data))
      .catch(err => !err.status ? this.logger.error(err) : res.status(err.status).send(err.response));
  }

  @Post("changeemail")
  @ApiCreatedResponse({ status: HttpStatus.OK, description: "password changed correctly" })
  @ApiParam({ name: "password", required: true, type: String })
  @ApiParam({ name: "newemail", required: true, type: String })
  async changeEmail(
    @Req() req,
    @Res() res,
    @Query("password") password: string,
    @Query("newemail") newemail: string,
  ) {
    const user = req.user;
    return this.accountService.changeEmail(user, password, newemail)
      .then((data) => res.json(data))
      .catch(err => !err.status ? this.logger.error(err) : res.status(err.status).send(err.response));
  }

  @Post("changeemailverify")
  @ApiCreatedResponse({ status: HttpStatus.OK, description: "password changed correctly" })
  @ApiParam({ name: "pseudo", required: true, type: String })
  async changeEmailVerify(
    @Req() req,
    @Res() res,
    @Query("pseudo") pseudo: string,
  ) {
    const user = req.user;
    return this.accountService.changeEmailVerify(user, pseudo)
      .then((data) => res.json(data))
      .catch(err => !err.status ? this.logger.error(err) : res.status(err.status).send(err.response));
  }

  @Post("verifyusername")
  @ApiCreatedResponse({ status: HttpStatus.OK, description: "username is available" })
  @ApiParam({ name: "username", required: true, type: String })
  async verifyUsername(
    @Req() req,
    @Res() res,
    @Query("username") username: string,
  ) {
    const user = req.user;
    return this.accountService.usernameVerify(user, username)
      .then((data) => res.json(data))
      .catch(err => !err.status ? this.logger.error(err) : res.status(err.status).send(err.response));
  }

  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: "Responses" })
  @Delete("deleteAccount")
  async deleteAccount(
    @Req() req,
    @Res() res,
  ) {
    const user = req.user;
    return this.accountService.deleteAccount(user)
      .then((data) => res.json(data))
      .catch(err => !err.status ? this.logger.error(err) : res.status(err.status).send(err.response));
  }

}
