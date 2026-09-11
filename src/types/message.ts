// types/message.ts
// Definisi tipe data pesan sesuai struktur Firestore

export interface Message {
  id: string;           // auto-generated document ID
  sender_name: string;
  sender_number: string;
  group_name: string;
  group_id?: string;
  content: string | null;
  media_url: string | null;
  media_type: "text" | "image" | "document" | "video" | "audio" | "other";
  timestamp: Date;
  created_at: Date;
}
