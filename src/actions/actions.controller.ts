import {
  Body,
  Controller, Delete, Get,
  HttpStatus, Logger,
  Param,
  Post,
  Put,
  Query,
  Req,
  Res,
  UploadedFile,
  UploadedFiles,
  UseInterceptors
} from "@nestjs/common";
import { ActionsService } from "./actions.service";
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiParam,
  ApiTags,
  ApiQuery,
  ApiResponse
} from "@nestjs/swagger";
import { FileFieldsInterceptor, FileInterceptor } from "@nestjs/platform-express";
import { FileDto } from "../users/dto/file.dto";
import { LikesRequestDto, LikesRequestDtoAnswer } from "./dto/likes.request.dto";
import { ReportRequestDto } from "./dto/report.request";
import { TagFriendsDto } from "src/users/dto/tagFriends.dto";
import { MessageIds } from "./dto/message.ids";
import { RecordDataDto } from "src/records/dto/record.profile";
import { RecordDto } from "src/records/dto/record.dto";
import { RecordImgDto } from "./dto/recordImg.dto";

@Controller("actions")
@ApiBearerAuth()
@ApiTags("actions")
export class ActionsController {
  private readonly logger = new Logger(ActionsController.name);

  constructor(private actionsService: ActionsService) {
  }

  @Post("addRecord")
  @ApiQuery({ name: 'isPast', required: true, type: Boolean, description: 'is past record' })
  @ApiConsumes("multipart/form-data")
  @ApiResponse({ status: HttpStatus.CREATED, description: "The file has been uploaded" })
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'file', maxCount: 1 },
    { name: 'imageFile', maxCount: 1 }
  ]))
  async addRecord(
    @Req() request,
    @Query('isPast') isPast: boolean,
    @UploadedFiles() files,
    @Body() body: RecordDto
  ) {
    const user = request.user;
    return this.actionsService.addRecord(body, user, files.file, files.imageFile, isPast);
  }

  @Post("addText")
  @ApiConsumes("multipart/form-data")
  @ApiResponse({ status: HttpStatus.CREATED, description: "The file has been uploaded" })
  @UseInterceptors(FileInterceptor("file"))
  async addText(
    @Req() request,
    @UploadedFile() file,
    @Body() body: RecordDto
  ) {
    const user = request.user;
    return this.actionsService.addRecordText(body, user, file);
  }

  @Post("recordImage")
  @ApiConsumes("multipart/form-data")
  @ApiResponse({ status: HttpStatus.CREATED, description: "The file has been uploaded" })
  @UseInterceptors(FileInterceptor("file"))
  async addRecordImage(
    @Req() request,
    @UploadedFile() file,
    @Body() body: RecordImgDto
  ) {
    const user = request.user;
    return this.actionsService.addRecordImage(body, file.buffer, file.originalname);
  }

  @Post("answer")
  @ApiConsumes("multipart/form-data")
  @ApiCreatedResponse({ status: HttpStatus.CREATED, description: "The file has been uploaded" })
  @ApiNotFoundResponse({ status: HttpStatus.NOT_FOUND, description: "record not found" })
  @ApiBadRequestResponse({ status: HttpStatus.BAD_REQUEST, description: "you already answered" })
  @UseInterceptors(FileInterceptor("file"))
  async answer(
    @Req() req,
    @Res() res,
    // @Query("record") record: string,
    @UploadedFile() file,
    @Body() body: FileDto
  ) {
    const user = req.user;
    return this.actionsService.answerToRecord(user, body.record, body.duration, body.emoji, file.buffer, file.originalname)
      .then((data) => res.json(data))
      .catch(err => !err.status ? this.logger.error(err) : res.status(err.status).send(err.response));
  }

  @Put("answerBio")
  @ApiQuery({ name: 'id', required: true, type: String, description: 'id of record' })
  @ApiQuery({ name: 'receiverId', required: true, type: String, description: 'id of receiver' })
  @ApiQuery({ name: 'isCommented', required: true, type: String, description: 'is commented' })
  @ApiCreatedResponse({ status: HttpStatus.CREATED, description: "The file has been uploaded" })
  async answerBio(
    @Req() req,
    @Body() body: RecordDataDto,
    @Query('id') id: string,
    @Query('receiverId') receiverId: string,
    @Query('isCommented') isCommented: string,
  ) {
    const user = req.user;
    return this.actionsService.answerBio(user, id, receiverId, body.bio, isCommented);
  }

  @Put("replyAnswerBio")
  @ApiQuery({ name: 'id', required: true, type: String, description: 'id of record' })
  @ApiQuery({ name: 'receiverId', required: true, type: String, description: 'id of receiver' })
  @ApiCreatedResponse({ status: HttpStatus.CREATED, description: "The file has been uploaded" })
  async replyAnswerBio(
    @Req() req,
    @Body() body: RecordDataDto,
    @Query('id') id: string,
    @Query('receiverId') receiverId: string,
  ) {
    const user = req.user;
    return this.actionsService.replyAnswerBio(user, id, receiverId, body.bio);
  }

  @Put("replyAnswerGif")
  @ApiQuery({ name: 'id', required: true, type: String, description: 'id of record' })
  @ApiQuery({ name: 'receiverId', required: true, type: String, description: 'id of receiver' })
  @ApiCreatedResponse({ status: HttpStatus.CREATED, description: "The file has been uploaded" })
  async replyAnswerGif(
    @Req() req,
    @Body() body: RecordDataDto,
    @Query('id') id: string,
    @Query('receiverId') receiverId: string,
  ) {
    const user = req.user;
    return this.actionsService.replyAnswerGif(user, id, receiverId, body.link);
  }

  @Put("answerEmoji")
  @ApiQuery({ name: 'id', required: true, type: String, description: 'id of record' })
  @ApiCreatedResponse({ status: HttpStatus.CREATED, description: "The file has been uploaded" })
  async answerEmoji(
    @Req() req,
    @Body() body: RecordDataDto,
    @Query('id') id: string,
  ) {
    const user = req.user;
    return this.actionsService.answerEmoji(user, id, body.emoji);
  }

  @Put("answerGif")
  @ApiQuery({ name: 'id', required: true, type: String, description: 'id of record' })
  @ApiQuery({ name: 'receiverId', required: true, type: String, description: 'id of receiver' })
  @ApiCreatedResponse({ status: HttpStatus.CREATED, description: "The file has been uploaded" })
  async answerGif(
    @Req() req,
    @Body() body: RecordDataDto,
    @Query('id') id: string,
    @Query('receiverId') receiverId: string,
  ) {
    const user = req.user;
    return this.actionsService.answerGif(user, id, receiverId, body.link);
  }

  @Post("tagFriends")
  @ApiCreatedResponse({ status: HttpStatus.CREATED, description: "" })
  async tagFriends(
    @Res() res,
    @Req() req,
    @Body() body: TagFriendsDto
  ) {
    const user = req.user;
    return this.actionsService.tagFriends(user, body.storyType, body.tagUserIds, body.recordId)
      .then((data) => res.json(data))
      .catch(err => !err.status ? this.logger.error(err) : res.status(err.status).send(err.response));
  }

  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: "Responses" })
  @ApiQuery({ name: 'id', required: true, type: String, description: 'id of record' })
  @Delete("deleteTag")
  deleteTag(
    @Req() req,
    @Res() res,
    @Query('id') id: string,
  ) {
    const user = req.user;
    return this.actionsService.deleteTag(user, id)
      .then((data) => res.json(data))
      .catch(err => !err.status ? this.logger.error(err) : res.status(err.status).send(err.response));
  }

  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: "Responses" })
  @ApiQuery({ name: 'id', required: true, type: String, description: 'id of record' })
  @Delete("deleteChat")
  deleteChat(
    @Req() req,
    @Res() res,
    @Query('id') id: string,
  ) {
    const user = req.user;
    return this.actionsService.deleteChat(user, id)
      .then((data) => res.json(data))
      .catch(err => !err.status ? this.logger.error(err) : res.status(err.status).send(err.response));
  }

  @Post("deleteMessages")
  @ApiCreatedResponse({ status: HttpStatus.CREATED, description: "" })
  async deleteMessages(
    @Res() res,
    @Req() req,
    @Body() body: MessageIds
  ) {
    return this.actionsService.deleteMessages(body.messageIds)
      .then((data) => res.json(data))
      .catch(err => !err.status ? this.logger.error(err) : res.status(err.status).send(err.response));
  }



  @ApiResponse({ status: HttpStatus.OK })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: "Responses" })
  @ApiQuery({ name: 'storyId', type: String })
  @ApiQuery({ name: 'storyType', type: String })
  @Get("getTags")
  getTagsByStory(
    @Req() req,
    @Res() res,
    @Query('storyId') storyId: string,
    @Query('storyType') storyType: string,
  ) {
    const user = req.user;
    return this.actionsService.getTags(user, storyId, storyType)
      .then((data) => res.json(data))
      .catch(err => !err.status ? this.logger.error(err) : res.status(err.status).send(err.response));
  }

  @ApiResponse({ status: HttpStatus.OK })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: "Responses" })
  @ApiQuery({ name: 'tagId', type: String })
  @Get("getTagUsers")
  getTagUsers(
    @Req() req,
    @Res() res,
    @Query('tagId') tagId: string,
  ) {
    const user = req.user;
    return this.actionsService.getTagUsers(user, tagId)
      .then((data) => res.json(data))
      .catch(err => !err.status ? this.logger.error(err) : res.status(err.status).send(err.response));
  }

  @ApiResponse({ status: HttpStatus.OK })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: "Responses" })
  @Get("getActiveUsers")
  getActiveUsers(
    @Req() req,
    @Res() res,
  ) {
    const user = req.user;
    return this.actionsService.getActiveUsers()
      .then((data) => res.json(data))
      .catch(err => !err.status ? this.logger.error(err) : res.status(err.status).send(err.response));
  }

  @ApiResponse({ status: HttpStatus.OK })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: "Responses" })
  @ApiQuery({ name: 'toUserId', type: String })
  @ApiQuery({ name: 'skip', type: String })
  @Get("getMessages")
  getMessages(
    @Req() req,
    @Res() res,
    @Query('toUserId') toUserId: string,
    @Query('skip') skip: string,
  ) {
    const user = req.user;
    return this.actionsService.getMessages(user, toUserId, skip)
      .then((data) => res.json(data))
      .catch(err => !err.status ? this.logger.error(err) : res.status(err.status).send(err.response));
  }

  @ApiResponse({ status: HttpStatus.OK })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: "Responses" })
  @ApiQuery({ name: 'toUserId', type: String })
  @Get("confirmMessage")
  confirmMessage(
    @Req() req,
    @Res() res,
    @Query('toUserId') toUserId: string,
  ) {
    const user = req.user;
    return this.actionsService.confirmMessage(user, toUserId)
      .then((data) => res.json(data))
      .catch(err => !err.status ? this.logger.error(err) : res.status(err.status).send(err.response));
  }

  @ApiResponse({ status: HttpStatus.OK })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: "Responses" })
  @Get("getConversations")
  getConversations(
    @Req() req,
    @Res() res,
  ) {
    const user = req.user;
    return this.actionsService.getConversations(user)
      .then((data) => res.json(data))
      .catch(err => !err.status ? this.logger.error(err) : res.status(err.status).send(err.response));
  }

  @Post("answerReply")
  @ApiQuery({ name: 'receiverId', required: true, type: Boolean, description: 'id of receiver' })
  @ApiConsumes("multipart/form-data")
  @ApiCreatedResponse({ status: HttpStatus.CREATED, description: "The file has been uploaded" })
  @ApiNotFoundResponse({ status: HttpStatus.NOT_FOUND, description: "answer not found" })
  @ApiBadRequestResponse({ status: HttpStatus.BAD_REQUEST, description: "you already replied" })
  @UseInterceptors(FileInterceptor("file"))
  async answerReply(
    @Req() req,
    @Res() res,
    @Query('receiverId') receiverId: string,
    @UploadedFile() file,
    @Body() body: any
  ) {
    const user = req.user;
    return this.actionsService.replyToAnswer(user, body.record, body.duration, file.buffer, file.originalname, receiverId)
      .then((data) => res.json(data))
      .catch(err => !err.status ? this.logger.error(err) : res.status(err.status).send(err.response));
  }

  @Post("addMessage")
  @ApiConsumes("multipart/form-data")
  @ApiCreatedResponse({ status: HttpStatus.CREATED, description: "The message has been created" })
  @ApiNotFoundResponse({ status: HttpStatus.NOT_FOUND, description: "user not found" })
  @ApiBadRequestResponse({ status: HttpStatus.BAD_REQUEST, description: "Unknown err" })
  @UseInterceptors(FileInterceptor("file"))
  async addMessage(
    @Req() req,
    @Res() res,
    @UploadedFile() file,
    @Body() body: FileDto
  ) {
    const user = req.user;
    return this.actionsService.addMessage(user, body, file)
      .then((data) => res.json(data))
      .catch(err => !err.status ? this.logger.error(err) : res.status(err.status).send(err.response));
  }

  @Post("addChatMessage")
  @ApiConsumes("multipart/form-data")
  @ApiCreatedResponse({ status: HttpStatus.CREATED, description: "The message has been created" })
  @ApiNotFoundResponse({ status: HttpStatus.NOT_FOUND, description: "user not found" })
  @ApiBadRequestResponse({ status: HttpStatus.BAD_REQUEST, description: "Unknown err" })
  @UseInterceptors(FileInterceptor("file"))
  async addChatMessage(
    @Req() req,
    @Res() res,
    @UploadedFile() file,
    @Body() body: FileDto
  ) {
    const user = req.user;
    return this.actionsService.addChatMessage(body, file)
      .then((data) => res.json(data))
      .catch(err => !err.status ? this.logger.error(err) : res.status(err.status).send(err.response));
  }

  @Post("answerappreciate")
  @ApiNotFoundResponse({ status: HttpStatus.NOT_FOUND, description: "answer not found" })
  @ApiBadRequestResponse({ status: HttpStatus.BAD_REQUEST, description: "like exist" })
  @ApiParam({ name: "id", type: String, required: true })
  @ApiParam({ name: "receiverId", type: String, required: true })
  async likeAnswer(
    @Req() req,
    @Res() res,
    @Body() body: LikesRequestDtoAnswer,
    // @Param("id") answerId: string,
  ) {
    const user = req.user;
    return this.actionsService.likeAnswer(user, body.id, body.receiverId)
      .then((data) => res.json(data))
      .catch(err => !err.status ? this.logger.error(err) : res.status(err.status).send(err.response));
  }

  @Post("recordappreciate")
  @ApiNotFoundResponse({ status: HttpStatus.NOT_FOUND, description: "record not found" })
  @ApiBadRequestResponse({ status: HttpStatus.BAD_REQUEST, description: "like exist" })
  @ApiParam({ name: "id", type: String, required: true })
  async likeRecord(
    @Req() req,
    @Res() res,
    @Body() body: LikesRequestDto,
    // @Param("id") recordId: string
  ) {
    const user = req.user;
    return this.actionsService.likeRecord(user, body.id)
      .then((data) => res.json(data))
      .catch(err => !err.status ? this.logger.error(err) : res.status(err.status).send(err.response));
  }

  @Post("recordreaction")
  @ApiNotFoundResponse({ status: HttpStatus.NOT_FOUND, description: "record not found" })
  @ApiBadRequestResponse({ status: HttpStatus.BAD_REQUEST, description: "reaction exist" })
  // @ApiParam({ name: "id", type: String, required: true })
  async recordReaction(
    @Req() req,
    @Res() res,
    @Body() body: LikesRequestDto,
    // @Param("id") recordId: string
  ) {
    const user = req.user;
    return this.actionsService.reactionRecord(user, body.id, body)
      .then((data) => res.json(data))
      .catch(err => !err.status ? this.logger.error(err) : res.status(err.status).send(err.response));
  }

  @Get("answerunlike")
  @ApiNotFoundResponse({ status: HttpStatus.NOT_FOUND, description: "answer not found" })
  @ApiBadRequestResponse({ status: HttpStatus.BAD_REQUEST, description: "like not found" })
  @ApiQuery({ name: 'id', type: String, required: true })
  async unLikeAnswer(
    @Req() req,
    @Res() res,
    @Query("id") answerId
  ) {
    const user = req.user;
    return this.actionsService.unLikeAnswer(user.id, answerId)
      .then((data) => res.json(data))
      .catch(err => !err.status ? this.logger.error(err) : res.status(err.status).send(err.response));
  }

  @Get("recordunlike")
  @ApiNotFoundResponse({ status: HttpStatus.NOT_FOUND, description: "record not found" })
  @ApiBadRequestResponse({ status: HttpStatus.BAD_REQUEST, description: "like not found" })
  @ApiQuery({ name: 'id', type: String, required: true })
  async unLikeRecord(
    @Req() req,
    @Res() res,
    @Query("id") recordId
  ) {
    const user = req.user;
    return this.actionsService.unLikeRecord(user.id, recordId)
      .then((data) => res.json(data))
      .catch(err => !err.status ? this.logger.error(err) : res.status(err.status).send(err.response));
  }

  @Get("tagLike")
  @ApiNotFoundResponse({ status: HttpStatus.NOT_FOUND, description: "tag not found" })
  @ApiBadRequestResponse({ status: HttpStatus.BAD_REQUEST, description: "tag not found" })
  @ApiQuery({ name: 'id', type: String, required: true })
  @ApiQuery({ name: 'isLike', type: String, required: true })
  async likeTag(
    @Req() req,
    @Res() res,
    @Query("id") tagId,
    @Query("isLike") isLike,
  ) {
    const user = req.user;
    return this.actionsService.likeTag(user, tagId, isLike)
      .then((data) => res.json(data))
      .catch(err => !err.status ? this.logger.error(err) : res.status(err.status).send(err.response));
  }

  @Get("createBirdRoom")
  @ApiNotFoundResponse({ status: HttpStatus.NOT_FOUND, description: "" })
  @ApiBadRequestResponse({ status: HttpStatus.BAD_REQUEST, description: "" })
  @ApiQuery({ name: 'roomId', type: String, required: true })
  async createBirdRoom(
    @Req() req,
    @Res() res,
    @Query("roomId") roomId,
  ) {
    const user = req.user;
    return this.actionsService.createBirdRoom(user, roomId)
      .then((data) => res.json(data))
      .catch(err => !err.status ? this.logger.error(err) : res.status(err.status).send(err.response));
  }

  @Get("createChatRoom")
  @ApiNotFoundResponse({ status: HttpStatus.NOT_FOUND, description: "" })
  @ApiBadRequestResponse({ status: HttpStatus.BAD_REQUEST, description: "" })
  @ApiQuery({ name: 'roomId', type: String, required: true })
  async createChatRoom(
    @Req() req,
    @Res() res,
    @Query("roomId") roomId,
  ) {
    const user = req.user;
    return this.actionsService.createChatRoom(user, roomId)
      .then((data) => res.json(data))
      .catch(err => !err.status ? this.logger.error(err) : res.status(err.status).send(err.response));
  }

  @Get("enterBirdRoom")
  @ApiNotFoundResponse({ status: HttpStatus.NOT_FOUND, description: "" })
  @ApiBadRequestResponse({ status: HttpStatus.BAD_REQUEST, description: "" })
  @ApiQuery({ name: 'roomId', type: String, required: true })
  async enterBirdRoom(
    @Req() req,
    @Res() res,
    @Query("roomId") roomId,
  ) {
    const user = req.user;
    return this.actionsService.enterBirdRoom(user, roomId)
      .then((data) => res.json(data))
      .catch(err => !err.status ? this.logger.error(err) : res.status(err.status).send(err.response));
  }

  @Get("replyAnswerLike")
  @ApiNotFoundResponse({ status: HttpStatus.NOT_FOUND, description: "answer not found" })
  @ApiBadRequestResponse({ status: HttpStatus.BAD_REQUEST, description: "like not found" })
  @ApiQuery({ name: 'id', type: String, required: true })
  async likeReplyAnswer(
    @Req() req,
    @Res() res,
    @Query("id") replyAnswerId
  ) {
    const user = req.user;
    return this.actionsService.likeReplyAnswer(user.id, replyAnswerId)
      .then((data) => res.json(data))
      .catch(err => !err.status ? this.logger.error(err) : res.status(err.status).send(err.response));
  }

  @Get("replyAnswerUnlike")
  @ApiNotFoundResponse({ status: HttpStatus.NOT_FOUND, description: "answer not found" })
  @ApiBadRequestResponse({ status: HttpStatus.BAD_REQUEST, description: "like not found" })
  @ApiQuery({ name: 'id', type: String, required: true })
  async unLikeReplyAnswer(
    @Req() req,
    @Res() res,
    @Query("id") replyAnswerId
  ) {
    const user = req.user;
    return this.actionsService.unLikeReplyAnswer(user.id, replyAnswerId)
      .then((data) => res.json(data))
      .catch(err => !err.status ? this.logger.error(err) : res.status(err.status).send(err.response));
  }

  @Post("follow")
  @ApiParam({ name: "userid", required: true, type: String })
  async requestFollow(
    @Req() req,
    @Res() res,
    @Query("userid") id: string
  ) {
    const user = req.user;
    return this.actionsService.followFriend(user, id)
      .then((data) => res.json(data))
      .catch(err => !err.status ? this.logger.error(err) : res.status(err.status).send(err.response));
  }

  @Post("deleteSuggest")
  @ApiParam({ name: "userId", required: true, type: String })
  async deleteSuggest(
    @Req() req,
    @Res() res,
    @Query("userId") id: string
  ) {
    const user = req.user;
    return this.actionsService.deleteSuggest(user, id)
      .then((data) => res.json(data))
      .catch(err => !err.status ? this.logger.error(err) : res.status(err.status).send(err.response));
  }

  @Post("deleteFollower")
  @ApiParam({ name: "userId", required: true, type: String })
  async deleteFollower(
    @Req() req,
    @Res() res,
    @Query("userId") id: string
  ) {
    const user = req.user;
    return this.actionsService.removeFriend(id, user.id)
      .then((data) => res.json(data))
      .catch(err => !err.status ? this.logger.error(err) : res.status(err.status).send(err.response));
  }

  @Post("deleteFollowing")
  @ApiParam({ name: "userId", required: true, type: String })
  async deleteFollowing(
    @Req() req,
    @Res() res,
    @Query("userId") id: string
  ) {
    const user = req.user;
    return this.actionsService.removeFriend(user.id, id)
      .then((data) => res.json(data))
      .catch(err => !err.status ? this.logger.error(err) : res.status(err.status).send(err.response));
  }

  @Post("inviteFriend")
  @ApiParam({ name: "phoneNumber", required: true, type: String })
  @ApiParam({ name: "forSend", required: false, type: Boolean })
  async inviteFriend(
    @Req() req,
    @Res() res,
    @Query("phoneNumber") phoneNumber: string,
    @Query("forSend") forSend: boolean
  ) {
    const user = req.user;
    return this.actionsService.inviteFriend(user, phoneNumber, forSend)
      .then((data) => res.json(data))
      .catch(err => !err.status ? this.logger.error(err) : res.status(err.status).send(err.response));
  }

  @Post("acceptfriend")
  @ApiParam({ name: "id", required: true, type: String })
  @ApiParam({ name: "requestId", required: true, type: String })
  async addFriend(
    @Req() req,
    @Res() res,
    @Query("id") id: string,
    @Query("requestId") requestId: string
  ) {
    const user = req.user;
    return this.actionsService.acceptFriend(user, id, requestId)
      .then((data) => res.json(data))
      .catch(err => !err.status ? this.logger.error(err) : res.status(err.status).send(err.response));
  }

  @Get("unfollow")
  @ApiParam({ name: "id", required: true, type: Number })
  async deleteFriend(
    @Req() req,
    @Res() res,
    @Query("id") id: string
  ) {
    const user = req.user;
    return this.actionsService.removeFriend(user.id, id)
      .then((data) => res.json(data))
      .catch(err => !err.status ? this.logger.error(err) : res.status(err.status).send(err.response));
  }

  @Post("block")
  @ApiParam({ name: "userid", required: true, type: String })
  async blockUser(
    @Req() req,
    @Res() res,
    @Query("userid") id: string
  ) {
    const user = req.user;
    return this.actionsService.blockUser(user, id)
      .then((data) => res.json(data))
      .catch(err => !err.status ? this.logger.error(err) : res.status(err.status).send(err.response));
  }

  @Get("countries")
  async getAllCountries(
    @Res() res
  ) {
    return this.actionsService.getAllCountries()
      .then((data) => res.json(data))
      .catch(err => !err.status ? console.log(err) : res.status(err.status).send(err.message));
  }

  @Get("shareLink")
  async shareLink(
    @Req() req,
    @Res() res,
  ) {
    const user = req.user;
    return this.actionsService.shareLink(user)
      .then((data) => res.json(data))
      .catch(err => !err.status ? this.logger.error(err) : res.status(err.status).send(err.response));
  }

  @Delete("record")
  @ApiParam({ name: "id", required: true, type: Number })
  async deleteRecord(
    @Req() req,
    @Res() res,
    @Query("id") id: string
  ) {
    const user = req.user;
    return this.actionsService.removeRecord(user.id, id)
      .then((data) => res.json(data))
      .catch(err => !err.status ? this.logger.error(err) : res.status(err.status).send(err.response));
  }

  @Post("report")
  @ApiNotFoundResponse({ status: HttpStatus.NOT_FOUND })
  async createReport(
    @Req() req,
    @Res() res,
    @Body() body: ReportRequestDto,
  ) {
    const user = req.user;
    return this.actionsService.createReport(user, body.type, body.target, body.record, body.answer)
      .then((data) => res.json(data))
      .catch(err => !err.status ? this.logger.error(err) : res.status(err.status).send(err.response));
  }
}
