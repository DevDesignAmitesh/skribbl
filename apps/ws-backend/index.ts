import { type Room, type User, MESSAGE_TYPE } from "@repo/common/common";
import { WebSocketServer } from "ws";

const server = new WebSocketServer({ port: Number(process.env.PORT) });

const rooms: {
  room: Room;
  users: User[];
}[] = [];

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
            name,
            isAdmin: true,
            character: name,
            ws,
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
        name,
        character,
        isAdmin: false,
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

      const availableRoom = rooms.find(
        (rm) =>
          rm.room.language === language && rm.users.length < rm.room.players
      );

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
        name,
        character,
        isAdmin: false,
        ws,
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

      if (!admin.isAdmin) {
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

      let chooser: string = "";

      const randomIndex = Math.floor(Math.random() * room.users.length)!;
      const user = room.users[randomIndex]!;

      user.status = "choosing";
      chooser = user.name;

      room.users.forEach((usr) => {
        usr.ws.send(
          JSON.stringify({
            type: MESSAGE_TYPE.START_GUESS,
            data: {
              room,
              chooser,
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

      room.room.right_word = word.trim();

      // word = 'taj mahal'

      const splitedArr = (word as string).trim().split(" ");

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
  });

  ws.on("error", (err) => console.log("error in connection ", err));
});
