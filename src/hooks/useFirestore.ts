import { useState, useEffect } from 'react';
import { DocumentData } from 'firebase/firestore';
import { FirestoreService } from '@/services/firestoreService';

export function useFirestoreCollection(
  collectionName: string,
  filters?: { field: string; operator: any; value: any }[]
) {
  const [documents, setDocuments] = useState<DocumentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const unsubscribe = FirestoreService.subscribeToCollection(
      collectionName,
      (docs) => {
        setDocuments(docs);
        setLoading(false);
      },
      filters
    );

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [collectionName, JSON.stringify(filters)]);

  const addDocument = async (data: any) => {
    try {
      setError(null);
      const docId = await FirestoreService.createDocument(collectionName, data);
      return docId;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const updateDocument = async (docId: string, data: any) => {
    try {
      setError(null);
      await FirestoreService.updateDocument(collectionName, docId, data);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const deleteDocument = async (docId: string) => {
    try {
      setError(null);
      await FirestoreService.deleteDocument(collectionName, docId);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  return {
    documents,
    loading,
    error,
    addDocument,
    updateDocument,
    deleteDocument
  };
}

export function useFirestoreDocument(collectionName: string, docId: string) {
  const [document, setDocument] = useState<DocumentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!docId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const unsubscribe = FirestoreService.subscribeToDocument(
      collectionName,
      docId,
      (doc) => {
        setDocument(doc);
        setLoading(false);
      }
    );

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [collectionName, docId]);

  return {
    document,
    loading,
    error
  };
}