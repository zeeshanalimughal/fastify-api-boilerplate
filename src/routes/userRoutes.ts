import { FastifyInstance } from "fastify";
import {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
} from "../controllers/userController";

export async function userRoutes(server: FastifyInstance) {
  server.post("/users", createUser);
  server.get("/users", getUsers);
  server.get("/users/:id", getUserById);
  server.put("/users/:id", updateUser);
  server.delete("/users/:id", deleteUser);
}
