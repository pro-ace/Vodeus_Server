import {
  AfterLoad,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn
} from "typeorm";
import { PublicFileEntity } from "./public-file.entity";
import { UsersEntity } from "./users.entity";
import { RecordsEntity } from "./records.entity";
import { LikesEntity } from "./llikes.entity";
import { NotificationsEntity } from "./notification.entity";
import { ConfigService } from "nestjs-config";
import { ReportsEntity } from "./reports.entity";
import { ReplyAnswersEntity } from "./reply-answer.entity";
import { TagsEntity } from "./tag.entity";

export enum AnswerTypeEnum {
  VOICE = "voice",
  EMOJI = "emoji",
  GIF = "gif",
  BIO = "bio"
}

@Entity({ name: "answers" })
export class AnswersEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "enum", enum: AnswerTypeEnum, default: AnswerTypeEnum.VOICE })
  type: AnswerTypeEnum;

  @Column({ nullable: true })
  duration: string;

  @Column({ nullable: true, default: 0 })
  likesCount: number;

  @Column({ nullable: true , default: 0})
  listenCount: number

  @Column({ nullable: true , default: 0})
  shareCount: number

  @Column({ nullable: true })
  emoji: string;

  @Column({ nullable: true })
  gifLink: string;

  @Column({ nullable: true })
  bio: string;

  @CreateDateColumn({
    type: "timestamp without time zone",
    name: "createdAt"
  })
  createdAt: Date;

  @JoinColumn()
  @OneToOne(type => PublicFileEntity, file => file.answer) //todo remove from bucket
  file: PublicFileEntity;

  @ManyToOne(type => UsersEntity, user => user.answers, { onDelete: "CASCADE", cascade: true })
  user: UsersEntity;

  @ManyToOne(type => RecordsEntity, record => record.answers, { onDelete: "CASCADE", cascade: true }) //todo remove with record?
  record: RecordsEntity;

  @OneToMany(type => LikesEntity, likes => likes.answer) //todo remove with record?
  likes: LikesEntity[];

  @OneToMany(type => TagsEntity, tags => tags.answer) 
  tags: TagsEntity[];

  @OneToMany(type => ReplyAnswersEntity, replyAnswers => replyAnswers.answer) //todo remove with record?
  replyAnswers: ReplyAnswersEntity[];

  // @OneToMany(type => ReactionsEntity, reactions => reactions.answer) //todo remove with record?
  // reactions: ReactionsEntity[];

  @OneToMany(type => NotificationsEntity, notifications => notifications.answer)
  notifications: NotificationsEntity[];

  @OneToMany(type => ReportsEntity, reports => reports.answer)
  reports: ReportsEntity[];
}
