import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRef } from "react";
import { MatchesScoreFirestore, MatchScoreFirestore, matchScoreFirestoreSchema } from "./schema";
import { clientEnv } from "@/env";
import { addDoc, arrayUnion, collection, doc, getDocs, onSnapshot, query, updateDoc, where, writeBatch } from "firebase/firestore";
import { getAuth, signInAnonymously } from "firebase/auth";

import { firestoreDb } from "@/utils/firebase";
import {HmacSHA256} from "crypto-js";

const collectionName = clientEnv.FIREBASE_SCORE_COLLECTION;


const useMatchScore = (
  matchUuid: string,
  onUpdated?: (messages: MatchScoreFirestore[]) => void,
  disabled?: boolean
) => {
  if (disabled) {
    return {
      data: [],
      isLoading: false,
      unsubscribe: () => { },
      fetchScores: async (): Promise<MatchScoreFirestore[]> => [], // Return empty array if disabled
    };
  }

  const queryClient = useQueryClient();
  const unsubscribeRef = useRef<(() => void) | undefined>(undefined);
  const auth = getAuth();
  signInAnonymously(auth);
  // only fetch scores. will triggered manually
  const fetchScores = async (): Promise<MatchScoreFirestore[]> => {
    const messagesQuery = query(
      collection(firestoreDb, collectionName),
      where("match_uuid", "==", matchUuid)
    );
    
    try {
      
      const querySnapshot = await getDocs(messagesQuery);
      const messages: MatchScoreFirestore[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        data.refId = doc.id;
        const parsedMessage = matchScoreFirestoreSchema.safeParse(data);

        if (parsedMessage.success) {
          messages.push(parsedMessage.data);
        } else {
          console.error("Invalid message data:", parsedMessage.error);
        }
      });

      queryClient.setQueryData(["matchScore", matchUuid], messages);
      if (onUpdated) onUpdated(messages);
      
      return messages;
    } catch (error) {
      console.error("Error fetching messages:", error);
      throw error;
    }
  };
  // listen score update
  const queryResult = useQuery<MatchScoreFirestore[], Error>(
    ["matchScore", matchUuid],
    () =>
      new Promise((resolve, reject) => {
        const messagesQuery = query(
          collection(firestoreDb, collectionName),
          where("match_uuid", "==", matchUuid)
        );
        
        const unsubscribe = onSnapshot(
          messagesQuery,
          (querySnapshot) => {
            let messages: MatchScoreFirestore[] = [];
            querySnapshot.forEach((doc) => {
              let data = doc.data();
              data.refId = doc.id;
              const parsedMessage = matchScoreFirestoreSchema.safeParse(data);

              if (parsedMessage.success) {
                messages = messages.concat([parsedMessage.data]);
              } else {
                console.error("Invalid message data:", parsedMessage.error);
              }
            });
            queryClient.setQueryData(["matchScore", matchUuid], messages);
            resolve(messages);
            if (onUpdated) {
              onUpdated(messages);
            }
          },
          (error) => {
            console.error("Error fetching messages:", error);
            reject(error);
          },
        );

        unsubscribeRef.current = unsubscribe;
      }),
    {
      staleTime: Infinity,
      refetchOnWindowFocus: true,
      refetchOnMount: "always",
    },
  );

  const stopListening = () => {
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = undefined;
    }
  };

  return { 
    ...queryResult, 
    data: queryResult.data || [],
    isLoading: queryResult.isLoading,
    unsubscribe: stopListening,
    fetchScores
  };
};

const useMatchesScore = (
  matchesUuid: string[],
  onUpdated?: (messages: MatchesScoreFirestore[]) => void,
  disabled?: boolean
) => {
  if (disabled) {
    return {
      data: [],
      isLoading: false,
      unsubscribe: () => { },
      fetchScores: async (): Promise<MatchesScoreFirestore[]> => [], // Return empty array if disabled
    };
  }

  const queryClient = useQueryClient();
  const unsubscribeRef = useRef<(() => void) | undefined>(undefined);
  const auth = getAuth();
  signInAnonymously(auth);
  // only fetch scores. will triggered manually
  const fetchScores = async (): Promise<MatchesScoreFirestore[]> => {
    const messagesQuery = query(
      collection(firestoreDb, collectionName),
      where("match_uuid", "in", matchesUuid)
    );
    
    try {
      
      const querySnapshot = await getDocs(messagesQuery);
      let messages: MatchesScoreFirestore[] = matchesUuid.map((matchUuid) => ({
        match_uuid: matchUuid,
        matchScore: [] as MatchScoreFirestore[]
      }));
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        data.refId = doc.id;
        const parsedMessage = matchScoreFirestoreSchema.safeParse(data);
        const msgIndex = messages.findIndex((msg) => msg.match_uuid === data.match_uuid);

        if (parsedMessage.success) {
          messages[msgIndex].matchScore.push(parsedMessage.data);
        } else {
          console.error("Invalid message data:", parsedMessage.error);
        }
      });
      messages = messages.map((msg) => ({
        ...msg,
        matchScore: msg.matchScore.sort((a, b) => a.set - b.set)
      }));
      
      queryClient.setQueryData(["matchesScore", matchesUuid], messages);
      if (onUpdated) onUpdated(messages);
      
      return messages;
    } catch (error) {
      console.error("Error fetching messages:", error);
      throw error;
    }
  };
  // listen score update
  const queryResult = useQuery<MatchesScoreFirestore[], Error>(
    ["matchesScore", matchesUuid],
    () =>
      new Promise((resolve, reject) => {
        const messagesQuery = query(
          collection(firestoreDb, collectionName),
          where("match_uuid", "in", matchesUuid)
        );
        
        const unsubscribe = onSnapshot(
          messagesQuery,
          (querySnapshot) => {
            let messages: MatchesScoreFirestore[] = matchesUuid.map((matchUuid) => ({
              match_uuid: matchUuid,
              matchScore: [] as MatchScoreFirestore[]
            }));
            querySnapshot.forEach((doc) => {
              let data = doc.data();
              data.refId = doc.id;
              const parsedMessage = matchScoreFirestoreSchema.safeParse(data);
              const msgIndex = messages.findIndex((msg) => msg.match_uuid === data.match_uuid);
              if (parsedMessage.success) {
                messages[msgIndex].matchScore = messages[msgIndex].matchScore.concat([parsedMessage.data]);
              } else {
                console.error("Invalid message data:", parsedMessage.error);
              }
            });
            messages = messages.map((msg) => ({
              ...msg,
              matchScore: msg.matchScore.sort((a, b) => a.set - b.set)
            }));

            queryClient.setQueryData(["matchesScore", matchesUuid], messages);
            resolve(messages);
            if (onUpdated) {
              onUpdated(messages);
            }
          },
          (error) => {
            console.error("Error fetching messages:", error);
            reject(error);
          },
        );

        unsubscribeRef.current = unsubscribe;
      }),
    {
      staleTime: Infinity,
      refetchOnWindowFocus: true,
      refetchOnMount: "always",
    },
  );

  const stopListening = () => {
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = undefined;
    }
  };

  return { 
    ...queryResult, 
    data: queryResult.data || [],
    isLoading: queryResult.isLoading,
    unsubscribe: stopListening,
    fetchScores
  };
};
const useTournamentScore = (
  tournamentUuid: string,
  onUpdated?: (messages: MatchScoreFirestore[]) => void, // Optional callback for updates
  disabled?: boolean
) => {  
  if (disabled) {
    return {
      data: [],
      unsubscribe: () => { },
    };
  }
  const queryClient = useQueryClient();
  const unsubscribeRef = useRef<(() => void) | undefined>(undefined); // Use useRef to store unsubscribe function
  const auth = getAuth();
  signInAnonymously(auth);

  const queryResult = useQuery<MatchScoreFirestore[], Error>(
    ["matchScore", tournamentUuid],
    () =>
      new Promise((resolve, reject) => {
        const messagesQuery = query(
          collection(firestoreDb, collectionName),
          where("tournament_uuid", "==", tournamentUuid)
        );
        // Set up Firestore real-time listener with onSnapshot
        const unsubscribe = onSnapshot(
          messagesQuery,
          (querySnapshot) => {
            let messages: MatchScoreFirestore[] = [];
            querySnapshot.forEach((doc) => {
              let data = doc.data();
              data.refId = doc.id;
              const parsedMessage = matchScoreFirestoreSchema.safeParse(data);

              if (parsedMessage.success) {
                messages = messages.concat([parsedMessage.data]);
              } else {
                console.error("Invalid message data:", parsedMessage.error);
              }
            });
            // Also, update the cache for real-time updates
            queryClient.setQueryData(["matchScore", tournamentUuid], messages);
            // Resolve with the current messages to update React Query cache
            resolve(messages);
            if (onUpdated) {
              onUpdated(messages);
            }
          },
          (error) => {
            console.error("Error fetching messages:", error);
            reject(error);
          },
        );

        // Cleanup function to unsubscribe from Firestore listener when the component is unmounted
        unsubscribeRef.current = unsubscribe;
      }),
    {
      staleTime: Infinity, // Keep the data fresh due to Firestore's real-time updates
      refetchOnWindowFocus: true, // Prevent refetching on window focus since Firestore handles it
      refetchOnMount: "always", // Always refetch on mount to sync with the latest data
      onSuccess: (data) => {},
    },
  );
  const stopListening = () => {
    if (unsubscribeRef.current) {
      unsubscribeRef.current(); // Unsubscribe from Firestore updates
      unsubscribeRef.current = undefined; // Reset the ref
    }
  };

  return { ...queryResult, unsubscribe: stopListening };
};
const useAddScore = () => {
  return useMutation(
    async ({
      newMatchData,
    }: {
      newMatchData: MatchScoreFirestore;
      }) : Promise<MatchScoreFirestore> => {
      // add new doc based on new match
      const docRef = await addDoc(
        collection(firestoreDb, collectionName),
        newMatchData,
      );
      return { ...newMatchData, refId: docRef.id }; // Return the document ID after it's created
    },
  );
};
const useAddScores = () => {
  return useMutation(
    async ({
      newMatchDataArray,
    }: {
      newMatchDataArray: MatchScoreFirestore[];
    }): Promise<MatchScoreFirestore[]> => {
      // Create a new batch
      const batch = writeBatch(firestoreDb);
      
      // Array to store the results with their IDs
      const results: MatchScoreFirestore[] = [];
      
      // Add each document to the batch
      newMatchDataArray.forEach((newMatchData) => {
        const docRef = doc(collection(firestoreDb, collectionName));
        batch.set(docRef, newMatchData);
        results.push({ ...newMatchData, refId: docRef.id });
      });
      
      // Commit the batch
      await batch.commit();
      
      // Return all documents with their IDs
      return results;
    },
  );
};

const useUpdateScore = () => {
  return useMutation(
    async ({
      refId,
      newMatchData,
    }: {
      refId: string,
      newMatchData: MatchScoreFirestore;
      }) => {
      // update doc based on refId
      const docRef = doc(firestoreDb, collectionName, refId);
      await updateDoc(docRef, newMatchData);
      return newMatchData;
    },
  );
}

const useCreateDocMutation = () => {
  return useMutation(async (newDocumentData: MatchScoreFirestore) => {
    const docRef = await addDoc(
      collection(firestoreDb, collectionName),
      newDocumentData,
    );
    return docRef.id; // Return the document ID after it's created
  });
};
const generateHmac = () => {
  const timestamp = Math.floor(Date.now() / 1000); // Current Unix time (seconds)
  return {
    hmac: HmacSHA256(timestamp.toString(), clientEnv.SECRET_KEY).toString(),
    timestamp: timestamp
  };
}
export { useMatchScore, useMatchesScore, useTournamentScore, useAddScore, useAddScores, useUpdateScore, useCreateDocMutation, generateHmac }