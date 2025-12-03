import { firestore } from "@/firebaseConfig";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { Alert } from "react-native";
import {
  surveySchema,
  surveyListSchema,
  Survey,
  SurveyQuestion,
} from "./surveySchema";


type CreateSurveyInput = {
  title: string;
  description?: string;
  courseId: string;
  questions: Omit<SurveyQuestion, "id">[];
  createdBy: string;
  expiresAt?: Date | null;
};

const createSurvey = async (input: CreateSurveyInput) => {
  const questionsWithIds = input.questions.map((q, index) => ({
    ...q,
    id: `q${index + 1}_${Date.now()}`,
  }));

  const surveyData = {
    title: input.title.trim(),
    description: input.description?.trim() || null,
    courseId: input.courseId,
    questions: questionsWithIds,
    isActive: true,
    createdBy: input.createdBy,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    expiresAt: input.expiresAt ? Timestamp.fromDate(input.expiresAt) : null,
  };

  const docRef = await addDoc(collection(firestore, "surveys"), surveyData);
  return docRef.id;
};

export const useCreateSurvey = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createSurvey,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["surveys"] });
      Alert.alert("Éxito", "Encuesta creada correctamente.");
    },
    onError: (error: any) => {
      console.error("Error creating survey:", error);
      Alert.alert("Error", "No se pudo crear la encuesta.");
    },
  });
};

const fetchSurveys = async () => {
  try {
    const snapshot = await getDocs(collection(firestore, "surveys"));
    const surveys = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return surveyListSchema.parse(surveys);
  } catch (error) {
    console.error("Error fetching surveys:", error);
    throw error;
  }
};

export const useSurveys = () => {
  return useQuery({
    queryKey: ["surveys"],
    queryFn: fetchSurveys,
    staleTime: 1000 * 60 * 5,
  });
};

const fetchSurveysByCourse = async (courseId: string) => {
  try {
    const q = query(
      collection(firestore, "surveys"),
      where("courseId", "==", courseId),
      orderBy("createdAt", "desc")
    );
    const snapshot = await getDocs(q);
    const surveys = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return surveyListSchema.parse(surveys);
  } catch (error) {
    console.error("Error fetching surveys by course:", error);
    throw error;
  }
};

export const useSurveysByCourse = (courseId: string) => {
  return useQuery({
    queryKey: ["surveys", courseId],
    queryFn: () => fetchSurveysByCourse(courseId),
    enabled: !!courseId,
    staleTime: 1000 * 60 * 5,
  });
};

const fetchAvailableSurveys = async (userId: string, courseIds: string[]) => {
  if (courseIds.length === 0) return [];

  try {
    const q = query(
      collection(firestore, "surveys"),
      where("courseId", "in", courseIds),
      where("isActive", "==", true)
    );
    const snapshot = await getDocs(q);

    const responsesQuery = query(
      collection(firestore, "surveyResponses"),
      where("userId", "==", userId)
    );
    const responsesSnapshot = await getDocs(responsesQuery);
    const answeredSurveyIds = new Set(
      responsesSnapshot.docs.map((doc) => doc.data().surveyId)
    );

    const now = new Date();
    const surveys = snapshot.docs
      .map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      .filter((survey: any) => {
        if (answeredSurveyIds.has(survey.id)) return false;

        if (survey.expiresAt) {
          const expiresAt =
            survey.expiresAt.toDate?.() || new Date(survey.expiresAt);
          if (expiresAt < now) return false;
        }

        return true;
      });

    return surveyListSchema.parse(surveys);
  } catch (error) {
    console.error("Error fetching available surveys:", error);
    throw error;
  }
};

export const useAvailableSurveys = (userId: string, courseIds: string[]) => {
  return useQuery({
    queryKey: ["surveys", "available", userId, courseIds],
    queryFn: () => fetchAvailableSurveys(userId, courseIds),
    enabled: !!userId && courseIds.length > 0,
    staleTime: 1000 * 60 * 3,
  });
};

const fetchSurveyById = async (surveyId: string) => {
  try {
    const docRef = doc(firestore, "surveys", surveyId);
    const snapshot = await getDoc(docRef);

    if (!snapshot.exists()) {
      throw new Error("Encuesta no encontrada");
    }

    const survey = {
      id: snapshot.id,
      ...snapshot.data(),
    };

    return surveySchema.parse(survey);
  } catch (error) {
    console.error("Error fetching survey:", error);
    throw error;
  }
};

export const useSurveyById = (surveyId: string) => {
  return useQuery({
    queryKey: ["survey", surveyId],
    queryFn: () => fetchSurveyById(surveyId),
    enabled: !!surveyId,
  });
};

type UpdateSurveyInput = {
  surveyId: string;
  title?: string;
  description?: string;
  questions?: SurveyQuestion[];
  isActive?: boolean;
  expiresAt?: Date | null;
};

const updateSurvey = async (input: UpdateSurveyInput) => {
  const { surveyId, ...updates } = input;

  const updateData: any = {
    updatedAt: serverTimestamp(),
  };

  if (updates.title) updateData.title = updates.title.trim();
  if (updates.description !== undefined)
    updateData.description = updates.description?.trim() || null;
  if (updates.questions) updateData.questions = updates.questions;
  if (updates.isActive !== undefined) updateData.isActive = updates.isActive;
  if (updates.expiresAt !== undefined) {
    updateData.expiresAt = updates.expiresAt
      ? Timestamp.fromDate(updates.expiresAt)
      : null;
  }

  const docRef = doc(firestore, "surveys", surveyId);
  await updateDoc(docRef, updateData);
};

export const useUpdateSurvey = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateSurvey,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["surveys"] });
      Alert.alert("Éxito", "Encuesta actualizada correctamente.");
    },
    onError: (error: any) => {
      console.error("Error updating survey:", error);
      Alert.alert("Error", "No se pudo actualizar la encuesta.");
    },
  });
};

const deleteSurvey = async (surveyId: string) => {
  const docRef = doc(firestore, "surveys", surveyId);
  await deleteDoc(docRef);
};

export const useDeleteSurvey = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteSurvey,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["surveys"] });
      Alert.alert("Éxito", "Encuesta eliminada correctamente.");
    },
    onError: (error: any) => {
      console.error("Error deleting survey:", error);
      Alert.alert("Error", "No se pudo eliminar la encuesta.");
    },
  });
};

const toggleSurveyActive = async (surveyId: string, isActive: boolean) => {
  const docRef = doc(firestore, "surveys", surveyId);
  await updateDoc(docRef, {
    isActive: !isActive,
    updatedAt: serverTimestamp(),
  });
};

export const useToggleSurveyActive = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ surveyId, isActive }: { surveyId: string; isActive: boolean }) =>
      toggleSurveyActive(surveyId, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["surveys"] });
    },
  });
};
