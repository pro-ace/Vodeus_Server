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
import { AnswersEntity } from "./answers.entity";
import { LikesEntity } from "./llikes.entity";
import { NotificationsEntity } from "./notification.entity";
import { ConfigService } from "nestjs-config";
import { ReportsEntity } from "./reports.entity";
import { ReactionsEntity } from "./reaction.entity";
import { TagsEntity } from "./tag.entity";
import { MessagesEntity } from "./message.entity";

@Entity({ name: "records" })
export class RecordsEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ nullable: true, default:'' })
  title: string;

  @Column({ nullable: true })
  emoji: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  text: string;

  @Column({ nullable: true })
  category: string;

  @Column({ nullable: true, default: 0 })
  duration: string;

  @Column({ type: "boolean", default: false })
  privacy: boolean;

  @Column({ type: "boolean", default: false })
  notSafe: boolean;

  @Column({ type: "boolean", default: false })
  temporary: boolean;

  @Column({ nullable: true , default: 0})
  likesCount: number

  @Column({ nullable: true , default: 0})
  listenCount: number

  @Column({ nullable: true , default: 0})
  shareCount: number

  @Column({ nullable: true , default: 0})
  reactionsCount: number

  @Column({ nullable: true })
  colorType: number

  @CreateDateColumn({
    type: "timestamp without time zone",
    name: "createdAt"
  })
  createdAt: Date;

  @JoinColumn()
  @OneToOne(type => PublicFileEntity, file => file.record) //todo remove from bucket
  file: PublicFileEntity;

  @JoinColumn()
  @OneToOne(type => PublicFileEntity, imgFile => imgFile.recordImg)
  imgFile: PublicFileEntity;

  @ManyToOne(type => UsersEntity, user => user.records, { onDelete: "CASCADE", cascade: true })
  user: UsersEntity;

  @OneToMany(type => AnswersEntity, answers => answers.record)
  answers: AnswersEntity[];

  @OneToMany(type => LikesEntity, likes => likes.record)
  likes: LikesEntity[];

  @OneToMany(type => TagsEntity, tags => tags.record)
  tags: TagsEntity[];

  @OneToMany(type => MessagesEntity, messages => messages.record)
  messages: MessagesEntity[];

  @OneToMany(type => ReactionsEntity, reactions => reactions.record)
  reactions: ReactionsEntity[];

  @OneToMany(type => NotificationsEntity, notifications => notifications.record)
  notifications: NotificationsEntity[];

  @OneToMany(type => ReportsEntity, reports => reports.record)
  reports: ReportsEntity[];
}
