import type { ReactElement } from "react";
import WebSocket, { WebSocketServer } from "ws";
import { v4 as uuid } from "uuid";

const server = new WebSocketServer({ port: 8008 });

interface User {
  id: string;
  ws: WebSocket;
  name: string;
  avatar: ReactElement;
}

const rooms: Map<string, User[]> = new Map();

server.on("connection", (ws) => {
  ws.on("error", (err) => console.log("error while connecting server ", err));

  ws.on("open", () => console.log("connection done"));

  ws.on("message", (event) => {
    const parsedData = JSON.parse(event.toString());

    console.log("this is the parsed data ", parsedData);

    if (parsedData.type === "CREATE_JOIN_ROOM") {
      const { name, avatar, roomName } = parsedData.payload;

      if (!rooms.has(roomName)) {
        rooms.set(roomName, []);
      }

      rooms.get(roomName)?.push({
        id: uuid(),
        name,
        avatar,
        ws,
      });

      rooms.get(roomName)?.forEach((usr) => {
        usr.ws.send(
          JSON.stringify({
            type: "CREATE_JOIN_ROOM",
            roomName: roomName,
            users: rooms.get(roomName) ?? [],
          })
        );
      });
    }

    if (parsedData.type === "DRAW") {
      const { path, roomName } = parsedData.payload;

      const room = rooms.get(roomName);

      if (room) {
        room.forEach((usr) => {
          usr.ws.send(
            JSON.stringify({
              type: "DRAW",
              path,
            })
          );
        });
      }
    }
  });
});
