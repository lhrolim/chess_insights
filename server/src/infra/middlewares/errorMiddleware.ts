import { Request, Response, NextFunction } from "express";
import getLogger from "@infra/logging/logger";

const logger = getLogger(__filename);

export function errorMiddleware(err: any, req: Request, res: Response, next: NextFunction) {
  logger.error(err);
  res.status(500).send({ error: "Something went wrong!" });
}
