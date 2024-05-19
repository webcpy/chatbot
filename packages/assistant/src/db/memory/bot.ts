import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class BotConfig {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ nullable: true })
	puppetType: string;

	@Column({ default: 'all' })
	botScope: string;

	@Column({ default: false })
	parseMini: boolean;

	@Column({ nullable: true })
	openaiSystemMessage: string;

	@Column({ default: false })
	showQuestion: boolean;

	
	@Column({ default: false})
	tts: Boolean;
  
	@Column({ default: false})
	openWhisper: Boolean;
	
	@Column({ nullable: true })
	voice: string;
	
	@Column({ default: 60 })
	openaiTimeout: number;

	@Column({ nullable: true })
	openaiAccessToken: string;

	@Column({ default: true })
	openaiDebug: boolean;

	@Column({ nullable: true })
	openaiModel: string;

	@Column({ nullable: true })
	dify_token: string;

	@Column({ nullable: true })
	dify_baseUrl: string;

	@Column({ nullable: true })
	proxyUrl: string;

	@Column({ nullable: true })
	proxyPassUrl: string;

	@Column({ default: 1 })
	chatFilter: number;

	@Column({ default: 1 })
	filterType: number;

	@Column({ nullable: true })
	filterAppid: string;

	@Column({ nullable: true })
	filterApiKey: string;

	@Column({ nullable: true })
	filterSecretKey: string;

	@Column({ type: 'simple-json' })
	countDownTaskSchedule: string[];

	@Column({ type: 'simple-json', nullable: true })
	parseMiniRooms: string[];

	@Column({ nullable: true })
	preventLength: number;

	@Column({ nullable: true })
	preventWords: string;

	// 这里省略了一些字段，请根据实际情况补充

	@Column({ default: true })
	autoAcceptFriend: boolean;

	@Column({ default: false })
	autoReply: boolean;

	@Column({ default: 0 })
	defaultBot: number;

	@Column({ type: 'simple-json', nullable: true })
	customBot: Record<string, any> | null;

	@Column({ default: 1 })
	roomAt: number;

	@Column({ default: 0 })
	friendNoReplyInRoom: number;

	@Column({ nullable: true })
	userId: string;

	@Column({ nullable: true })
	defaultReply: string;

	@Column({ type: 'simple-json', nullable: true })
	newFriendReplys: NewFriendReply[];

	@Column({ nullable: true })
	tuLingKey: string;

	@Column({ nullable: true })
	txApiKey: string;

	@Column({ nullable: true })
	tencentSecretId: string;

	@Column({ nullable: true })
	tencentSecretKey: string;

	@Column({ nullable: true })
	tencentAESKey: string;

	@Column({ nullable: true })
	tencentToken: string;

	@Column({ nullable: true })
	gpttoken: string;

	@Column({ type: 'simple-json', nullable: true })
	acceptFriendKeyWords: string[];

	@Column({ type: 'simple-json', nullable: true })
	dayTaskSchedule: any[]; // 请根据实际情况定义 dayTaskSchedule 的类型

	@Column({ type: 'simple-json', nullable: true })
	roomTaskSchedule: any[]; // 请根据实际情况定义 roomTaskSchedule 的类型

	@Column({ type: 'simple-json', nullable: true })
	roomNewsSchedule: any[]; // 请根据实际情况定义 roomNewsSchedule 的类型

	@Column({ type: 'simple-json', nullable: true })
	roomJoinKeywords: string[];

	@Column({ type: 'simple-json', nullable: true })
	roomAsyncList: string[];

	@Column({ type: 'simple-json', nullable: true })
	replyKeywords: string[];

	@Column({ type: 'simple-json', nullable: true })
	privateForwards: any[]; // 请根据实际情况定义 privateForwards 的类型

	@Column({ type: 'simple-json', nullable: true })
	avatarList: Avatar[];

	@Column({ type: 'simple-json', nullable: true })
	eventKeywords: any[];

	@Column({ type: 'simple-json', nullable: true })
	callBackEvents: any[]; // 请根据实际情况定义 callBackEvents 的类型

	@Column({ type: 'simple-json', nullable: true })
	userInfo: UserInfo;

	@Column({ type: 'simple-json', nullable: true })
	customContent: any[];

	@Column({ type: 'simple-json', nullable: true })
	cloudRoom: any[]; // 请根据实际情况定义 cloudRoom 的类型
}

interface NewFriendReply {
	id: string;
	name: string;
	content: string;
	updatedAt: Date;
	type: number;
	suggestions: any[]; // 请根据实际情况定义 suggestions 的类型
	tag: string;
}

interface Avatar {
	reg: number;
	keywords: string[];
	coverImg: string;
}

interface UserInfo {
	userId: string;
	name: string;
}
