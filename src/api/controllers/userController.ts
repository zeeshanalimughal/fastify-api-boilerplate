import { FastifyReply, FastifyRequest } from "fastify";
import { createUserSchema, updateUserSchema } from "../validators/userSchema";
import { UserService } from "../services/userService";
import { NotFoundException } from "../../exceptions/NotFoundException";
import { BadRequestException } from "../../exceptions/BadRequestException";

const service = new UserService();

export const createUser = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const input = createUserSchema.parse(request.body);
    const user = await service.create(input);
    if (!user) throw new BadRequestException("Failed to create user");
    reply.code(201).send(user);
  } catch (err) {
    request.log.error(err);
    throw err;
  }
};

export const getUsers = async (_: FastifyRequest, reply: FastifyReply) => {
  const users = await service.getAll();
  reply.send(users);
};

export const getUserById = async (
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
) => {
  const user = await service.getById(Number(request.params.id));
  if (!user) throw new NotFoundException("User not found");
  reply.send(user);
};

export const updateUser = async (
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
) => {
  const input = updateUserSchema.parse(request.body);
  const user = await service.update(Number(request.params.id), input);
  if (!user) throw new NotFoundException("User not found");
  reply.send(user);
};

export const deleteUser = async (
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
) => {
  const deleted = await service.delete(Number(request.params.id));
  if (!deleted) throw new NotFoundException("User not found");
  reply.code(204).send();
};
