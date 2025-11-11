import { useCourseMemberByUser } from "@/hooks/courseMember/useCourseMemberByUser";
import { useCreateFCMToken } from "@/hooks/notifications/useCreateFCMToken";
import { useActiveUser } from "@/hooks/user/UseActiveUser";
import { Redirect } from "expo-router";
import { getAuth } from "firebase/auth";
import { useEffect } from "react";

const App = () => {
  const { user } = useActiveUser();
  const createFCMTokenMutation = useCreateFCMToken();
  const useCourseMemberByUserQuery = useCourseMemberByUser(user?.uid || "");

  useEffect(() => {
    const auth = getAuth();
    const subscriber = auth.onIdTokenChanged(async (userLogged) => {
      console.log("Auth state changed. User:", userLogged);
      if (userLogged && user) {
        createFCMTokenMutation.mutate({
          userId: userLogged?.uid,
          role: user.role,
          courseMembers: useCourseMemberByUserQuery.data ?? ([] as any[]),
        });
      } else {
        //TODO see if this is necessary
        console.log("Usuario deslogueado.");
        // Opcional: limpiar tokens de este dispositivo en Firestore si no hay usuario logueado
        // Si el dispositivo ya no tiene un usuario logueado asociado, podrías querer borrar su token.
        // Pero esto puede ser complejo si el token debe persistir para notificaciones anónimas.
        // Generalmente, se asume que un token de FCM está ligado al dispositivo, no al usuario logueado.
        // Si no hay un usuario, el token no tendrá un userId asociado en fcmTokens.
      }
    });

    return subscriber;
  }, [user, useCourseMemberByUserQuery.data, createFCMTokenMutation]);

  return (
    <>
      {user ? (
        <Redirect href="/private/home" />
      ) : (
        <Redirect href="/public/login" />
      )}
    </>
  );
};

export default App;
