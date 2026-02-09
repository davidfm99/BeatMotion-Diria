import zod from "zod";

const timestampSchema = zod
  .any()
  .nullable()
  .transform((value) => {
    if (!value) return null;
    if (value instanceof Date) return value;
    if (value.toDate) return value.toDate();
    if (
      typeof value === "object" &&
      "seconds" in value &&
      "nanoseconds" in value
    ) {
      return new Date(value.seconds * 1000 + value.nanoseconds / 1_000_000);
    }
    if (typeof value === "string") return new Date(value);
    return null;
  });

export const questionTypeSchema = zod.enum([
  "rating",
  "multiple_choice",
  "text",
]);

export type QuestionType = zod.infer<typeof questionTypeSchema>;

export const surveyQuestionSchema = zod.object({
  id: zod.string(),
  questionText: zod.string().min(3).max(500),
  questionType: questionTypeSchema,
  required: zod.boolean().default(true),
  options: zod.array(zod.string()).optional(),
  order: zod.number().int().min(0),
});

export type SurveyQuestion = zod.infer<typeof surveyQuestionSchema>;

export const surveySchema = zod.object({
  id: zod.string(),
  title: zod.string().min(3).max(200),
  description: zod.string().max(1000).optional(),
  courseId: zod.string(),
  courseName: zod.string().optional(),
  isActive: zod.boolean().default(true),
  questions: zod.array(surveyQuestionSchema).min(1),
  createdBy: zod.string(),
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
  expiresAt: timestampSchema.nullable().optional(),
  isDeleted: zod.boolean(),
});

export type Survey = zod.infer<typeof surveySchema>;

export const surveyListSchema = zod.array(surveySchema);

export const questionResponseSchema = zod.object({
  questionId: zod.string(),
  questionText: zod.string(),
  questionType: questionTypeSchema,
  response: zod.union([zod.number().int().min(1).max(5), zod.string()]),
});

export type QuestionResponse = zod.infer<typeof questionResponseSchema>;

export const surveyResponseSchema = zod.object({
  id: zod.string(),
  surveyId: zod.string(),
  userId: zod.string(),
  userName: zod.string().optional(),
  courseId: zod.string(),
  responses: zod.array(questionResponseSchema),
  submittedAt: timestampSchema,
  completionTimeSeconds: zod.number().optional(),
});

export type SurveyResponse = zod.infer<typeof surveyResponseSchema>;

export const surveyResponseListSchema = zod.array(surveyResponseSchema);

export const surveyResultsSchema = zod.object({
  surveyId: zod.string(),
  totalResponses: zod.number().int().min(0),
  averageRatings: zod.record(zod.string(), zod.number()),
  responseDistribution: zod.record(
    zod.string(),
    zod.record(zod.string(), zod.number()),
  ),
  textResponses: zod.record(zod.string(), zod.array(zod.string())),
  completionRate: zod.number().min(0).max(100),
});

export type SurveyResults = zod.infer<typeof surveyResultsSchema>;

export const quickSurveyTemplate = {
  satisfactionBasic: {
    title: "Encuesta de Satisfacción Básica",
    description: "Ayúdanos a mejorar tu experiencia en el curso",
    questions: [
      {
        id: "q1",
        questionText: "¿Qué tan satisfecho estás con el curso en general?",
        questionType: "rating" as QuestionType,
        required: true,
        order: 0,
      },
      {
        id: "q2",
        questionText: "¿Recomendarías este curso a otros?",
        questionType: "multiple_choice" as QuestionType,
        required: true,
        options: [
          "Definitivamente sí",
          "Probablemente sí",
          "No estoy seguro",
          "Probablemente no",
          "Definitivamente no",
        ],
        order: 1,
      },
      {
        id: "q3",
        questionText: "¿Qué podemos mejorar?",
        questionType: "text" as QuestionType,
        required: false,
        order: 2,
      },
    ],
  },
  instructorEvaluation: {
    title: "Evaluación del Instructor",
    description: "Tu opinión nos ayuda a mejorar la calidad de enseñanza",
    questions: [
      {
        id: "q1",
        questionText: "Calidad de la enseñanza",
        questionType: "rating" as QuestionType,
        required: true,
        order: 0,
      },
      {
        id: "q2",
        questionText: "Claridad en las explicaciones",
        questionType: "rating" as QuestionType,
        required: true,
        order: 1,
      },
      {
        id: "q3",
        questionText: "Disponibilidad para resolver dudas",
        questionType: "rating" as QuestionType,
        required: true,
        order: 2,
      },
      {
        id: "q4",
        questionText: "Comentarios adicionales",
        questionType: "text" as QuestionType,
        required: false,
        order: 3,
      },
    ],
  },
  courseContent: {
    title: "Evaluación del Contenido",
    description: "Cuéntanos sobre el material y contenido del curso",
    questions: [
      {
        id: "q1",
        questionText: "El contenido cumplió con tus expectativas",
        questionType: "rating" as QuestionType,
        required: true,
        order: 0,
      },
      {
        id: "q2",
        questionText: "Nivel de dificultad del contenido",
        questionType: "multiple_choice" as QuestionType,
        required: true,
        options: ["Muy fácil", "Fácil", "Adecuado", "Difícil", "Muy difícil"],
        order: 1,
      },
      {
        id: "q3",
        questionText: "¿Qué tema te gustó más?",
        questionType: "text" as QuestionType,
        required: false,
        order: 2,
      },
    ],
  },
};
