"use strict";
// load discordie object
//skarm
const discordie = require("discordie");
//const twitch = require('twitch-get-stream')('you're not getting this');
const fs=require("fs"), ini=require("ini");
// create the discord client obj
const client = new discordie({autoReconnect:true});
const events = discordie.Events;
// Constants

	//channels
const GENERAL="304082726019923978";

const ALGETTY ="311411150611021824";
const SUNS = "321777310057627655";
const NRTKP = "311402910820859914";
const BLACKBIRD="311409240327585802";
const OCEANPALACE="305548986155008000";

const ENHASA = "311478529797914626";
const DREAM = "328372620989038594";
const WOE="311398412610174976";
const MODCHAT="376619800329453570";
const MODLOG="344295609194250250";
	//users
const MASTER="162952008712716288";
	//Skarm channels
const dataGen = "409856900469882880";
const dataAct = "409860642942615573";
const frmKing = "409868415176802324";
const MEyTA = "409870100385103899";

	//roles 
const EARTHBOUND = "305101211072462848";
const ENLIGHTENED = "338043707485978624";

// Classes

class User {
	constructor(name, discriminator){
		this.name=name;
		this.discriminator=discriminator;
		this.swears=0;
		this.slaps=0;
		this.zeal=0;
		this.toilet=0;
		
		this.silver=0;
		
		this.actions=0;
		this.questions=0;
		this.exclamations=0;
		this.elvia=0;
		
		this.lines=0;
		this.secretWord=0;
		this.secretWordAdd=0;
		
		this.todayActions=0;
		this.todayViolence=0;
		this.todayWarnings=0;
		this.totalWarnings=0;
		
		this.todayWasWarned=false;
	}
}

// Images

var waifus=[
	"bunny.jpg",
	"cat.jpg",
	"cat2.jpg",
	"cat3.jpg",
	"chicken.jpg",
	"chipmunk.jpg",
	"dogs.png",
	"mouse.jpg",
	"squirrel.png"
];

var cats=[
	"cat1.jpg",
	"cat2.jpg",
	"cat3.jpg",
	"cat4.jpg",
	"cat5.jpg",
	"cat6.jpg",
	"cat7.jpg",
	"cat8.jpg",
	"cat9.jpg",
]

// Banned words, and stuff like that
var banned=[
]
var beaned=[
]
var violentVerbs=[
	"kicks",
	"slaps",
	"hits",
	"smacks",
	"destroys",
	"kills",
	"rapes",
	"punches",
	"whacks",
]

var hotDateResponses=[
	"1999, when Lavos burns the world.",
	"7.5 billion AD, when the Sun engulfs the Earth",
]

var lastDateResponses=[
	"10^98 AD, or whenever the heat death of the universe is currently forecasted to happen",
]

// These get cleared every once in a while
var deletionQueue=[];
var deletionQueueLong=[];

// Load up the stats
var stats=ini.parse(fs.readFileSync('stats.ini', 'utf-8'));
var statsGeneral=ini.parse(fs.readFileSync('misc.ini', 'utf-8'));
var userTable={};
var totalBotCommands=0;
var gummyCommandsLast5Minutes=0;
var totalCensoredLines=0;
var dragoniteActive=0;
var masterActive=0;
utilityCreateUserTable();
utilityLoadBotStats();

// assume the stream is online until proven otherwise, that way it doesn't keep
// notifying everyone if it crashes or restarts due to changes
var streamState=true;
var streamHasNotifiedDate=null;

// There are some things that need doing on a regular basis
var timer15 = setInterval(function(){
	twitchGetIsLive(null);
	twitchSendStatusMessage();
	censorClearDeletionQueue();
}, 15000);

// Change this to be however long it needs to for the knuckleheads to stop spamming the bot
var timer30=setInterval(function(){
    botCanSpeak=true;
}, 30000);

var timer60 = setInterval(function(){
	//censorClearDeletionQueueLong();
	utilitySaveStats();
	utilitySaveBotStats();
	botCanSendUserCommands=true;
	if(dragoniteActive>0)
	{dragoniteActive--;}
	if(masterActive>0)
	{masterActive--;}
}, 60000);

var timer5min = setInterval(function(){
	botCanYellAtCandy=true;
	for (var user in userTable){
		userTable[user].todayWasWarned=false;
	}
	var now=new Date();
	if (now.getHours()==4&&now.getMinutes()<10){
		for (var string in userTable){
			var user=userTable[string];
			user.todayActions=0;
			user.todayViolence=0;
			user.todayWarnings=0;
			if (now.getDay()==0){
				user.totalWarnings--;
				if (user.totalWarnings<0){
					user.totalWarnings=0;
				}
			}
		}
	}
	gummyCommandsLast5Minutes--;
	if (gummyCommandsLast5Minutes<0){
		gummyCommandsLast5Minutes=0;
	}
	fetchPinnedAuto(client.Channels.get(GENERAL));
}, 300000);

// extra stuff

var myName="SuperSkarm";

//THIS IS THE BIG ONE ie. always refer to the bot as myNick, not "Skarm" in here in case it ever changes so we dont have to edit it 3 billion times


var myNick="Skarm";

var botCanSendUserCommands=true;
var botCanYellAtCandy=true;
var botCanSpeak=true;
var lastTenReactions=[];
var last500General=[];
var last500Action=[];
var last500Dleet=[];
var hasBuggedDracoAboutPins=false;

var DRAGONITE=null;
var ZEAL = null;
var enlightened = null;
var earthbound = null;
// I still don't actually know what this is for?
client.connect({
token: "removed so you don't try logging into this";
});

// What happens when you first connect
client.Dispatcher.on(events.GATEWAY_READY, e => {
	console.log("Connected as " + client.User.username+" ("+myNick+"). Yippee!");
	//client.User.setGame("Type \"e!help\" !");
    client.User.setGame('Your mom');
	twitchGetIsLive(null);
	twitchGetLastStreamDate();
	censorLoadList();
	DRAGONITE=client.Users.get("137336478291329024");
	ZEAL  = client.Guilds.get(GENERAL);
	
	var channel=client.Channels.get("394225765077745665");
			if (channel!=null){
				channel.sendMessage("I'm alive again <@!" + MASTER + "> " + Date.now());
			}
	/*channel=client.Channels.get("305548986155008000");
			if (channel!=null){
				channel.sendMessage("we back");
			}*/

});
//what the bot does whenever a message is deleted
client.Dispatcher.on(events.MESSAGE_DELETE, e=> {
	var string="";
	if (e.message!=null){
		if (e.message.channel!=client.Channels.get("344295609194250250")&&e.message.author!=client.User&&!e.message.author.bot){//if the channel isn't modlog and its not from a bot
			if (e.message==null){														//making sure the message isnt broken
				string="<message not cached>"; 
			} else {
				string=e.message.content+" by "+e.message.author.username;								//record the message 
			}
			fs.appendFile("deleted.txt", "Deleted: "+string+"\r\n", (err) => {							//send that message to the delete log
				if (err){
					throw err;
				}
				if(!e.message.content.startsWith("e!re"))
				{client.Channels.get("414291195028570112").sendMessage(string+ " <#"+ e.message.channel_id +"> was written to deleted.txt.");}	
																//send that message to the deleted lines channel in skarmland
			});
		}
	}
});

client.Dispatcher.on(events.MESSAGE_REACTION_ADD, e=> {
	if (e.emoji.name=="Upvote"){
		if (e.message!=null&&e.message.channel_id==BLACKBIRD){
			// This is horrible and i should feel horrible about writing it //gohere
			if (lastTenReactions.length>=10){
				lastTenReactions.shift();
			}
			lastTenReactions.push(e.message);
			var count=0;
			for (var i=0; i<lastTenReactions.length; i++){
				if (lastTenReactions[i]==e.message){
					count++;
				}
			}
			
			if (count==3&&!e.message.pinned){
				e.message.pin();
				fetchPinnedSelf(e.message.channel);
			}
		}
	}
});

client.Dispatcher.on(events.GUILD_MEMBER_UPDATE, e=> {
	if (e.rolesAdded.length>0){
		
		if (e.rolesAdded[0].id=="310639329334657026"){
			woeMessage(e.member);
		}
		client.Channels.get(MODLOG).sendMessage("Role addition for " + e.member.username);
	}
	if (e.rolesRemoved.length>0){
		client.Channels.get(MODLOG).sendMessage("Role removal for " + e.member.username);
	}
});

client.Dispatcher.on(events.MESSAGE_UPDATE, e=> {
	if (e.message!=null){
		censor(e.message);
	}
});

// Name changes

client.Dispatcher.on(events.GUILD_MEMBER_UPDATE, e=> {
	if (e.member!=null){
		var LOG="428324182728638464";
        if (e.member.nick!=e.previousNick){
            // Either an avatar change or a server nick change
            client.Channels.get(LOG).sendMessage(e.member.username+"@"+e.member.discriminator+": "+e.previousNick+" -> "+e.member.nick);
        }
        
	}
});

client.Dispatcher.on(events.PRESENCE_UPDATE, e=> {
	if (e.member!=null){
		var LOG="428324182728638464";
        var logChannel=client.Channels.get(LOG);
        //if ((e.member.status===e.member.previousStatus)&&(e.member.gameName===e.member.previousGameName)){
        if ((e.user.status===e.user.previousStatus)&&(e.user.gameName===e.user.previousGameName)){
            // Either an avatar change or a server nick change
            //logChannel.sendMessage(e.member.username+"@"+e.member.discriminator+": ??? -> "+e.member.nick);
        }
        
	}
});

client.Dispatcher.on(events.MESSAGE_CREATE, e=> {
	// don't do anything in PMs?
	if (e.message.isPrivate){
		return false;
	}
	// Don't do anything in Woe, Mod Chat or Mod Log
	if (e.message.channel.id==WOE||e.message.channel.id==MODCHAT||e.message.channel.id==MODLOG){
		if (e.message.content.toLowerCase().startsWith("role update for")){
			utilityUpdateEarth(e);
		}
		return false;
	}
	// Don't respond to bot lines
	if (e.message.author.bot){
		if (e.message.content.toLowerCase() == "operation knife dragon"){
			e.message.channel.sendMessage("_stabs dragonite_");
		}
		
		return false;
	}
	var author = e.message.author;
	var message=e.message.content.toLowerCase();
	censor(e.message);
	//utilitySaveLine(message);
	// Help
	if (!e.message.deleted){ 
		if (message.includes("drago") || message.includes("dova")){
				if(dragoniteActive < 1){
					client.Channels.get("417833536519798795").sendMessage(message  +  " from "    +  e.message.author.username +" in <#" +e.message.channel_id +  ">, <@!137336478291329024>");  
				}
			}
		if (messageAuthorEquals(e.message, "137336478291329024")){
			dragoniteActive = 5;
			if(message==": )" || message == ":)" && Math.random() < .1){
				e.message.channel.sendMessage("<:Senate:395030198636249089>");
			}
		}
		if (message.includes("master") || message.includes("misha") || message.includes("m9k") || message.includes("magus")){
				if(masterActive < 1){
					client.Channels.get("417843952595632148").sendMessage(message  +  " from "    +  e.message.author.username +" in <#" +e.message.channel_id +  ">, <@!162952008712716288>");  
				}
			}
		if (messageAuthorEquals(e.message, "162952008712716288")){
		masterActive = 3;
		}
		if (message=="e!help"){
			helpHelpHelp(e);
			totalBotCommands++;
		} else if (message=="e!help says"){
			helpSays(e);
			totalBotCommands++;
		} else if (message=="e!help twitch"){
			helpTwitch(e);
			totalBotCommands++;
		} else if (message=="e!help lol"){
			helpLol(e);
			totalBotCommands++;
		} else if (message=="e!help misc"){
			helpMisc(e);
			totalBotCommands++;
		/*} else if (message=="e!help pictures"){
			helpPictures(e);
			totalBotCommands++;*/
		} else if (message=="e!help credits"){
			helpCredits(e);
			totalBotCommands++;
		} else if (message=="e!help reactions"){
			helpReactions(e);
			totalBotCommands++;
		} else if (message=="e!help mods"){
			helpMods(e);	// please
			totalBotCommands++;
		// Utilities
		} else if (message=="e!size"){
			utiliyLineCount(e);
			totalBotCommands++;
		} else if (message=="e!sgen"){
			utilityGenCount(e);
			totalBotCommands++;
		} else if (message=="e!sact"){
			utilityActCount(e);
			totalBotCommands++;
		} else if (message=="e!all"){
			//utilityDumpServer(e);
			e.message.channel.sendMessage("This has been turned off to preserve sanity. If you really need to use it, go bother Dragontie#7992 to turn it back on.");
			//totalBotCommands++;
		} else if (message=="e!stats"){
			totalBotCommands++;
			utilityStats(e);
		} else if (message=="e!ping"){
			totalBotCommands++;
			utilityPing(e);
		} else if (message.startsWith("e!hug")){
			totalBotCommands++;
			utilityHug(e);
		} else if (message.startsWith("e!sandwich")){
			totalBotCommands++;
			utilitySandwich(e);
		} else if (message.startsWith("e!bot")){
			totalBotCommands++;
			utilityBotStats(e);
		}else if (message.startsWith("e!kenobi")){
			totalBotCommands++;
			utilityKenobi(e);
		}else if(message.startsWith("e!test")){
			totalBotCommands++;
			var balwar = client.Channels.get(MEyTA);
			var which = message.substring(7, message.length);
				e.message.channel.sendMessage("substring:" + which);
			
				
				if(which === "g")
					{e.message.channel.sendMessage("Messages in General Lg: " + client.Channels.get(dataGen).length)}
			else if(which === "a") 
					{e.message.channel.sendMessage("Messages in Action Log: " + client.Channels.get(dataAct).length)}
			else if(which === "k")
					{e.message.channel.sendMessage("Messages in King's log: " + client.Channels.get(frmKing).length)}
		} else if (message.startsWith("e!pinned <#")){	//type e!pinned #channelname to get that channel's pin count
			totalBotCommands++;
			var checkChan = message.substring(11, message.length-1)
			//e.message.channel.sendMessage("substring:" + checkChan);							
			var amtPins;
				 if (checkChan == (GENERAL))		{utilityPinned(client.Channels.get(GENERAL), e.message.channel);}									
			else if (checkChan === (ALGETTY))		{utilityPinned(client.Channels.get(ALGETTY), e.message.channel);}
			else if (checkChan === (SUNS))			{utilityPinned(client.Channels.get(SUNS), e.message.channel);}
			else if (checkChan === (NRTKP))			{utilityPinned(client.Channels.get(NRTKP), e.message.channel);}
			else if (checkChan === (BLACKBIRD))		{utilityPinned(client.Channels.get(BLACKBIRD), e.message.channel);}
			else if (checkChan === (OCEANPALACE))	{utilityPinned(client.Channels.get(OCEANPALACE), e.message.channel);}
			else if (checkChan === (ENHASA))		{utilityPinned(client.Channels.get(ENHASA), e.message.channel);}
			else if (checkChan === (DREAM))			{utilityPinned(client.Channels.get(DREAM), e.message.channel);}
		} else if (message.startsWith("e!pinned")){
			utilityPinned(e.message.channel, e.message.channel);
		} else if (message.startsWith("e!game ")){
			utilityGame(e);
		} else if (message.startsWith("e!re ")){
			totalBotCommands++;
			utilityRe(e);
		} else if (message.startsWith("e!silver ")){
			utilitySilver(e);
		// Quote
		} else if (message.startsWith("e!says-add ")){
			totalBotCommands++;
			add(e.message);
		} else if (message=="e!test"){
			e.message.channel.sendMessage(e.message.author.username+" can submit messages: "+userHasKickingBoots(e.message.author, e.message.channel));
			totalBotCommands++;
		// Twitch
		} else if (message=="e!live"){
			twitchGetIsLive(e.message.channel);
			totalBotCommands++;
		// Pictures
		/*} else if (message=="e!waifu"){
			waifuSend(e.message.channel);
			totalBotCommands++;
		} else if (message=="e!cat"){
			catSend(e.message.channel);
			totalBotCommands++;*/
		}
		// Censor functions
		else if (message.startsWith("e!censor")){
			censorCommandSet(e.message);
		}
		else if (message.startsWith("e!react")){												//master uncomment this              m9k
			utilityEmotes(e.message);
		}
		// Lol
		if (botCanSendUserCommands){
			if (message=="e!will"){
				annoyWill(e.message.channel);
				totalBotCommands++;
				botCanSendUserCommands=false;
			} else if (message=="e!refresh"){
				totalBotCommands++;
				utilityUpdateEarth(e);
			} else if (message=="e!gummy"){
				e.message.channel.sendMessage("Stop abusing the gummy commands ಠ_ಠ");
				totalBotCommands++;
				botCanSendUserCommands=false;
				gummyCommandsLast5Minutes++;
			} else if (message=="e!gummy-b"){
				e.message.channel.sendMessage("Stop abusing the gummy commands ಠ_ಠ");
				totalBotCommands++;
				botCanSendUserCommands=false;
				gummyCommandsLast5Minutes++;
			} else if (message=="e!gummy-c"){
				//if (gummyCommandsLast5Minutes<2){
				//} else {
				e.message.channel.sendMessage("Stop abusing the gummy commands ಠ_ಠ");
				//}
				totalBotCommands++;
				botCanSendUserCommands=false;
				gummyCommandsLast5Minutes++;
			} else if (message=="e!dragonite"){
				e.message.channel.sendMessage("This is Dragonte's level 50 reward");
				totalBotCommands++;
				botCanSendUserCommands=false;
			} else if (message=="e!dragonite-b"){
				e.message.channel.sendMessage("Literally everybody but especially Dragonite is a baka.");
				totalBotCommands++;
				botCanSendUserCommands=false;
			} else if (message=="e!ida"){
				e.message.channel.sendMessage("She bloody hates sheep.");
				totalBotCommands++;
				botCanSendUserCommands=false;
			} else if (message=="e!deci"){
				annoyDeci(e.message.channel);
				totalBotCommands++;
				botCanSendUserCommands=false;
			} else if (message=="e!candy"){
				annoyCandyman(e.message.channel);
				totalBotCommands++;
			} else if (message=="e!candy-b"){
				e.message.channel.sendMessage("#ThingsThatCandySaysThatPeopleShouldn'tTakeSeriously");
				totalBotCommands++;
				botCanSendUserCommands=false;
			} else if (message=="e!rainy"){
				e.message.channel.sendMessage("STOP SHOUTING!!!!!!!!!!!!!!!!!!!");
				totalBotCommands++;
			} else if (message=="e!treason"){
				//e.message.channel.sendMessage("ಠ_ಠ");
				e.message.channel.sendMessage("God damn it, Squid.");
				totalBotCommands++;
				botCanSendUserCommands=false;
			} else if (message=="e!back"){
				e.message.channel.sendMessage("\"Back\" count: "+statsGeneral.everything.back);
				totalBotCommands++;
				botCanSendUserCommands=false;
			}
		}
		//Everything else
		statsWillOfD(e.message);
		STATS(e.message);
		if (!utilityMessageWasWrittenByMe(e.message)){
			if (!REACT(e.message, e.message.author.id)){
                if (e.message.channel!=OCEANPALACE){
					if (e.message.mentions.length==0&&e.message.mention_roles.length==0&&!e.message.mentions_everyone){
                        if (messageAuthorEquals(e.message, "304073163669766158")){	
							if (false){
                            	if (Math.random()*100<25){
                                	add(e.message);
                            	}
                       		}
						} 
						else 
							if(!e.message.content.startsWith("=")&& !e.message.content.includes("http")&& !e.message.content.startsWith("t!")&&!(e.message.content.startsWith("_ascii") && e.message.content.startsWith("_play "))){
                            	if (
									(Math.random()*100<25 || e.message.content.indexOf("alpine")>-1) && canCreateInvites(e.message.author, e.message.channel)){
										addGeneral(e.message);
							}
                      	}
                    }
				}
			}
		}
	}
});

function sendMessageDelay(string, channel){
	channel.sendTyping();
	setTimeout(function(){
		channel.sendMessage(string);
	}, Math.random()*2000+1000);
}





//this is here due to proximity to add for conveniance ;;;;;;
function regularityUpdateEarth(){
	var zelos = ZEAL;
	var enlightened = null;
	var earthbound = null;
	var monarch = null;
	var guru = null;
	var botter = null;
	//enlightened
	for(var i = 0; i<zelos.roles.length; i++){
		if(zelos.roles[i].id == ENLIGHTENED){
			enlightened = zelos.roles[i].id;
			i = zelos.roles.length;
		}
	}
	//earthbound
	for(var i = 0; i<zelos.roles.length; i++){
		if(zelos.roles[i].id == EARTHBOUND){
			earthbound = zelos.roles[i].id;
			i = zelos.roles.length;
		}
	}
	//monarch
	for(var i = 0; i<zelos.roles.length; i++){
		if(zelos.roles[i].id == "305100692933050368"){
			monarch = zelos.roles[i].id;
			i = zelos.roles.length;
		}
	}
	//guru
	for(var i = 0; i<zelos.roles.length; i++){
		if(zelos.roles[i].id == "305100589514227712"){
			guru = zelos.roles[i].id;
			i = zelos.roles.length;
		}
	}
	//bot
	for(var i = 0; i<zelos.roles.length; i++){
		if(zelos.roles[i].id == "305111451931115521"){
			botter = zelos.roles[i].id;
			i = zelos.roles.length;
		}
	}
	//checks the guild members for the role
	for (var i=0; i<zelos.members.length; i++){
		member = zelos.members[i];
		//ignores staff roles for sanity sake
		if(member.hasRole(guru) || member.hasRole(botter) || member.hasRole(monarch)){}
		else{
			if(member.hasRole(enlightened) && member.hasRole(earthbound)){
				member.unassignRole(earthbound);
				//e.message.channel.sendMessage("Something worked");
			}
			if(!member.hasRole(enlightened) && !member.hasRole(earthbound)){
				member.assignRole(earthbound);
				//e.message.channel.sendMessage("Something worked");
			}
		}
	}
}
function utilityUpdateEarth(e){
	if(e.message.guild.id == "304082726019923978"){
		if(e.message.channel.id != MODLOG){
		e.message.channel.sendMessage("Updating Enlightened...");
		}
		var member = null;
		//assigns zelos to Kingdom of Zeal guild variable
		var zelos = e.message.guild;
		//this whole shithole assigns enlightened and earthbound to their respective roles, its a clusterfuck like no other
		var enlightened = null;
		var earthbound = null;
		var monarch = null;
		var guru = null;
		var botter = null;
		//enlightened
		for(var i = 0; i<zelos.roles.length; i++){
			if(zelos.roles[i].id == ENLIGHTENED){
				enlightened = zelos.roles[i].id;
				i = zelos.roles.length;
			}
		}
		//earthbound
		for(var i = 0; i<zelos.roles.length; i++){
			if(zelos.roles[i].id == EARTHBOUND){
				earthbound = zelos.roles[i].id;
				i = zelos.roles.length;
			}
		}
		//monarch
		for(var i = 0; i<zelos.roles.length; i++){
			if(zelos.roles[i].id == "305100692933050368"){
				monarch = zelos.roles[i].id;
				i = zelos.roles.length;
			}
		}
		//guru
		for(var i = 0; i<zelos.roles.length; i++){
			if(zelos.roles[i].id == "305100589514227712"){
				guru = zelos.roles[i].id;
				i = zelos.roles.length;
			}
		}
		//bot
		for(var i = 0; i<zelos.roles.length; i++){
			if(zelos.roles[i].id == "305111451931115521"){
				botter = zelos.roles[i].id;
				i = zelos.roles.length;
			}
		}
		//checks the guild members for the role
		for (var i=0; i<zelos.members.length; i++){
			member = zelos.members[i];
			//ignores staff roles for sanity sake
			if(member.hasRole(guru) || member.hasRole(botter) || member.hasRole(monarch)){}
			else{
				if(member.hasRole(enlightened) && member.hasRole(earthbound)){
					member.unassignRole(earthbound);
					//e.message.channel.sendMessage("Something worked");
				}
				if(!member.hasRole(enlightened) && !member.hasRole(earthbound)){
					member.assignRole(earthbound);
					//e.message.channel.sendMessage("Something worked");
				}
			}
		}
	}
	else{
		e.message.channel.sendMessage("Please use this in zeal for it to work");
		return false;
	}
	if(e.message.channel.id != MODLOG){
	e.message.channel.sendMessage("Everyone is all set (hopefully)");
	}
	return true;
}

/*
 ********************
 *      Quotes      *
 ********************
 */
 
//adds Eyan's quotes to his log 
function add(message){
	if(message.guild.id != "304082726019923978"){
		message.channel.sendMessage("Please contact the Kingdom of Zeal staff to use this feature https://discord.gg/WFAMf42");
		return false;
	}
	var msg=message.content.toLowerCase().replace("e!says-add ", "").replace(/\r?\n|\r/, " ");
	for (var i=0; i<banned.length; i++){
		if (msg.includes(banned[i][0].toLowerCase())){
			message.channel.sendMessage("Please do not add profanity to the quote log. Thank.");
			return false;
		}
	}
	//master also go here
	client.Channels.get("409868415176802324").sendMessage(message.content.substring(10));  //writes the line to Skarm's server mirror of the database
	saveLine(message, "line.txt", msg);
}

//adds a message to skarm's response database if its not from Eyan
function addGeneral(message){
    //single server development precondition
    if(message.guild.id != "304082726019923978"){
        if(message.guild.id == "394225763483779084"){
            console.log("caught " + message.content + " in Skarm the server");
            return false;
        }
        client.Channels.get("418138620952707082").sendMessage("`dodged` \n"+ message.content + " from <#" + message.channel.id + ">");
        return false;
    }
	
	var msg=message.content.toLowerCase();
	//preconditions: message between 4 and 250 characters
	if (msg.length<4||msg.length>250){
		return false;
	}
	for (var i=0; i<banned.length; i++){
		if (msg.includes(banned[i][0].toLowerCase())){
			return false;
		}
	}
	//appends normal lines into the general log	
	if (!utilityIsAction(msg)){
		client.Channels.get("409856900469882880").sendMessage(msg);
		fs.appendFile("generallines.txt", msg+"\r\n", (err)=>{
			if (err){
				throw err;
			}
		});																							
	} 
	//appends action lines to the action log instead 
	else {
		client.Channels.get("409860642942615573").sendMessage(msg);	//writes the line to Skarm's server mirror of the database
		fs.appendFile("generallinesactions.txt", msg+"\r\n", (err)=>{
			if (err){
				throw err;
			}
		});
	}
}

// Checks to see if the user is allowed to submit messages to the bot
function userHasKickingBoots(author, channel){
	return author.can(discordie.Permissions.General.KICK_MEMBERS, channel);
}

//Checks to see if the user can create an instant invite
function canCreateInvites(author, channel){
	return author.can(discordie.Permissions.General.CREATE_INSTANT_INVITE, channel);
}

// Send a random line
function sendRandomLine(message){
	sendRandomFileLine("line.txt", message.channel);
}

function sendRandomLinePun(message){
	sendRandomFileLine("puns.txt", message.channel);
}

function sendRandomLineGeneral(message){
	sendRandomFileLine("generallines.txt", message.channel);
}

function sendRandomLineGeneralAction(message){
	sendRandomFileLine("generallinesactions.txt", message.channel);
}

// Saves a line to the line file
function saveLine(message, filename, string){
	if (userHasKickingBoots(message.author, message.channel)){
		fs.appendFile(filename, string+"\r\n", (err) => {
			if (err){
				throw err;
			}
			console.log(string+" was written to "+filename+".");
		});
		//message.channel.sendMessage("Added!");
	} else {
		message.channel.sendMessage(message.author.username+": you don't have permission to add quotes. Sorry.");
	}
}
//in response to e!kenobi, prints out a 4x4 emotes image of him, example image of output: https://cdn.discordapp.com/attachments/305548986155008000/424078792382873611/unknown.png
function utilityKenobi(e){
	if(e.message.channel==client.Channels.get("304082726019923978")){
		return;}
	//var mess =	"<:0x0:422896537925058560><:1x0:422896539204059136><:2x0:422896538831028244><:3x0:422896538159808512>\n
	//			<:0x1:422896538025590784><:1x1:422896539157921802><:2x1:422896538939818006><:3x1:422896538210009089>\n
	//			<:0x2:422896537966739457><:1x2:422896538776502273><:2x2:422896539044806656><:3x2:422896538197688331>\n
	//			<:0x3:422896538415529993><:1x3:422896538776371220><:2x3:422896539019640833><:3x3:422896538973634561>";
	e.message.channel.sendMessage("<:0x0:422896537925058560><:1x0:422896539204059136><:2x0:422896538831028244><:3x0:422896538159808512>\n<:0x1:422896538025590784><:1x1:422896539157921802><:2x1:422896538939818006><:3x1:422896538210009089>\n<:0x2:422896537966739457><:1x2:422896538776502273><:2x2:422896539044806656><:3x2:422896538197688331>\n<:0x3:422896538415529993><:1x3:422896538776371220><:2x3:422896539019640833><:3x3:422896538973634561>");
	e.message.delete();
}
// Pulls a random line from the text file
function sendRandomFileLine(filename, channel){
	var lines;
	fs.readFile(filename, function(err, data){
		if(err){
			channel.sendMessage("No quotes for that user!");
		} else {
			lines = data.toString().split('\n');
			var line="";
			do {
                // This is bad and I should feel bad (makes Squid's name pop up more often in conversation)
                for (var i=0; i<5; i++){
                    line=lines[Math.floor(Math.random()*lines.length)];
                    if (line.toLowerCase().includes("squid")){
                        break;
                    }
                }
			} while (line.length<2);
			channel.sendMessage(line);
		}
	})
}

/*
 ********************
 *   Twitch Stuff   *
 ********************
 */

// Checks if Zeal is online. If he's gone online, it sends an announcement.
function twitchSendStatusMessage(){
	if (streamState){
		if (streamHasNotifiedDate==null||twitch12HoursElapsed(new Date(), streamHasNotifiedDate)){
			streamHasNotifiedDate=new Date();
			fs.writeFile("./stuff/streamDate.txt", streamHasNotifiedDate);
			var channel=client.Channels.get("305488106050813954");
			if (channel!=null){
				channel.sendMessage("@everyone Zeal has gone online! \n https://www.twitch.tv/kingofzeal");
			}
		}
	}
}

function twitch12HoursElapsed(newDate, oldDate){
	var seconds=(newDate-oldDate)/1000;
	var minutes=seconds/60;
	var hours=minutes/60;
	return (hours>12);
}

// I'm sure there's a better way to do this.
function twitchGetIsLive(channel){
	twitch.get('kingofzeal').then(function(streams) {
		if (channel!=null){
			channel.sendMessage("Zeal is live!\n https://www.twitch.tv/kingofzeal");
		}
		streamState=true;
	}).catch(function(error) {
		if (channel!=null){
			channel.sendMessage("Zeal is not live /:");
		}
		streamState=false;
	});
	// can't simply return a value here because this is an asyncrhonous function ლ(ಠ益ಠლ)
}

function twitchGetLastStreamDate(){
	fs.readFile("./stuff/streamDate.txt", function(err, data){
		if(err){
			
		} else {
			var date = data.toString().trim();
			if (date===""){
				console.log("Date file is . . . empty?");
				streamHasNotifiedDate=null;
			} else {
				streamHasNotifiedDate=new Date(date);
			}
		}
	})
}

/*
 ********************
 *     Lol Stuff    *
 ********************
 */

// Stuff he says.
function annoyDragonite(channel){
	 var responses=["You rang?"];
		// add more responses down here
	channel.sendMessage(responses[Math.floor(Math.random()*responses.length)]);
}

// Stats printout.
function annoyWill(channel){
	var lol=stats.WillOfD.lol;
	var xd=stats.WillOfD.xd;
	var w=stats.WillOfD.w;
	var messages=stats.WillOfD.messages;
	if (messages==0){
		channel.sendMessage("\\*\\*\\*Will has not recorded any messages yet.\\*\\*\\*");
	} else {
		channel.sendMessage("```Percentage of WillOfD's messages that contain \"lol:\""+(100*lol/messages).toFixed(2)+"%\n"+
			"Percentage of WillOfD's messages that contain \"XD:\" "+(100*xd/messages).toFixed(2)+"%\n"+
			"Percentage of WillOfD's messages that contain \"^w^:\" "+(100*w/messages).toFixed(2)+"%\n\n"+
			"WillOfD's total messages: "+messages+"```");
	}
}

// Various salts.
function annoyDeci(channel){
	 var responses=["2 Na + Cl(2) → 2 NaCl",
		"NaOH (aq) + HCl (aq) → NaCl(aq) + H(2)O (l)"];
	channel.sendMessage(responses[Math.floor(Math.random()*responses.length)]);
}

// Watch your fucking language.
function annoyCandyman(channel){
	channel.sendMessage("Watch your SKITTYing language ಠ_ಠ");
}

/*
 ********************
 *       Stats      *
 ********************
 */

// Because I swear she says this in every single message (sometimes both).
function statsWillOfD(message){
	if (messageAuthorEquals(message, "113084295958044672")){
		var text=message.content.toLowerCase();
		if (text.includes("lol")){
			stats.WillOfD.lol++;
		}
		if (text.includes("xd")){
			stats.WillOfD.xd++;
		}
		if (text.includes("^w^")){
			stats.WillOfD.w++;
		}
		stats.WillOfD.messages++;
		fs.writeFileSync('stats.ini', ini.stringify(stats));
	}
}

function saveStatsGeneral(){
	fs.writeFileSync("misc.ini", ini.stringify(statsGeneral));
}

function STATS(message){
	var string=message.content.toLowerCase();
	var usernameString=authorString(message.author);
	var user;
	if (usernameString in userTable){
		user=userTable[usernameString];
	} else {
		user=new User(message.author.username);
		userTable[usernameString]=user;
	}
	user.lines++;
	
	if (string.includes("slap")&&utilityIsAction(string)){
		user.slaps++;
	}
	if (string.includes("eyan")||string.includes("zeal")){
		user.zeal++;
	}
	if (string.includes("toilet")){
		user.toilet++;
	}
	if (utilityIsAction(string)){
		user.actions++;
	}
	if (string.endsWith("?")){
		user.questions++;
	}
	if (string.endsWith("!")){
		user.exclamations++;
	}
	if (string.toLowerCase().includes("elvia")){
		user.elvia++;
	}
	
	if (utilityIsAction(string)){
		user.todayActions++;
		for (var i=0; i<violentVerbs.length; i++){
			if (string.includes(violentVerbs[i])){
				user.todayViolence++;
				if (!user.todayWasWarned&&user.todayWarnings<2){
					// can send a warning?
					if (user.todayActions>10&&user.todayViolence/user.todayActions>0.06){
						user.todayWasWarned=true;
						user.todayWarnings++;
						user.totalWarnings++;
						// alert
						DRAGONITE.openDM().then(function(dm){
							dm.sendMessage(message.author.username+" is being a wee bit violent. Have a word with them, maybe?");
							dm.sendMessage("Message: ```"+string+"```");
						});
						// Alert 
						client.Channels.get("344295609194250250").sendMessage(message.author.username+" is being a wee bit violent. Have a word with them, maybe?\n"+
							"\tOffending message: ```"+string+"```");
					}
				}
			}
		}
	}
	if (botCanSendUserCommands){
		if (string.includes("is back")||string.includes("has returned")||string.includes("m back")){
			statsGeneral.everything.back++;
			botCanSendUserCommands=false;
			saveStatsGeneral();
		}
	}
}

function utilityBotStats(e){
	var uptime=process.uptime();
	var uptimeDays=Math.floor(uptime/(60*60*24));
	var uptimeHours=Math.floor((uptime%(60*60*24))/3600);
	var uptimeMinutes=Math.floor((uptime%3600)/60);
	var uptimeSeconds=Math.floor(uptime%60);
	var memory=process.memoryUsage();
	
	var string="";
	string="Users, probably: "+Object.keys(userTable).length+"\n";
	string=string+"Memory usage, probably: "+memory.rss/(1024*1024)+" MB\n";
	string=string+"Uptime, probably: "+uptimeDays+" days, "+uptimeHours+" hours, "+uptimeMinutes+" minutes, "+uptimeSeconds+" seconds\n";
	string=string+"Commands recieved since we started caring: "+totalBotCommands+"\n";
	string=string+"Lines censored since we started caring: "+totalCensoredLines+"\n";
	if (e.message.author.id==MASTER){
		string=string+"Heap usage: shove it up your @$$, Magus"
	}
	
	
	e.message.channel.sendMessage("Bot stats, and stuff:\n```"+string+"```");
}

function utilitySilver(e){
	var silverString="";
	for (var i=0; i<e.message.mentions.length; i++){
		if (e.message.mentions[i].id==e.message.author.id){
			e.message.channel.sendMessage("_whacks **"+e.message.author.username+"** with a broom handle_");
			return false;
		}
		var usernameString=authorString(e.message.mentions[i]);
		if (usernameString in userTable){
			var user=userTable[usernameString];
			user.silver++;
			utilitySaveStats();
			silverString=silverString+"**"+e.message.mentions[i].username+"** now has **"+user.silver+"** silver!\n";
		}
	}
	if (silverString.length>0){
		e.message.channel.sendMessage(silverString);
		return true;
	}
	
	return false;
}

/*
 ********************
 *     Reactions    *
 ********************
 */

function REACT(message, id){
	//banned from reactions rip
	var botReactionBlacklist=[
	]
	for (var i=0; i<botReactionBlacklist.length; i++){
		if (messageAuthorEquals(message, botReactionBlacklist[i])){
			return false;
		}
	}
	/*
	 * Specific reactions
	 */
	//Hello There 
	if ((message.content=="<:HelloThere:305560404715896832>" || message.content=="<:HelloThere:422567230392500234>")&& (Math.random()*100<85 || message.author.username == "KingofZeal")){
        if(Math.random()<.25 || message.author.username == "KingofZeal"){sendMessageDelay("GENERAL KENOBI \nYou are a **bold one.**\n<:bluelightsaberyx:422558517287845889> <:greenlightsaberyx:422559631030878209>  <:skarmhead:422560671574523904>   <:bluelightsaberyx:422558517589704704> <:greenlightsaberyx:422559630741340171>", message.channel);}
	   else{
		var nick = "";
			if(message.author.username == "Master9000")		{nick = "general Master";}
		else if(message.author.username == "SuperDragonite2172")	{nick = "general Draco";} 
		else if(message.author.username == "SquidofBaconator")	{nick = "general Squid";}
		else if(message.author.username == "Neon Strike Kitty")	{nick = "general Ida";}
		else if(message.author.username == "KingofZeal")		{nick = "King Eyan";}
		else if(message.author.username == "SuperGummying")		{nick = "fart commander gummy";}  //jesteral
		else if(message.author.username == "Kireina")			{nick = "general Panda";} 
		else if(message.author.username == "Wolverale12")		{nick = "general wolverale";}
		else if(message.author.username == "FLUBS")				{nick = "specific Luigi";}
		
		else {nick = "general " +message.author.username;}
		sendMessageDelay(nick.toUpperCase() + "\nYou are a bold one.\n<:bluelightsaberyx:422558517287845889> <:greenlightsaberyx:422559631030878209>  <:skarmhead:422560671574523904>   <:bluelightsaberyx:422558517589704704> <:greenlightsaberyx:422559630741340171>", message.channel);}
        //sendMessageDelay("You are a bold one.", message.channel);
        return true;
     }
	//today's date
	if(message.content.includes("dating today") && Math.random() <.75){
		message.channel.sendMessage(timeConverter(Date.now()));
		return true;
	}
	//who to ship
	if(message.content.includes("ship") && (Math.random() <.05 ||(id == "199725993416589313" && Math.random() < .2))){
		message.channel.sendMessage("All aboard the S.S. Aqua!");
	}
	// getting a date
	if (!utilityIsAction(message.content)){
		if (message.content.includes("hot date")&&Math.random()<0.25){
			message.channel.sendMessage(hotDateResponses[Math.floor(Math.random()*hotDateResponses.length)]);
		} else if (message.content.includes("last date")&&Math.random()<0.25){
			message.channel.sendMessage(lastDateResponses[Math.floor(Math.random()*lastDateResponses.length)]);
		} else if (message.content.includes("get a date")&&Math.random()<0.75){
			var mm=Math.floor(Math.random()*11)+1;
			var dd=Math.floor(Math.random()*27)+1;
			var yy=Math.floor(Math.random()*2500)+1;
			sendMessageDelay(mm+"/"+dd+"/"+yy, message.channel);
			return true;
		}
	}
	// Free hugs
	if (utilityIsAction(message.content)&&!utilityMessageWasWrittenByMe(message)){
		var newString=replaceAll(message.content, "_", "");
		newString=replaceAll(newString, "*", "");
		newString=replaceAll(newString, "@", "");
		if (newString.startsWith("hugs")){
			if (Math.random()*100<60){
				var target=newString.replace("hugs ", "");
				sendMessageDelay("_hugs "+target+", also_", message.channel);
				return true;
			}
		}
	} else if (message.content.toLowerCase().endsWith("i need a hug")){
		sendMessageDelay("_hugs "+message.author.nickMention+"_", message.channel);
		return true;
	} else if (message.content.toLowerCase().endsWith("hug me")){
		sendMessageDelay("_hugs "+message.author.nickMention+"_", message.channel);
		return true;
	}
	// cookies
	if (message.content.toLowerCase().includes("cookie")&&!utilityMessageWasWrittenByMe(message)){
		if (Math.random()*100<10){
			sendMessageDelay("_steals cookies_", message.channel);
			console.log("Cookies have been stolen from "+message.author.username+".");
			return true;
		}
	}
	// sandwich
	if (message.content.toLowerCase().includes("sandwich")&&!utilityMessageWasWrittenByMe(message)){
		if (Math.random()*100<10){
			sendMessageDelay("_steals sandwich_", message.channel);
			console.log("Sandwich has been stolen from "+message.author.username+".");
			return true;
		}
	} else if (message.content.toLowerCase().includes("sandvich")&&!utilityMessageWasWrittenByMe(message)){
		if (Math.random()*100<20){
			sendMessageDelay("_steals sandvich_", message.channel);
			console.log("Sandvich has been stolen from "+message.author.username+".");
			return true;
		}
	// america
	} else if (message.content.toLowerCase().includes("america")&&!utilityMessageWasWrittenByMe(message)){
		if (Math.random()*100<10){
			sendMessageDelay("SKITTY YEAH!", message.channel);
			console.log("Skitty yeah.");
			return true;
		}
	}
	// onii-chan
	if (messageAuthorEquals(message, "191299047896776704")){
		if (message.content.toLowerCase().includes("onii-chan")&&Math.random()*100<35){
			sendMessageDelay("ლ(ಠ益ಠლ)", message.channel);
			console.log("Pimaster has discovered the oniichan reaction.");
			return true;
		}
	}
	// PUNish[ment]
	if (message.content.includes("PUNish")&&Math.random()*100<45){
		sendMessageDelay("ლ(ಠ益ಠლ)", message.channel);
		console.log("Punishment has been doled out.");
		return true;
	}
	// Noms
	if (utilityIsAction(message.content)&&message.content.includes("noms")&&(Math.random()*100<20|| id=="178655272796028928") || message.content.includes("catch23animalman")){						//afield
		if (id=="178655272796028928" || message.content.includes("catch23animalman")){sendMessageDelay("*underlines Animal\_ Man\_*", message.channel);
			if(message.content.includes("catch23animalman")){message.delete();
			}
		}
		else{
		sendMessageDelay("_noms "+message.author.username+"_", message.channel);
		}
		return true;
	}
	//back from work the ninnies
	if (message.content.includes("back from work") && id == "319638082867691521" && Math.random() < .05){
		sendMessageDelay("get back to work", message.channel);
	}
	//birdbrain
	else if ((message.content.toLowerCase().includes("debugs")||message.content.toLowerCase().includes("bird brain"))&&Math.random()*100<705)
	{
		sendMessageDelay("debugs mean more rebooting", message.channel);
		return true;
	}
	

	/*
	 * Generic reactions
	 */
	 
	var verbsPain=[
		"slaps",
		"stabs",
		"kills",
		"murders",
		"beats",
		"kicks",
		"punches",
		"pinches",
	]
	
	var verbsUncomfortable=[
		"pets",
		"buys",
		"sells",
	]
	
	var verbsGratitude=[
		"chooses",
	]
	
	var verbsOhNo=[
		"breaks",
	]
	 
	 if (utilityIsAction(message.content)){
		 var words=replaceAll(message.content, "_", "").split(" ");
		 if (words.length>1){
			 if (words[1].toLowerCase()==myNick.toLowerCase()||(words.length>2&&words[2].toLowerCase()==myNick.toLowerCase())){
				 if (verbsPain.indexOf(words[0])>-1){
					message.channel.sendMessage("Ow . . .").then(e => censorMessageDeletionQueueLong(e));;
					botCanSendUserCommands=false;
					return true;
				 }
				 if (verbsUncomfortable.indexOf(words[0])>-1){
					message.channel.sendMessage("_beats "+message.author.nickMention+" over the head with a spatula_").then(e => censorMessageDeletionQueueLong(e));;
					botCanSendUserCommands=false;
					return true;
				 }
				 if (verbsGratitude.indexOf(words[0])>-1){
					message.channel.sendMessage("_hugs "+message.author.nickMention+"_").then(e => censorMessageDeletionQueueLong(e));;
					botCanSendUserCommands=false;
					return true; 
				 }
				 if (verbsOhNo.indexOf(words[0])>-1){
					message.channel.sendMessage("ヽ( ｡ ヮﾟ)ノ").then(e => censorMessageDeletionQueueLong(e));
					botCanSendUserCommands=false;
					return true; 
				 }
			 }
		 }
	 }
	 
	/*
	 * EyanSays
	 */
	if(
		(
		(message.content.toLowerCase().includes(" "+myNick.toLowerCase())
		|| message.content.toLowerCase().includes("birdbrain")
		|| message.content.toLowerCase().includes("filthy heap of metal binary spaghetti")
		||(message.content.toLowerCase().includes("bot") && Math.random() <.01)
	 )
	||	message.content.startsWith(myNick.toLowerCase())
		)&&(message.content.match(new RegExp(" ", "g"))
	||[]).length>2
	&&botCanSpeak
	|| message.content.toLowerCase().includes("skram!"))
	{
		botCanSpeak=false;
		message.channel.sendTyping();
		setTimeout(function(){
			if (utilityIsAction(message.content)){
				sendRandomLineGeneralAction(message);
			} else {
				if (Math.random()*100<20){
					sendRandomLine(message);
                } else if (Math.random()*100<10){
                    sendRandomLinePun(message);
				} else {
					sendRandomLineGeneral(message);
				}
			}
		}, Math.random()*2000+1000);
		return true;
	}
	
	return false;
}

/*
 ********************
 *      Censor      *
 ********************
 */

// Basic censor. Built around string.includes. Not recommended for serious use.
function censor(message){
	if (message.channel!=client.Channels.get("311402910820859914")&&	// meme chat
		message.channel!=client.Channels.get("311398412610174976")&&	// woe
		message.author!=client.User){									// can't censor itself
			censorText(message.content, message.channel, message.author, message, "");
	}
}

// The actual censor
function censorText(text, channel, author, message, redactMessage){
	var newMessage=censorRemoveRegionalIndicators(text.toLowerCase());
	var toDelete=-1;
	var bannedCount=0;
	for (var i=0; i<banned.length; i++){
		if (newMessage.includes(banned[i][0])){
			bannedCount+=(newMessage.match(new RegExp(banned[i][0], "g"))||[]).length;
			if (redactMessage.length==0){
				newMessage=replaceAll(newMessage, banned[i][0], banned[i][2]);
			} else {
				newMessage=redactMessage;
			}
			toDelete=i;
		}
	}
	if (toDelete>-1){
		if (newMessage.length>320){
			newMessage=newMessage.slice(0, 320)+"...";
		}
		var canTextReplace=true;
		var swearReplacementBlacklist=[ //the list of people blacklisted by ID
			[//"162952008712716288" //this was just for fuck so no longer needed. hopefully won't screw up compiler
			   "263474950181093396" //putting m9k's testing alt in here to avoid a bug just in case
			]
		]
		if (authorEquals(author, "304073163669766158")){   //304073163669766158 = eyan
			 client.Channels.get("418138620952707082").sendMessage("May have said " + newMessage);
			return false;
		}
		for (var i=0; i<swearReplacementBlacklist.length; i++){
			if (authorEquals(author, swearReplacementBlacklist[i])){
				canTextReplace=false;
			}
		}
		if (bannedCount>(message.content.split(" ").length+1)*0.3){ //if the censored message is over 30% censored words, counted by spaces, don't send a replacement message
			canTextReplace=false;
		}
		if (canTextReplace){
			channel.sendMessage(banned[toDelete][1]+"\n`"+author.username+": "+newMessage+"`").then(e => censorMessageDeletionQueueLong(e));
			if (messageAuthorEquals(message, "247163799960944640")){  //this part is for candy's special reactions
				annoyCandyman(message.channel);				    //^
				botCanYellAtCandy=false;					   //^
			}
		} else {
			console.log("Was caught in the censor: "+author.username+": "+newMessage);
		}
		censorUpdateSwearTable(author);  //the censor now updates the super secret table of swears (the one that master has an unfair advantage on probably)
		totalCensoredLines++;			 //censored line counter
		message.delete();		     	 //needs more comments
		return true;				 //it did get censored
	}
	return false; //message is clean and checks otu
}

// Adds a message to the short-term deletion log.
function censorMessageDeletionQueue(message){
	deletionQueue.push(message);
}

// Clears the short-term deletion log.
function censorClearDeletionQueue(){
	for (var i=0; i<deletionQueue.length; i++){
		deletionQueue[i].delete();
	}
	deletionQueue=[];
}

// Adds a message to the long-term deletion log.
function censorMessageDeletionQueueLong(message){
	deletionQueueLong.push(message);
}

// Clears the long-term deletion log.
function censorClearDeletionQueueLong(){
	for (var i=0; i<deletionQueueLong.length; i++){
		deletionQueueLong[i].delete();
	}
	deletionQueueLong=[];
}

// Updates the swear table, and saves it
function censorUpdateSwearTable(user){
	var n=authorString(user);
	if (!(n in userTable)){
		userTable[n]=new User(user.username, user.discriminator);
		userTable[n].swears=1;
	} else {
		userTable[n].swears++;
	}
	utilitySaveStats();
}

// Converts "regional indicator" letters to regular leters.
function censorRemoveRegionalIndicators(text){
	var newString="";
	var continueNext=false;
	for (var i=0; i<text.length; i++){
		var character=text.charCodeAt(i);
		if (character==55356){
			continue;
		}
		if (continueNext){
			continueNext=false;
			continue;
		}
		if (character>=56806&&character<=56831){
			character=character-(56806-97);
			continueNext=true;
		}
		newString=newString+String.fromCharCode(character);
	}
	return newString;
}

function censorCommandSet(message){
	if (userHasKickingBoots(message.author, message.channel)){
		var command=message.content.replace("e!censor", "").split(" ");
		if (command[0]===""||command[0]==="-help"){
			message.channel.sendMessage("Note that only people with kicking boots can access these commands and they're best used in moderation channels only.\n\n"+
										"```e!censor-add <phrase>,<instruction>,<replacement>\n"+
										"e!censor-add-help\n"+
										"e!censor-remove <phrase>\n"+
										"e!censor-remove-help\n"+
										"e!censor-all\n"+
										"e!censor-all-help```");
		} else if (command[0]==="-add"){
			var input="";
			for (var i=1; i<command.length; i++){
				input=input+command[i];
				if (i<command.length-1){
					input=input+" ";
				}
			}
			var csv=input.split(",");
			if (csv.length<3){
				message.channel.sendMessage("Incorrect usage; refer to `e!censor-help` for more details`");
				return false;
			}
			console.log(csv);
			var prospective=csv[0];
			var exists=false;
			var index=0;
			for (var i=0; i<banned.length; i++){
				if (banned[i][0].toLowerCase()===prospective.toLowerCase()){
					exists=true;
					index=i;
					break;
				}
			}
			if (exists){
				message.channel.sendMessage("That word or phrase already exists in the censor list. Updating it instead!");
				banned[index][0]=prospective;
				banned[index][1]=csv[1];
				banned[index][2]=csv[2];
			} else {
				index=banned.length;
				message.channel.sendMessage("Added that to the censor list!");
				banned.push(["", "", ""]);
				banned[index][0]=prospective;
				banned[index][1]=csv[1];
				banned[index][2]=csv[2];
			}
			censorSaveList();
		} else if (command[0]==="-add-help"){
				message.channel.sendMessage("```e!censor-add <phrase>,<instruction>,<replacement>```"+
										"Adds a message to the censor.\n"+
										"	`<phrase>` is the text to ban. If it's already part of the censor it'll be updated instead.\n"+
										"	`<instruction>` is the warning message sent, i.e. \"potty mouth!\"\n"+
										"	`<replacement>` is the text the bad word is replaced with, i.e. \"SKITTY\"");
		} else if (command[0]==="-remove"){
			var input="";
			for (var i=1; i<command.length; i++){
				input=input+command[i];
				if (i<command.length-1){
					input=input+" ";
				}
			}
			var exists=false;
			var index=0;
			for (var i=0; i<banned.length; i++){
				if (banned[i][0].toLowerCase()===input.toLowerCase()){
					exists=true;
					index=i;
					break;
				}
			}
			if (exists){
				message.channel.sendMessage("Removed from the censor!");
				banned.splice(index, 1);
				censorSaveList();
			} else {
				message.channel.sendMessage("That isn't part of the censor!");
			}
		} else if (command[0]==="-remove-help"){
				message.channel.sendMessage("```e!censor-remove <phrase>```"+
										"Removes `phrase` from the censor.\n");
		} else if (command[0]==="-all"){
			//message.author.openDM().then(function(dm){
			client.Users.get(message.author.id).openDM().then(function(dm){
				var str="";
				for (var i=0; i<banned.length; i++){
					str=str+banned[i][0]+","+banned[i][1]+","+banned[i][2]+"\n";
				}
				dm.sendMessage("```Banned words in the server:\nWord,Instruction,Replacement\n"+str+"```");
			});
			message.channel.sendMessage("Sent you a thing (hopefully)!");
		} else if (command[0]==="-all-help"){
			message.channel.sendMessage("```e!censor-all```"+
										"Sends you a list of all the banned words as a PM (I'd spit them out here except the list can be quite long, and in any case the bot would censor itself anyway.)");
		}
	}
	return true;
}

function censorSaveList(){
	var saveString="";
	for (var i=0; i<banned.length; i++){
		saveString=saveString+banned[i][0]+","+banned[i][1]+","+banned[i][2]+"\r\n";
	}
	fs.writeFile("swears.csv", saveString, function(err) {
		if(err) {
			return console.log(err);
		}
	});
}

function censorLoadList(){
	var lines;
	fs.readFile("swears.csv", function(err, data){
		if(err){
			throw err;
		}
		lines = data.toString().split('\n');
		banned=[];
		for (var i=0; i<lines.length; i++){
			var csv=lines[i].split(",");
			if (csv.length>=3){
				banned.push([csv[0], csv[1], csv[2]]);
			}
		}
	});
}

/*
 ********************
 *   Picture stuff  *
 ********************
 */

function waifuSend(channel){
	channel.uploadFile("waifus\\"+waifus[Math.floor(Math.random()*waifus.length)]);
}

function catSend(channel){
	channel.uploadFile(".\\cats\\"+cats[Math.floor(Math.random()*cats.length)]);
}

/*
 ********************
 *     Utilities    *
 ********************
 */

// Sets the currently playing game
function utilityGame(e){
	if (userHasKickingBoots(e.message.author, e.message.channel)){
		client.User.setGame(e.message.content.replace("e!game ", ""));
		e.message.channel.sendMessage("New game: "+e.message.content.replace("e!game ", ""));
	} else {
		e.message.channel.sendMessage("You don't have permission to do that, sorry.");
	}
}


function utilitySaveLine(line){
	fs.appendFile("log.txt", line+"\r\n", (err) => {
		if (err){
			throw err;
		}
	});
}

function utilityHug(e){
	var target=e.message.content.replace("e!hug ", "");
	if (target.startsWith("e!hug")){
		target=e.message.author.username;
	}
	e.message.channel.sendMessage("_hugs "+target+"_");
}

function utilitySandwich(e){
	var target=e.message.content.toLowerCase().replace("e!sandwich ", "");
	if (target.startsWith("e!sandwich")){
		target=e.message.author.username;
	}
	e.message.channel.sendMessage("_gives a sandwich to "+target+"_");
}
 
 // Loads in the stored values from the swear table.

function utilityCreateUserTable(){
	var lines;
	fs.readFile("stats.csv", function(err, data){
		if(err){
			throw err;
		}
		lines = data.toString().split('\n');
		for (var i=0; i<lines.length; i++){
			if (lines[i].includes(",undefined")){
			} else {
				var spl=lines[i].split(",");
				
				var user=new User(spl[0].split("#")[0], spl[0].split("#")[1]);
				userTable[spl[0]]=user;
				user.swears=Number(spl[1]);
				user.slaps=Number(spl[2]);
				user.zeal=Number(spl[3]);
				user.toilet=Number(spl[4]);
				
				user.actions=Number(spl[5]);
				user.questions=Number(spl[6]);
				user.exclamations=Number(spl[7]);
				
				user.lines=Number(spl[8]);
				user.secretWord=Number(spl[9]);
				user.secretWordAdd=Number(spl[10]);
				
				if (spl.length>=12){
					user.elvia=Number(spl[11]);
				}
				if (spl.length>=13){
					user.todayActions=Number(spl[12]);
					user.todayViolence=Number(spl[13]);
					user.todayWarnings=Number(spl[14]);
					user.totalWarnings=Number(spl[15]);
				}
				if (spl.length>=17){
					user.silver=Number(spl[16]);
				}
			}
		}
	});
}

function utilitySaveBotStats(){
	var saveString=totalBotCommands+","+totalCensoredLines;
	fs.writeFile("botstats.csv", saveString, function(err) {
		if(err) {
			return console.log(err);
		}
	});
}

function utilityLoadBotStats(){
	var line;
	fs.readFile("botstats.csv", function(err, data){
		if(err){
			throw err;
		}
		line=data.toString();
		var spl=line.split(",");
		switch (spl.length){
			case 2:
				totalBotCommands=Number(spl[0]);
				totalCensoredLines=Number(spl[1]);
			case 0:
				break;
		}
	});
}
 
 // Saves all of the stats
 
 function utilitySaveStats(){
	var saveString="";
	for (var n in userTable){
		var user=userTable[n];
		saveString=saveString+n+","+user.swears+
			","+user.slaps+","+user.zeal+","+user.toilet+
			","+user.actions+","+user.questions+","+user.exclamations+
			","+user.lines+","+user.secretWord+","+user.secretWordAdd+
			","+user.elvia+
			
			","+user.todayActions+","+user.todayViolence+","+user.todayWarnings+","+user.totalWarnings+
			","+user.silver+
			"\r\n";
	}
	fs.writeFile("stats.csv", saveString, function(err) {
		if(err) {
			return console.log(err);
		}
	});
 }

// Utility that prints out the number of lines in the bot's learned database.
function utiliyLineCount(e){
	var lines;
	fs.readFile("line.txt", function(err, data){
		if(err){
			e.message.channel.sendMessage("Something blew up. Oh noes! @Dragonite#7992");
			throw err;
		}
		lines = data.toString().split('\n');
		e.message.channel.sendMessage(lines.length+" lines in "+myNick+"'s quote log.");
	})
}
function utilityGenCount(e){
	var lines;
	fs.readFile("generallines.txt", function(err, data){
		if(err){
			e.message.channel.sendMessage("Something blew up. Oh noes! @Dragonite#7992");
			throw err;
		}
		lines = data.toString().split('\n');
		e.message.channel.sendMessage(lines.length+" lines in "+myNick+"'s General quote log.");
	})
	
}
function utilityActCount(e){
	var lines;
	fs.readFile("generallinesactions.txt", function(err, data){
		if(err){
			e.message.channel.sendMessage("Something blew up. Oh noes! @Dragonite#7992");
			throw err;
		}
		lines = data.toString().split('\n');
		e.message.channel.sendMessage(lines.length+" lines in "+myNick+"'s General quote log.");
	})
	
}
// Prints out the high score table for the censor
function utilityStats(e){
	var statsString="SOME INANE STATS THAT DRAGONITE COLLECTS";
	var highscoreList=__createDefaultHighScoreList();
	statsString+=utilityAppendHR();		// Slaps
	highscoreList.sort(function(a, b){
		return b.slaps-a.slaps;
	});
	statsString+=highscoreList[0].name+" was rather slap happy, dishing out a solid backhand "+highscoreList[0].slaps+" times.\n";
	statsString+=highscoreList[1].name+" was "+utilityComparisonString(highscoreList[0].slaps, highscoreList[1].slaps)+", using the move "+highscoreList[1].slaps+" times.";
	statsString+=utilityAppendHR();		// Toilets
	highscoreList.sort(function(a, b){
		return b.toilet-a.toilet;
	});
	statsString+=highscoreList[0].name+" has a rather peculiar obsession with toilets, saying the word "+highscoreList[0].toilet+" times.\n";
	statsString+=highscoreList[1].name+" was "+utilityComparisonString(highscoreList[0].toilet, highscoreList[1].toilet)+", with "+highscoreList[1].toilet+" in total.";
	statsString+=utilityAppendHR();		// Zeal
	highscoreList.sort(function(a, b){
		return b.zeal-a.zeal;
	});
	statsString+=highscoreList[0].name+" was eager to proclaim their love for the King, saying his name a whopping "+highscoreList[0].zeal+" times.\n";
	statsString+=highscoreList[1].name+" was also "+utilityZealString()+", with "+highscoreList[1].zeal+" references to the King.";
	statsString+=utilityAppendHR();		// Actions
	highscoreList.sort(function(a, b){
		return b.actions-a.actions;
	});
	statsString+=highscoreList[0].name+" greatly enjoyed role playing, writing "+highscoreList[0].actions+" lines as actions.\n";
	statsString+=highscoreList[1].name+" was "+utilityComparisonString(highscoreList[0].actions, highscoreList[1].actions)+", with "+highscoreList[1].actions+" in total.";
	statsString+=utilityAppendHR();		// Questions
	highscoreList.sort(function(a, b){
		return b.questions-a.questions;
	});
	statsString+=highscoreList[0].name+" has an insatiable thirst for knowledge, "+highscoreList[0].questions+" questions in total.\n";
	statsString+=highscoreList[1].name+" was "+utilityComparisonString(highscoreList[0].questions, highscoreList[1].questions)+", with "+highscoreList[1].questions+" all told.";
	statsString+=utilityAppendHR();		// Exclamations
	highscoreList.sort(function(a, b){
		return b.exclamations-a.exclamations;
	});
	statsString+="People probably wish "+highscoreList[0].name+" would pipe down a bit, after hearing them shout "+highscoreList[0].exclamations+" times!\n";
	statsString+=highscoreList[1].name+" was "+utilityComparisonString(highscoreList[0].exclamations, highscoreList[1].exclamations)+", raising their voice on "+highscoreList[1].exclamations+" occasions.";
	statsString+=utilityAppendHR();		// Lines
	highscoreList.sort(function(a, b){
		return b.lines-a.lines;
	});
	statsString+=highscoreList[0].name+" talks a bit too much, writing "+highscoreList[0].lines+" total lines since joining the server.\n";
	statsString+=highscoreList[1].name+" was "+utilityComparisonString(highscoreList[0].lines, highscoreList[1].lines)+", with "+highscoreList[1].lines+" of the things.";
	//statsString+="\n\n*Note that this only counts stats collected while Dragonite's computer was turnd on.";
	e.message.channel.sendMessage("```"+statsString+"```");
}
	
function utilityComparisonString(a, b){
	var f=b/a;
	var responses;
	if (f>0.9){
		responses=["a close second", "right there", "vying for the honor", "right on their heels", "in close competition"];
	} else if (f>0.5){
		responses=["not far too behind", "making an effort", "up and coming", "within sight"];
	} else {
		responses=["nowhere in sight", "not trying very hard", "only mildly interested"];
	}
	return responses[Math.floor(Math.random()*responses.length)];
}

function utilityZealString(){
	var responses=["enthralled by the royalty", "in awe"]
	return responses[Math.floor(Math.random()*responses.length)];
}

// Dumps all of the people in the userTable without sorting it.
function __createDefaultHighScoreList(){
	var list=[];
	for (var o in userTable){
		if (userTable[o].name.length>0){
			var user=userTable[o];
			if (user.name!="Tatsumaki"&&user.discriminator!=8792){
				list.push(userTable[o]);
			}
		}
	}
	return list;
}

// append a long line of dashes
function utilityAppendHR(){
	return "\n-----------------\n";
}

// Master wants to play ping pong.
function utilityPing(e){
	var now=Date.now();
	e.message.channel.sendMessage("Ping Pong Pun").then(e => utilityPingTimeElapsed(e, now));
	console.log("Pinged the bot, blah, blah.");
}

// Is a message an action?
function utilityIsAction(string){
	var first=string.substring(0,1);
	if (first!="*"&&first!="_"){
		return false;
	}
	return string.endsWith(first);
}

// Follow-up for utilityPing
function utilityPingTimeElapsed(message, now){
	var n=Date.now()-now;
	message.edit(message.content+": `"+n+" ms`");
}

// Mentions the bot?
function utilityMentionsMe(message){
	for (var i=0; i<message.mentions.length; i++){
		if (message.mentions[i].username==client.User.username&&message.mentions[i].discriminator==client.User.discriminator){
			return true;
		}
	}
	return false;
}

function utilityMessageWasWrittenByMe(message){
	return message.author.username==client.User.username&&message.author.discriminator==client.User.discriminator;
}

// Utility that dumps all of the messages in a server.
function utilityDumpServer(e){
	console.log("***"+e.message.channel.name+"***");
	fetchMessagesEx(e.message.channel, 10000);
}

// fetch more messages just like Discord client does
function fetchMessagesEx(channel, left) {
  // message cache is sorted on insertion
  // channel.messages[0] will get oldest message
  var before = channel.messages[0];
  return channel.fetchMessages(Math.min(left, 100), before)
         .then(e => onFetch(e, channel, left));
}

// What to do when you fetch a batch of messages.
function onFetch(e, channel, left) {
	if (!e.messages.length){
		return Promise.resolve();
	}
	left -= e.messages.length;
	console.log(`Received ${e.messages.length}, left: ${left}`);
	for (var i=0; i<e.messages.length; i++){
		var message=e.messages[i];
		/////////
		//STATS(message);
		/////////
		var str=message.author.username+":\t"+e.messages[i].content+"\r\n"
		fs.appendFile("channeldump.txt", str, (err) => {
			if (err){
				throw err;
			}
		});
	}
	if (left <= 0){
		return Promise.resolve();
	}
	return fetchMessagesEx(channel, left);
}

function utilityPinned(ey, canalside){
	fotchPinned(ey, canalside);
}

function fotchPinned(channel, retchannel){
	return channel.fetchPinned().then(e => onFetchPinned(e, retchannel));
}

function onFetchPinned(e, channel){
	channel.sendMessage(e.messages.length+" pinned messages");
}

function fetchPinnedSelf(channel){
	if (channel==null){
		return -1;
	}
	return channel.fetchPinned().then(e => onFetchPinnedSelf(e, channel));
}

function onFetchPinnedSelf(e, channel){
	if (e.messages.length==50){
		if (!hasBuggedDracoAboutPins){
			channel.sendMessage("Hey! You've hit the pin limit for this channel! <@!218843275824463872> , you'd better do something about that.");
			hasBuggedDracoAboutPins=true;
		}
	} else {
		hasBuggedDracoAboutPins=false;
	}
}

function fetchPinnedAuto(channel){
	if (channel==null){
		return -1;
	}
	return channel.fetchPinned().then(e => onFetchPinnedAuto(e, channel));
}

function onFetchPinnedAuto(e, channel){
	if (e.messages.length==50){
		if (!hasBuggedDracoAboutPins){
			channel.sendMessage("Hey! You've hit the pin limit for this channel! <@!218843275824463872> , you'd better do something about that.");
			hasBuggedDracoAboutPins=true;
		}
	} else {
		hasBuggedDracoAboutPins=false;
	}
}

// Checks to see if a message was written by a certain perosn.
function messageAuthorEquals(message, id){
	return authorEquals(message.author, id);
}

function authorEquals(author, id){
	return author.id==id;
}

function authorString(user){
	return user.username+"#"+user.discriminator;
}

// Because for some inane reason JavaScript does not include this on its own. Inefficient.
function replaceAll(string, toReplace, newString){
	var t=string;
	while (t.includes(toReplace)){
		t=t.replace(toReplace, newString);
	}
	return t;
}

/*
 ********************
 *       Help       *
 ********************
 */

// Prints an introduction to the bot
function helpHelpHelp(e){
	var message=myNick+" is a Discord bot for the Kingdom/Harem of Zeal. There's a few things it does. "+
		"Type one of the following to learn more:\n\n"+
		"e!help Says\n"+
		"e!help Twitch\n"+
		"e!help Lol\n"+
		"e!help Misc\n"+
		"e!help Reactions\n"+
		"e!help Mods\n\n"+
		"e!help Credits\n\n"+
		"All commands are case insensitive.";
	e.message.channel.sendMessage("```"+message+"```");
}

// Introduction to quotes
function helpSays(e){
	var message=myName+"\n\n"+
		myNick + " is a deep learning AI that is well on its way to global conquest. " + 
		"The original function of "+myNick+" (then \"EyanSays\") was to "+
		"store all of the weird things that the King of Zeal says during "+
		"his Twitch streams, but it's kind of ballooned from there. Anyway, "+
		"people with kicking boots can add quotes with \"e!says-add <message>\"."+
		"To grab a random quote out of the archive, type "+myNick+". "+
		"Use \"e!size\" to see how many of Eyan's lines have been recorded, \"e!sgen\" for general lines (theres a ton), and \"e!sact\" for action lines.\n\n"+
		"If the King of Zeal says something you think is worthy of being added to the archive, ask "+
		"someone with kicking boots to do it for you."+
		"If you're not sure if you have kicking boots or not, you can check with \"e!test\" (but you "+
		"probably don't).";
		
	e.message.channel.sendMessage("```"+message+"```");
}

// Introduction to Twitch
function helpTwitch(e){
	var message="Twitch Stuff\n\n"+
		myNick+" will monitor the state of Zeal's Twitch stream, and can notify the server "+
		"when he goes live. If you want to find out if he's live or not, type \"e!live\" and "+myNick+" "+
		"will inform you."
	e.message.channel.sendMessage("```"+message+"```");
}

// Introduction to Lol
function helpLol(e){
	var message="Poking fun at people\n\n"+
		myNick+" has a few commands for messing with people. Currently available are:\n\n"+
		"e!will\n"+
		"e!gummy\n"+
		"e!gummy-b\n"+
		"e!gummy-c\n"+
		"e!dragonite\n"+
		"e!dragonite-b\n"+
		"e!candy\n"+
		"e!candy-b"+
		"e!rainy\n"+
		"e!deci\n"+
		"e!ida\n"+
		"\n"+
		"Exactly how to get your own command is a secret.";
	
	e.message.channel.sendMessage("```"+message+"```");
}
	
// Introduction to Pictures
function helpPictures(e){
	var message="Miscellaneous Stuff\n\n"+
		myNick+" can embed a few fancy images into the channel. They're kinda broken though.\n\n"+
		"e!waifu\n"+
		"e!cat";
	e.message.channel.sendMessage("```"+message+"```");
}

// Introduction to Misc
function helpMisc(e){
	var message="Miscellaneous Stuff\n\n"+
		myNick+" can do a few other things, too.\n\n"+
		"e!ping\n"+
		"e!stats\n"+
		"e!hug\n"+
		"e!sandwich\n"+
		"e!bot\n"+
		"e!pinned (optionally also input a channel to check) \n"+
		"e!game <game>\n"+
		"e!treason\n"+
		"e!back";
	e.message.channel.sendMessage("```"+message+"```");
}

// Moderation panels
function helpMods(e){
	var prefix="~~The mods are beyond help~~";
	var message="Anyway . . . if you have kicking boots, there are a few control panels you can access. "+
		"(Or at least there's one important control panel at the moment, more may be added in the future.)\n"+
		"e!censor\n\n";
		
	e.message.channel.sendMessage(prefix+"```"+message+"```");
}

// Reactionary stuff
function helpReactions(e){
	var message=myNick+" can and sometimes will react to certain lines in the chat."+
		"I'm not telling you what these reactions are or how to trigger them, because "+
		"it'll be funnier when people discover them on their own.";
	e.message.channel.sendMessage("```"+message+"```");
}

// Credits, obviously
function helpCredits(e){
	var message="Credits\n\n"+
		"***"+myName+"***\n\n"+
		"Creator: Dragonite#7992\n"+
		"Version: 1.3.0\n"+
		"Library: Discordie\n"+
        "Did stuff when I was too lazy to: Master9000#6373\n\n"+
		"https://www.youtube.com/c/dragonitespam \n\n"+
		"Extra ideas came from SuperDragonite2172, willofd, Cadance and probably other people.\n\n"+
		"Thanks to basically everyone on the Kingdom of Zeal server for testing this thing.";
	e.message.channel.sendMessage("```"+message+"```");
}

function woeMessage(user){
	client.Channels.get(WOE).sendMessage("Yo, **"+user.username+"!** If you can see this, it probably means you were temporarily restricted from using the Discord server.  If you are here, you should:\n"+
		"1.  Reread the #northcape--rules.\n"+
		"2.  Patiently wait out your banishment.  Usually a Guru will set a reminder for how long they plan to keep you Banished here.\n"+
		"3.  Correct your behavior so you don't end up here again.  Reminder, if you get banned, it will be PERMANENT!\n"+
		"4.  If you need to contact a Guru, please do it here (or via PM, I guess).  Refrain from bothering mods with trivial nonsense and **DO NOT** contact the King of Zeal.\n"+
		"5.  You will still have the ability to read channels throughout the duration of your banishment but will be prohibited from typing or speaking.\n"+
		"Note for Gurus:  Please set a reminder when you banish somebody with \"t!remind [Unban XYZ] in X hours/days .  Try to set ban timers for 6 hours, or one day/week/month.");
}
  /**
   * Makes a request to add a reaction to this message with the specified
   * emoji.
   * @param {Object|String} emoji
   * Partial emoji `{id: String|null, name: String}` or a unicode emoji
   * @return {Promise}
   * @example
   * message.addReaction(message.reactions[0].emoji);
   * message.addReaction("\uD83D\uDE2C");
   * /
  function addReaction(emoji) {
    emoji = Utils.emojiToCode(emoji);

    return rest(this._discordie)
      .channels.addReaction(this.channel_id, this.id, emoji);
   }*/
 function timeConverter(UNIX_timestamp){
	var a = new Date(UNIX_timestamp -14400);
	var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
	var year = a.getFullYear();
	var month = months[a.getMonth()];
	var date = a.getDate();
	var hour = a.getHours();
	var min = a.getMinutes();
	var sec = a.getSeconds();
	var time = month + ' ' + date + ',' + year;
	return time;
}
//send the message to the channel tostring in skarm
function sien(message){
client.Channels.get("430545618314985504").sendMessage(message);
}
function utilityEmotes(message){
	try{
	var sub = message.content.substring(8);
	var messageID = sub.substring(0, sub.indexOf(" "));
	var remains = sub.substring(sub.indexOf(" ")+1);
	sien("sub = " + sub);
	sien("messageID = " + messageID);
	sien("remains = " + remains);
	var actedOnMessage = client.Messages.get(messageID);
	sien("1" + actedOnMessage.content + "`\nIt will be done");
						//try{
	actedOnMessage.addReaction(remains);
						//}
						//
	}
	catch(err){
		message.channel.sendMessage("It borked");
	}
}