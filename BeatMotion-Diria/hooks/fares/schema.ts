import zod from "zod";

const FareSchema = zod.array(
  zod.object({
    id: zod.string(),
    description: zod.string(),
    fare: zod.number(),
    type: zod.string(),
    numCourse: zod.number(),
  })
);

export { FareSchema };
