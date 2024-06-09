export type MessageObjectType = {
  message_id: number;
  from: {
    id: number;
    is_bot: boolean;
    first_name: string;
    username: string;
    language_code: string;
  };
  chat: {
    id: number;
    first_name: string;
    last_name?: string; // Optional for chats with only first name
    username?: string; // Optional for chats without username
    type: 'private' | string; // Can potentially have other chat types
  };
  date: number;
  text: string;
};
