import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { NotificationsEntity } from "../entities/notification.entity";
import { Repository } from "typeorm";
import { paginationHelper } from "../lib/helpers";
import { NotificationTypeEnum } from "../lib/enum";
import { UsersEntity } from "src/entities/users.entity";
import { RecordsEntity } from "src/entities/records.entity";
import { AnswersEntity } from "src/entities/answers.entity";
import { FriendsEntity } from "src/entities/friends.entity";
import { getConnection } from "typeorm";
import { UnreadNotificationResponse } from "./dto/notificationresponse.dto";
import { type } from "os";

@Injectable()
export class NotificationsService {
  constructor(@InjectRepository(NotificationsEntity) private notificationRepository: Repository<NotificationsEntity>) {
  }

  getNotificationsByUser(skip, take, order, type, user): Promise<NotificationsEntity[]> {
    // const paginate = paginationHelper(page, limit);
    const queryBuilder = this.notificationRepository
      .createQueryBuilder('notifications')

    queryBuilder.leftJoin('notifications.fromUser', 'fromUser')
      .leftJoin("fromUser.avatar", "avatar")
      .leftJoin('notifications.record', 'records')
      .leftJoin('notifications.answer', 'answers')
      .leftJoin('notifications.friend', 'friends')
      .leftJoin('notifications.towardFriend', 'towardFriend')
      .select([
        'notifications.id',
        'notifications.type',
        'notifications.seen',
        'notifications.createdAt',
        'records.id',
        'records.emoji',
        'records.title',
        'records.createdAt',
        'answers.id',
        'fromUser.id',
        'fromUser.name',
        'fromUser.premium',
        'friends.id',
        'friends.status',
        'towardFriend.id',
        'towardFriend.status',
        'fromUser.avatarNumber',
        "fromUser.phoneNumber",
        'avatar.url'
        // 'fromUser.pseudo'
      ]);
    // .limit(paginate.getLimit)
    // .offset(paginate.offset)
    queryBuilder.where({ toUser: user.id });

    if (type != NotificationTypeEnum.FRIEND_REQUEST) {
      queryBuilder.andWhere("notifications.type <> :notitype", { notitype: NotificationTypeEnum.FRIEND_REQUEST });
    }
    else {
      queryBuilder.andWhere({ type: NotificationTypeEnum.FRIEND_REQUEST });
    }

    const notifications = queryBuilder
      .orderBy('notifications.createdAt', order)
      .skip(skip)
      .take(take)
      .getMany()
    return notifications;
  }

  async seenNotification(user, id = "") {
    const findNotification = await this.notificationRepository
      .createQueryBuilder("notifications")
      .select([
        'notifications',
      ])
      .where({
        id,
        toUser: user.id
      })
      .getOne();
    if (!findNotification) {
      throw new NotFoundException()
    }
    if (findNotification.seen) {
      throw new BadRequestException('already seen')
    }
    findNotification.seen = true;
    return this.notificationRepository.save(findNotification)
  }

  async deleteNotification(user, id = "") {
    const findNotification = await this.notificationRepository
      .createQueryBuilder("notifications")
      .select([
        'notifications',
      ])
      .where({
        id,
        toUser: user.id
      })
      .getOne();
    if (!findNotification) {
      throw new NotFoundException()
    }
    return this.notificationRepository.remove(findNotification)
  }

  async markAllAsRead(user, type) {
    const queryBuilder = await this.notificationRepository
      .createQueryBuilder().update("notification").set({ seen: true }).where({ toUser: user.id })

    if (type != NotificationTypeEnum.FRIEND_REQUEST) {
      queryBuilder.andWhere("notification.type <> :notitype", { notitype: NotificationTypeEnum.FRIEND_REQUEST });
    }
    else {
      queryBuilder.andWhere({ type: NotificationTypeEnum.FRIEND_REQUEST });
    }

    return queryBuilder.execute();
  }

  async sendNotification(sender: UsersEntity, receiver: UsersEntity, record: RecordsEntity, answer: AnswersEntity, friend: FriendsEntity, type: NotificationTypeEnum, towardFriend: FriendsEntity = null) {
    if (type == NotificationTypeEnum.FRIEND_REQUEST) {
      const exitNotification = await this.notificationRepository
        .createQueryBuilder('notifications')
        .where({ fromUser: sender, toUser: receiver, type: NotificationTypeEnum.FRIEND_REQUEST })
        .select([
          'notifications.id'
        ]).getOne();
      if (exitNotification)
        return null;
    }
    const notification = new NotificationsEntity();
    notification.type = type;
    notification.seen = false;
    notification.fromUser = sender;
    notification.toUser = receiver;
    notification.record = record;
    notification.answer = answer;
    notification.friend = friend;
    notification.towardFriend = towardFriend;
    return this.notificationRepository.save(notification);
  }

  async getUnreadArticleCount(user) {
    const { count } = await this.notificationRepository
      .createQueryBuilder('notifications')
      .where({ toUser: user.id, seen: false })
      .andWhere("notifications.type <> :notitype", { notitype: NotificationTypeEnum.FRIEND_REQUEST })
      .select([
        'COUNT(notifications.id)'
      ]).getRawOne();

    const UnReadCount: any = {
      count: count
    };
    return UnReadCount;
  }

  async getUnreadRequestCount(user) {
    const { count } = await this.notificationRepository
      .createQueryBuilder('notifications')
      .where({ toUser: user.id, seen: false, type: NotificationTypeEnum.FRIEND_REQUEST })
      .select([
        'COUNT(notifications.id)'
      ]).getRawOne();

    const UnReadCount: any = {
      count: count
    };
    return UnReadCount;
  }
}
