import {
  type HalfWord,
  type Room,
  type User,
  MESSAGE_TYPE,
} from "@repo/common/common";
import WebSocket, { WebSocketServer } from "ws";
import { random_words } from "./utils";

interface ExtendedWebSocket extends WebSocket {
  userId: string;
  roomId: string;
}

const server = new WebSocketServer({ port: Number(process.env.PORT) });

let rooms: {
  room: Room;
  users: User[];
}[] = [];

const generate = () => {
  const randomIndex = Math.floor(Math.random() * random_words.length);
  return random_words[randomIndex]?.split(", ")!;
};

// roomId and right_word
let rightWords: Map<string, string> = new Map();

server.on("connection", (ws: ExtendedWebSocket) => {
  console.log("connected");
  ws.on("message", (data) => {
    const parsedData = JSON.parse(data.toString());
    console.log("received data ", parsedData);

    if (parsedData.type === MESSAGE_TYPE.CREATE_ROOM) {
      const {
        players,
        rounds,
        draw_time,
        language,
        character,
        userName,
        id,
        status,
        userId,
      } = parsedData.data;

      const custom_word = generate();

      const roomId = id;

      // why?? because if we are using just a normal setinterval timer then it is based on
      // the performance of client like number of tabs opened and etc...
      const time_based_draw_time = Date.now() + draw_time * 1000;

      ws.roomId = id;
      ws.userId = userId;

      rooms.push({
        room: {
          id: roomId,
          players,
          rounds,
          draw_time,
          roundEndsAt: time_based_draw_time,
          language,
          custom_word,
          status,
          latest_round: 0,
          total_round: 0,
        },
        users: [
          {
            id: userId,
            name: userName,
            character,
            ws,
            type: "admin",
            status: "idol",
            points: 0,
          },
        ],
      });

      const room = rooms.find((rm) => rm.room.id === roomId);

      ws.send(
        JSON.stringify({
          type: parsedData.type,
          data: {
            room,
          },
        }),
      );
    }

    if (parsedData.type === MESSAGE_TYPE.JOIN_ROOM) {
      const { roomId, name, character, userId } = parsedData.data;

      const room = rooms.find((rm) => rm.room.id === roomId);

      if (!room) {
        ws.send(
          JSON.stringify({
            type: MESSAGE_TYPE.MESSAGE,
            data: {
              message: "Room with the give Id not found",
              from: "server",
            },
          }),
        );
        return;
      }

      if (room.users.length === room.room.players) {
        ws.send(
          JSON.stringify({
            type: MESSAGE_TYPE.MESSAGE,
            data: {
              message: "Room is already full",
              from: "server",
            },
          }),
        );
        return;
      }

      if (room.room.status === "ended") {
        ws.send(
          JSON.stringify({
            type: MESSAGE_TYPE.MESSAGE,
            data: {
              message: "Room already ended",
              from: "server",
            },
          }),
        );
        return;
      }

      ws.userId = userId;
      ws.roomId = roomId;

      room.users.push({
        id: userId,
        name,
        character,
        type: "member",
        status: "idol",
        ws,
        points: 0,
      });

      room.users.forEach((usr) =>
        usr.ws.send(
          JSON.stringify({
            type: parsedData.type,
            data: {
              room,
            },
          }),
        ),
      );
    }

    if (parsedData.type === MESSAGE_TYPE.JOIN_RANDOM) {
      const { name, character, language, userId } = parsedData.data;

      let finalRoom: {
        room: Room;
        users: User[];
      }[] = [];

      // running the loop for finding available rooms
      rooms.forEach((rm) => {
        if (
          rm.room.language === language &&
          rm.users.length < rm.room.players &&
          rm.room.status !== "ended"
        ) {
          finalRoom.push(rm);
        }
      });

      // generating random index
      const randomIndex = Math.floor(Math.random() * finalRoom.length)!;

      // finding random room from the available rooms
      const availableRoom = finalRoom[randomIndex];

      if (!availableRoom) {
        ws.send(
          JSON.stringify({
            type: MESSAGE_TYPE.MESSAGE,
            data: {
              message: "There are no available room at this moment",
              from: "server",
            },
          }),
        );
        return;
      }

      ws.userId = userId;
      ws.roomId = availableRoom.room.id;

      availableRoom.users.push({
        id: userId,
        name,
        character,
        type: "member",
        ws,
        status: "idol",
        points: 0,
      });

      availableRoom.users.forEach((usr) =>
        usr.ws.send(
          JSON.stringify({
            type: parsedData.type,
            data: {
              room: availableRoom,
            },
          }),
        ),
      );
    }

    if (parsedData.type === MESSAGE_TYPE.START_GAME) {
      const { roomId, userId } = parsedData.data;

      const room = rooms.find((rm) => rm.room.id === roomId);

      if (!room) {
        ws.send(
          JSON.stringify({
            type: MESSAGE_TYPE.MESSAGE,
            data: {
              message: "Room with the give Id not found",
              from: "server",
            },
          }),
        );
        return;
      }

      const user = room.users.find((usr) => usr.id === userId);

      if (!user) {
        ws.send(
          JSON.stringify({
            type: MESSAGE_TYPE.MESSAGE,
            data: {
              message: "User with the give id not found",
              from: "server",
            },
          }),
        );
        return;
      }

      if (room.users.length === 1) {
        ws.send(
          JSON.stringify({
            type: MESSAGE_TYPE.MESSAGE,
            data: {
              message: "you need atleast 2 players to start the game",
              from: "server",
            },
          }),
        );
        return;
      }

      if (room.room.total_round === room.users.length * room.room.rounds) {
        room.users.forEach((usr) => {
          usr.ws.send(
            JSON.stringify({
              type: MESSAGE_TYPE.GAME_END,
              data: {
                message: "game ends",
                room,
              },
            }),
          );
        });
        rightWords.delete(room.room.id);
        const filterdRooms = rooms.filter((rm) => rm.room.id !== room.room.id);
        rooms = filterdRooms;
        return;
      }

      const time_based_draw_time = Date.now() + room.room.draw_time * 1000;
      room.room.roundEndsAt = time_based_draw_time;
      room.room.startedAt = Date.now();
      room.room.status = "ongoing";
      room.room.total_round! += 1;
      room.room.latest_round! = Math.floor(
        room.room.total_round! / room.users.length,
      );

      const isAllUserDone = room.users.every((usr) => usr.turn === true);

      if (isAllUserDone) {
        room.users.forEach((usr) => {
          usr.turn = false;
        });
      }

      // const randomIndex = Math.floor(Math.random() * room.users.length)!;
      // const chooser = room.users[randomIndex]!;

      let chooser: User;

      room.users.forEach((usr) => {
        if (usr.turn === true) return;
        chooser = usr;
      });

      chooser!.status = "chooser";
      chooser!.turn = true;

      const newUsers = room.users.filter((usr) => usr.id !== chooser!.id);

      newUsers.forEach((usr) => {
        usr.status = "guesser";
      });

      room.users = [...newUsers, chooser!];

      chooser!.ws.send(
        JSON.stringify({
          type: MESSAGE_TYPE.YOU_ARE_CHOOSER,
          data: {
            room,
            round: room.room.latest_round,
          },
        }),
      );

      newUsers.forEach((usr) => {
        usr.ws.send(
          JSON.stringify({
            type: MESSAGE_TYPE.SOMEONE_CHOOSING,
            data: {
              room,
              round: room.room.latest_round,
              chooser: {
                name: chooser.name,
                character: chooser.character,
              },
            },
          }),
        );
      });
    }

    if (parsedData.type === MESSAGE_TYPE.ROUND_SUMMARY) {
      const { roomId, userId } = parsedData.data;

      const room = rooms.find((rm) => rm.room.id === roomId);

      if (!room) {
        ws.send(
          JSON.stringify({
            type: MESSAGE_TYPE.MESSAGE,
            data: {
              message: "Room with the give Id not found",
              from: "server",
            },
          }),
        );
        return;
      }

      const user = room.users.find((usr) => usr.id === userId);

      if (!user) {
        ws.send(
          JSON.stringify({
            type: MESSAGE_TYPE.MESSAGE,
            data: {
              message: "User with the give id not found",
              from: "server",
            },
          }),
        );
        return;
      }

      if (room.room.total_round === 0) {
        return;
      }

      const rightWord = rightWords.get(room.room.id);

      room.users.forEach((usr) => {
        usr.ws.send(
          JSON.stringify({
            type: parsedData.type,
            data: {
              room,
              rightWord,
            },
          }),
        );
      });
    }

    if (parsedData.type === MESSAGE_TYPE.CHOOSEN_WORD) {
      const { roomId, word, userId } = parsedData.data;

      const room = rooms.find((rm) => rm.room.id === roomId);

      if (!room) {
        ws.send(
          JSON.stringify({
            type: MESSAGE_TYPE.MESSAGE,
            data: {
              message: "Room with the give Id not found",
              from: "server",
            },
          }),
        );
        return;
      }

      const user = room.users.find((usr) => usr.id === userId);

      if (!user) {
        ws.send(
          JSON.stringify({
            type: MESSAGE_TYPE.MESSAGE,
            data: {
              message: "User with the give id not found",
              from: "server",
            },
          }),
        );
        return;
      }

      if (user.status !== "chooser") {
        ws.send(
          JSON.stringify({
            type: MESSAGE_TYPE.MESSAGE,
            data: {
              message: "You are not the chooser",
              from: "server",
            },
          }),
        );
        return;
      }

      const right_word = word.trim().toLowerCase();

      rightWords.set(room.room.id, right_word);

      // word = 'taj mahal'

      const splitedArr = right_word.split(" ");

      // splitedArr = ["taj", "mahal"]

      const totalLength: number[] = [];

      for (let i = 0; i < splitedArr.length; i++) {
        const element = splitedArr[i];
        if (!element) continue;

        totalLength.push(element.length);
      }

      // totalLength => we will map this on the frontend and render something like this
      // --- -----

      room.users.forEach((usr) => {
        usr.ws.send(
          JSON.stringify({
            type: parsedData.type,
            data: {
              totalLength,
              word: usr.ws === user.ws && right_word,
            },
          }),
        );
      });
    }

    if (parsedData.type === MESSAGE_TYPE.GUESS_WORD) {
      const { roomId, userId, word } = parsedData.data;

      const room = rooms.find((rm) => rm.room.id === roomId);

      if (!room) {
        ws.send(
          JSON.stringify({
            type: MESSAGE_TYPE.MESSAGE,
            data: {
              message: "room not found with the given id",
              from: "server",
            },
          }),
        );
        return;
      }

      if (room.room.status === "creating" || room.room.status === "ended") {
        ws.send(
          JSON.stringify({
            type: MESSAGE_TYPE.MESSAGE,
            data: {
              message: "room is ended or not started yet",
              from: "server",
            },
          }),
        );
        return;
      }

      const user = room.users.find((usr) => usr.id === userId);

      if (!user) {
        ws.send(
          JSON.stringify({
            type: MESSAGE_TYPE.MESSAGE,
            data: {
              message: "user not found with the given id",
              from: "server",
            },
          }),
        );
        return;
      }

      if (user.status === "chooser") {
        ws.send(
          JSON.stringify({
            type: MESSAGE_TYPE.MESSAGE,
            data: {
              message: "chooser cannot guess word",
              from: "server",
            },
          }),
        );
        return;
      }

      if (user.status === "idol") {
        ws.send(
          JSON.stringify({
            type: MESSAGE_TYPE.MESSAGE,
            data: {
              message:
                "you already guessed word or wait for new round to get started",
              from: "server",
            },
          }),
        );
        return;
      }

      const right_word = rightWords.get(room.room.id);

      if (word.trim().toLowerCase() !== right_word) {
        const splitedRightWord = right_word?.trim().split("") as string[];
        const splitedGuessedWord = word?.trim().split("") as string[];
        let matches = 0;

        splitedGuessedWord.forEach((chr: string, idx: number) => {
          const rightChr = splitedRightWord[idx];
          console.log("chr ", chr);
          console.log("rightChr ", rightChr);

          if (rightChr === chr) matches++;
        });
        console.log("matches", matches);
        console.log("right_word!.length / 2 ", right_word!.length / 2);

        if (matches >= right_word!.length / 2) {
          const filterdUser = room.users.filter((usr) => usr.id !== user.id);
          room.users = [...filterdUser, user];

          filterdUser.forEach((usr) => {
            usr.ws.send(
              JSON.stringify({
                type: MESSAGE_TYPE.MESSAGE,
                data: {
                  message: word,
                  from: usr.ws === ws ? "You" : user.name,
                },
              }),
            );
          });

          user.ws.send(
            JSON.stringify({
              type: MESSAGE_TYPE.MESSAGE,
              data: {
                message: "The guessed word was too close",
                from: user.name,
              },
            }),
          );
        } else {
          room.users.forEach((usr) => {
            usr.ws.send(
              JSON.stringify({
                type: MESSAGE_TYPE.MESSAGE,
                data: {
                  message: word,
                  from: usr.ws === ws ? "You" : user.name,
                },
              }),
            );
          });
        }

        return;
      }

      if (word.trim().toLowerCase() === right_word) {
        const submitedAt = Date.now();
        const diff = submitedAt - room.room.startedAt!;

        if (diff <= 30000) {
          user.points += 200;
        } else if (diff <= 10000) {
          user.points += 150;
        } else {
          user.points += 50;
        }

        user.status = "idol";

        const filterdUser = room.users.filter((usr) => usr.id !== user.id);
        room.users = [...filterdUser, user];

        room.users.forEach((usr) => {
          usr.ws.send(
            JSON.stringify({
              type: MESSAGE_TYPE.MESSAGE,
              data: {
                message: `${usr.ws === ws ? "You" : user.name} guessed the right word`,
                from: "server",
                room,
              },
            }),
          );
        });

        user.ws.send(
          JSON.stringify({
            type: MESSAGE_TYPE.RIGHT_WORD,
            data: {
              word: right_word,
            },
          }),
        );
      }

      // here we are checking if every user is idol except the chooser then
      // starting the next round
      let idolUser: number = 0;

      room.users.forEach((usr) => {
        if (usr.status === "idol") idolUser += 1;
      });

      console.log("idolUser ", idolUser);

      if (idolUser === room.users.length - 1) {
        const admin = room.users.find((usr) => usr.type === "admin");
        admin?.ws.send(
          JSON.stringify({
            type: MESSAGE_TYPE.ANOTHER_ONE,
          }),
        );
      }
    }

    if (parsedData.type === MESSAGE_TYPE.HALF_TIME) {
      const { roomId, userId } = parsedData.data;

      const room = rooms.find((rm) => rm.room.id === roomId);

      if (!room) {
        ws.send(
          JSON.stringify({
            type: MESSAGE_TYPE.MESSAGE,
            data: {
              message: "Room not found with the given Id",
              from: "server",
            },
          }),
        );
        return;
      }

      const user = room.users.find((usr) => usr.id === userId);

      if (!user) {
        ws.send(
          JSON.stringify({
            type: MESSAGE_TYPE.MESSAGE,
            data: {
              message: "User not found with the given Id",
              from: "server",
            },
          }),
        );
        return;
      }

      if (user.status !== "guesser") {
        return;
      }

      const right_word = rightWords.get(room.room.id);

      const wordLength = right_word!.length;
      const wordsToSend = Math.floor(wordLength / 2);
      let halfWord: HalfWord[] = [];

      for (let i = 1; i <= wordsToSend; i++) {
        console.log("loop is running");
        const elm = right_word![i]!;
        halfWord.push({
          elm,
          idx: i,
        });
      }

      console.log("halfWord ", halfWord);

      user.ws.send(
        JSON.stringify({
          type: MESSAGE_TYPE.HALF_WORD,
          data: {
            halfWord,
          },
        }),
      );
    }

    if (parsedData.type === MESSAGE_TYPE.DRAWING) {
      const { roomId, userId, payload } = parsedData.data;

      const room = rooms.find((rm) => rm.room.id === roomId);

      if (!room) {
        ws.send(
          JSON.stringify({
            type: MESSAGE_TYPE.MESSAGE,
            data: {
              from: "server",
              message: "room not found with the given Id",
            },
          }),
        );
        return;
      }

      const user = room.users.find((usr) => usr.id === userId);

      if (!user) {
        ws.send(
          JSON.stringify({
            type: MESSAGE_TYPE.MESSAGE,
            data: {
              from: "server",
              message: "user not found with the given id",
            },
          }),
        );
        return;
      }

      const filterdUsers = room.users.filter((usr) => usr.id !== user.id);

      filterdUsers.forEach((usr) => {
        usr.ws.send(
          JSON.stringify({
            type: parsedData.type,
            data: {
              payload,
            },
          }),
        );
      });
    }

    if (parsedData.type === MESSAGE_TYPE.CLEAR_CANVAS) {
      const { roomId, userId } = parsedData.data;

      const room = rooms.find((rm) => rm.room.id === roomId);

      if (!room) {
        ws.send(
          JSON.stringify({
            type: MESSAGE_TYPE.MESSAGE,
            data: {
              from: "server",
              message: "room not found with the given Id",
            },
          }),
        );
        return;
      }

      const user = room.users.find((usr) => usr.id === userId);

      if (!user) {
        ws.send(
          JSON.stringify({
            type: MESSAGE_TYPE.MESSAGE,
            data: {
              from: "server",
              message: "user not found with the given id",
            },
          }),
        );
        return;
      }

      room.users.forEach((usr) => {
        usr.ws.send(
          JSON.stringify({
            type: parsedData.type,
          }),
        );
      });
    }
  });

  ws.on("close", () => {
    // TODO: lets see if this works
    if (rooms.length !== 0) {
      // if user left, we will find the room
      const room = rooms.find((rm) => rm.room.id === ws.roomId);
      if (room) {
        // if room found, then will find the user
        const user = room.users.find((usr) => usr.id === ws.userId);
        if (user) {
          // TODO: we have to think how to handle this, like if the user is admin, then
          // should we delete the whole room or should we assign admin role to someone else

          // if the user found, will delete that user out
          const filterdUsers = room.users.filter((usr) => usr.id !== ws.userId);

          if (filterdUsers.length <= 1) {
            filterdUsers.forEach((usr) => {
              usr.ws.send(
                JSON.stringify({
                  type: MESSAGE_TYPE.ROOM_DELETED,
                }),
              );
            });

            rightWords.delete(room.room.id);
            // if users left 0 then delete the room too
            const filteredRooms = rooms.filter(
              (rm) => rm.room.id !== room.room.id,
            );
            rooms = filteredRooms;
          } else {
            // else will set the room's user to the filtered user
            room.users = filterdUsers;

            room.users.forEach((usr) => {
              usr.ws.send(
                JSON.stringify({
                  type: MESSAGE_TYPE.LEFT,
                  data: {
                    message: `${user.name} left the room`,
                    room,
                    from: "server",
                  },
                }),
              );
            });
          }
        }
      }
    }
  });
});
