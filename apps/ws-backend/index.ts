import { type Room, type User, MESSAGE_TYPE } from "@repo/common/common";
import { WebSocketServer } from "ws";

const server = new WebSocketServer({ port: Number(process.env.PORT) });

const rooms: {
  room: Room;
  users: User[];
}[] = [];

let round = 0;

server.on("connection", (ws) => {
  console.log("server started");

  ws.on("open", () => console.log("client connected"));

  ws.on("message", (data) => {
    const parsedData = JSON.parse(data.toString());

    if (parsedData.type === MESSAGE_TYPE.CREATE_ROOM) {
      const { name, players, rounds, draw_time, language } = parsedData.data;

      const roomId = crypto.randomUUID().slice(0, 7);

      rooms.push({
        room: {
          id: roomId,
          name,
          players,
          rounds,
          draw_time,
          language,
          right_word: null,
        },
        users: [
          {
            id: crypto.randomUUID(),
            name,
            character: name,
            ws,
            type: "admin",
            status: "idol",
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
        })
      );
    }

    if (parsedData.type === MESSAGE_TYPE.JOIN_ROOM) {
      const { roomId, name, character } = parsedData.data;

      const room = rooms.find((rm) => rm.room.id === roomId);

      if (!room) {
        ws.send(
          JSON.stringify({
            type: MESSAGE_TYPE.ERROR,
            data: {
              message: "Room with the give Id not found",
            },
          })
        );
        return;
      }

      room.users.push({
        id: crypto.randomUUID(),
        name,
        character,
        type: "member",
        status: "idol",
        ws,
      });

      room.users.forEach((usr) =>
        usr.ws.send(
          JSON.stringify({
            type: parsedData.type,
            data: {
              room,
            },
          })
        )
      );
    }

    if (parsedData.type === MESSAGE_TYPE.JOIN_RANDOM) {
      const { name, character, language } = parsedData.data;

      let finalRoom: {
        room: Room;
        users: User[];
      }[] = [];

      // running the loop for finding available rooms
      rooms.forEach((rm) => {
        if (
          rm.room.language === language &&
          rm.users.length < rm.room.players
        ) {
          finalRoom.push(rm);
        }
      });

      // generating random index
      const randomIndex = Math.floor(Math.random() * finalRoom.length)!;

      // finding room from the random index
      const availableRoom = finalRoom[randomIndex];

      if (!availableRoom) {
        ws.send(
          JSON.stringify({
            type: MESSAGE_TYPE.ERROR,
            data: {
              message:
                "There are no available room at this moment, kindly try again by changing your langugae",
            },
          })
        );
        return;
      }

      availableRoom.users.push({
        id: crypto.randomUUID(),
        name,
        character,
        type: "member",
        ws,
        status: "idol",
      });

      availableRoom.users.forEach((usr) =>
        usr.ws.send(
          JSON.stringify({
            type: parsedData.type,
            data: {
              room: availableRoom,
            },
          })
        )
      );
    }

    if (parsedData.type === MESSAGE_TYPE.START_GAME) {
      const { roomId, name } = parsedData.data;

      const room = rooms.find((rm) => rm.room.id === roomId);

      if (!room) {
        ws.send(
          JSON.stringify({
            type: MESSAGE_TYPE.ERROR,
            data: {
              message: "Room with the give Id not found",
            },
          })
        );
        return;
      }

      const admin = room.users.find((usr) => usr.name === name);

      if (!admin) {
        ws.send(
          JSON.stringify({
            type: MESSAGE_TYPE.ERROR,
            data: {
              message: "User with the give name not found",
            },
          })
        );
        return;
      }

      if (admin.type !== "admin") {
        ws.send(
          JSON.stringify({
            type: MESSAGE_TYPE.ERROR,
            data: {
              message: "You are not admin",
            },
          })
        );
        return;
      }

      if (room.users.length === 1) {
        ws.send(
          JSON.stringify({
            type: MESSAGE_TYPE.ERROR,
            data: {
              message: "you need atleast 2 players to start the game",
            },
          })
        );
        return;
      }

      if (round === room.users.length * room.room.rounds) {
        ws.send(
          JSON.stringify({
            type: MESSAGE_TYPE.GAME_END,
            data: {
              message: "rounds end",
            },
          })
        );
        return;
      }

      round++;

      const randomIndex = Math.floor(Math.random() * room.users.length)!;
      const chooser = room.users[randomIndex]!;

      chooser.status = "chooser";

      const newUsers = room.users.filter((usr) => usr.name !== chooser.name);

      newUsers.forEach((usr) => {
        usr.status = "guesser";
      });

      room.users = [...newUsers, chooser];

      room.users.forEach((usr) => {
        usr.ws.send(
          JSON.stringify({
            type: MESSAGE_TYPE.START_GUESS,
            data: {
              room,
              round,
            },
          })
        );
      });
    }

    if (parsedData.type === MESSAGE_TYPE.CHOOSEN_WORD) {
      const { roomId, word, name } = parsedData.data;

      const room = rooms.find((rm) => rm.room.id === roomId);

      if (!room) {
        ws.send(
          JSON.stringify({
            type: MESSAGE_TYPE.ERROR,
            data: {
              message: "Room with the give Id not found",
            },
          })
        );
        return;
      }

      const user = room.users.find((usr) => usr.name === name);

      if (!user) {
        ws.send(
          JSON.stringify({
            type: MESSAGE_TYPE.ERROR,
            data: {
              message: "User with the give name not found",
            },
          })
        );
        return;
      }

      if (user.status !== "chooser") {
        ws.send(
          JSON.stringify({
            type: MESSAGE_TYPE.ERROR,
            data: {
              message: "You are not the chooser",
            },
          })
        );
        return;
      }

      const right_word = word.trim();

      room.room.right_word = right_word;

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
          })
        );
      });
    }

    if (parsedData.type === MESSAGE_TYPE.GUESS_WORD) {
      const { roomId, name, word } = parsedData.data;

      const room = rooms.find((rm) => rm.room.id === roomId);

      if (!room) {
        ws.send(
          JSON.stringify({
            type: MESSAGE_TYPE.ERROR,
            data: {
              message: "room not found with the given id",
            },
          })
        );
        return;
      }

      const user = room.users.find((usr) => usr.name === name);

      if (!user) {
        ws.send(
          JSON.stringify({
            type: MESSAGE_TYPE.ERROR,
            data: {
              message: "user not found with the given name",
            },
          })
        );
        return;
      }

      if (user.status === "chooser") {
        ws.send(
          JSON.stringify({
            type: MESSAGE_TYPE.ERROR,
            data: {
              message: "chooser cannot guess word",
            },
          })
        );
        return;
      }

      if (word !== room.room.right_word) {
        ws.send(
          JSON.stringify({
            type: MESSAGE_TYPE.ERROR,
            data: {
              message: word,
            },
          })
        );
        return;
      }

      if (word === room.room.right_word) {
        room.users.forEach((usr) => {
          usr.ws.send(
            JSON.stringify({
              type: MESSAGE_TYPE.GUESSED,
              data: {
                message: `${user.ws === ws ? "You" : user.name} guessed the right word`,
              },
            })
          );
        });
      }
    }

    if (parsedData.type === MESSAGE_TYPE.DRAWING) {
      // path?: { x: number; y: number }[];
      const { roomId, name, path } = parsedData.data;

      const room = rooms.find((rm) => rm.room.id === roomId);

      if (!room) {
        ws.send(
          JSON.stringify({
            type: MESSAGE_TYPE.ERROR,
            data: {
              message: "room not found with the given Id",
            },
          })
        );
        return;
      }

      const user = room.users.find((usr) => usr.name === name);

      if (!user) {
        ws.send(
          JSON.stringify({
            type: MESSAGE_TYPE.ERROR,
            data: {
              message: "user not found with the given name",
            },
          })
        );
        return;
      }

      room.users.forEach((usr) => {
        usr.ws.send(
          JSON.stringify({
            type: parsedData.type,
            data: {
              path,
            },
          })
        );
      });
    }
  });

  ws.on("error", (err) => console.log("error in connection ", err));
});
