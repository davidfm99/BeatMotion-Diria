import { firestore } from "@/firebaseConfig";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  collection,
  doc,
  addDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { Alert } from "react-native";
import {
  surveyResponseSchema,
  surveyResponseListSchema,
  SurveyResponse,
  QuestionResponse,
  SurveyResults,
} from "./surveySchema";


type SubmitSurveyResponseInput = {
  surveyId: string;
  userId: string;
  courseId: string;
  responses: QuestionResponse[];
  completionTimeSeconds?: number;
};

const submitSurveyResponse = async (input: SubmitSurveyResponseInput) => {
  const responseData = {
    surveyId: input.surveyId,
    userId: input.userId,
    courseId: input.courseId,
    responses: input.responses,
    submittedAt: serverTimestamp(),
    completionTimeSeconds: input.completionTimeSeconds || null,
  };

  const docRef = await addDoc(
    collection(firestore, "surveyResponses"),
    responseData
  );
  return docRef.id;
};

export const useSubmitSurveyResponse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: submitSurveyResponse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["surveyResponses"] });
      queryClient.invalidateQueries({ queryKey: ["surveys", "available"] });
      Alert.alert(
        "¡Gracias!",
        "Tu respuesta ha sido enviada correctamente. Tu opinión nos ayuda a mejorar."
      );
    },
    onError: (error: any) => {
      console.error("Error submitting survey response:", error);
      Alert.alert("Error", "No se pudo enviar tu respuesta. Intenta de nuevo.");
    },
  });
};

const fetchSurveyResponses = async (surveyId: string) => {
  try {
    const q = query(
      collection(firestore, "surveyResponses"),
      where("surveyId", "==", surveyId)
    );
    const snapshot = await getDocs(q);

    const responses = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return surveyResponseListSchema.parse(responses);
  } catch (error) {
    console.error("Error fetching survey responses:", error);
    throw error;
  }
};

export const useSurveyResponses = (surveyId: string) => {
  return useQuery({
    queryKey: ["surveyResponses", surveyId],
    queryFn: () => fetchSurveyResponses(surveyId),
    enabled: !!surveyId,
    staleTime: 1000 * 60 * 2,
  });
};

const checkIfUserResponded = async (surveyId: string, userId: string) => {
  try {
    const q = query(
      collection(firestore, "surveyResponses"),
      where("surveyId", "==", surveyId),
      where("userId", "==", userId)
    );
    const snapshot = await getDocs(q);
    return !snapshot.empty;
  } catch (error) {
    console.error("Error checking user response:", error);
    return false;
  }
};

export const useCheckUserResponse = (surveyId: string, userId: string) => {
  return useQuery({
    queryKey: ["surveyResponse", "check", surveyId, userId],
    queryFn: () => checkIfUserResponded(surveyId, userId),
    enabled: !!surveyId && !!userId,
  });
};


const calculateSurveyResults = async (
  surveyId: string
): Promise<SurveyResults> => {
  try {
    const responses = await fetchSurveyResponses(surveyId);

    if (responses.length === 0) {
      return {
        surveyId,
        totalResponses: 0,
        averageRatings: {},
        responseDistribution: {},
        textResponses: {},
        completionRate: 0,
      };
    }

    const averageRatings: Record<string, number> = {};
    const responseDistribution: Record<string, Record<string, number>> = {};
    const textResponses: Record<string, string[]> = {};

    responses.forEach((response) => {
      response.responses.forEach((qResponse) => {
        const { questionId, questionType, response: answer } = qResponse;

        if (questionType === "rating") {
          if (!averageRatings[questionId]) {
            averageRatings[questionId] = 0;
          }
          averageRatings[questionId] += Number(answer);
        } else if (questionType === "multiple_choice") {
          if (!responseDistribution[questionId]) {
            responseDistribution[questionId] = {};
          }
          const option = String(answer);
          responseDistribution[questionId][option] =
            (responseDistribution[questionId][option] || 0) + 1;
        } else if (questionType === "text") {
          if (!textResponses[questionId]) {
            textResponses[questionId] = [];
          }
          textResponses[questionId].push(String(answer));
        }
      });
    });

    Object.keys(averageRatings).forEach((questionId) => {
      averageRatings[questionId] =
        Math.round((averageRatings[questionId] / responses.length) * 10) / 10;
    });

    const completionRate = 100;

    return {
      surveyId,
      totalResponses: responses.length,
      averageRatings,
      responseDistribution,
      textResponses,
      completionRate,
    };
  } catch (error) {
    console.error("Error calculating survey results:", error);
    throw error;
  }
};

export const useSurveyResults = (surveyId: string) => {
  return useQuery({
    queryKey: ["surveyResults", surveyId],
    queryFn: () => calculateSurveyResults(surveyId),
    enabled: !!surveyId,
    staleTime: 1000 * 60 * 5,
  });
};


const fetchResponsesByCourse = async (courseId: string) => {
  try {
    const q = query(
      collection(firestore, "surveyResponses"),
      where("courseId", "==", courseId)
    );
    const snapshot = await getDocs(q);

    const responses = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return surveyResponseListSchema.parse(responses);
  } catch (error) {
    console.error("Error fetching responses by course:", error);
    throw error;
  }
};

export const useResponsesByCourse = (courseId: string) => {
  return useQuery({
    queryKey: ["surveyResponses", courseId],
    queryFn: () => fetchResponsesByCourse(courseId),
    enabled: !!courseId,
    staleTime: 1000 * 60 * 5,
  });
};
