import { type Room, type User, MESSAGE_TYPE } from "@repo/common/common";
import WebSocket, { WebSocketServer } from "ws";

interface ExtendedWebSocket extends WebSocket {
  userId: string;
  roomId: string;
}

const server = new WebSocketServer({ port: Number(process.env.PORT) });

let rooms: {
  room: Room;
  users: User[];
}[] = [];

let round = 0;
let rightWord = "";

server.on("connection", (ws: ExtendedWebSocket) => {
  console.log("connected");
  ws.on("message", (data) => {
    const parsedData = JSON.parse(data.toString());

    if (parsedData.type === MESSAGE_TYPE.CREATE_ROOM) {
      const {
        players,
        rounds,
        draw_time,
        language,
        character,
        userName,
        id,
        custom_word,
        status,
        userId,
      } = parsedData.data;

      const roomId = id;

      ws.roomId = id;
      ws.userId = userId;

      rooms.push({
        room: {
          id: roomId,
          players,
          rounds,
          draw_time,
          language,
          custom_word,
          status,
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
            roomUrl: `${process.env.FRONTEND_URL}?roomId=${roomId}`,
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

      if (round === room.users.length * room.room.rounds) {
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
        round = 0;
        room.room.status = "ended";
        return;
      }

      room.room.startedAt = Date.now();
      room.room.status = "ongoing";
      console.log("pre round ", round);
      round = round + 1;
      console.log("post round ", round);
      room.room.latest_round = round;

      const randomIndex = Math.floor(Math.random() * room.users.length)!;
      const chooser = room.users[randomIndex]!;

      chooser.status = "chooser";

      const newUsers = room.users.filter((usr) => usr.name !== chooser.name);

      newUsers.forEach((usr) => {
        usr.status = "guesser";
      });

      room.users = [...newUsers, chooser];

      chooser.ws.send(
        JSON.stringify({
          type: MESSAGE_TYPE.YOU_ARE_CHOOSER,
          data: {
            room,
            round,
          },
        }),
      );

      newUsers.forEach((usr) => {
        usr.ws.send(
          JSON.stringify({
            type: MESSAGE_TYPE.SOMEONE_CHOOSING,
            data: {
              room,
              round,
              message: `${chooser.name} is choosing`,
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

      const right_word = word.trim();

      rightWord = right_word;

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

      if (word !== rightWord) {
        room.users.forEach((usr) => {
          usr.ws.send(
            JSON.stringify({
              type: MESSAGE_TYPE.MESSAGE,
              data: {
                message: word,
                from: user.name,
              },
            }),
          );
        });
        return;
      }

      if (word === rightWord) {
        const submitedAt = Date.now();
        const diff = submitedAt - room.room.startedAt!;

        if (diff <= 3000) {
          user.points += 200;
        } else if (diff <= 1000) {
          user.points += 150;
        } else {
          user.points += 50;
        }

        user.status = "idol";

        room.users.forEach((usr) => {
          usr.ws.send(
            JSON.stringify({
              type: MESSAGE_TYPE.MESSAGE,
              data: {
                message: `${usr.ws === ws ? "You" : usr.name} guessed the right word`,
                from: usr.ws === ws ? "You" : usr.name,
                room,
              },
            }),
          );
        });
      }
    }

    if (parsedData.type === MESSAGE_TYPE.DRAWING) {
      // path?: { x: number; y: number }[];
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

      room.users.forEach((usr) => {
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
  });

  ws.on("close", () => {
    round = 0;
    rightWord = "";
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

          // if users left 0 then delete the room too
          if (filterdUsers.length === 0) {
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
